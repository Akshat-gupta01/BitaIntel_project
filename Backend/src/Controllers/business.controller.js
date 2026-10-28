const { business_profiles, User, inquiries, complaints } = require('../models');
const { Op } = require('sequelize');

function getBusinessLevel(status, score) {
    if (!status || status.toLowerCase() !== 'approved') {
        return 0; // Agar approved nahi hai toh level 0
    }
    if (score >= 85) return 4;
    if (score >= 80) return 3;
    if (score >= 70) return 2;
    if (score >= 60) return 1;
    return 0;
}

async function getAllBusinesses(req, res) {
    try {
        // Sirf wahi profiles aayengi jo submit ho chuki hain
        const profiles = await business_profiles.findAll({
            attributes: ['id', 'business_name', 'industry', 'city', 'state', 'score', 'level', 'verification_status'],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            data: profiles
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}


// Admin manually score aur status update karega
async function updateVendorScoreAndStatus(req, res) {
    try {
        const id=req.params.id;
        const { score, status, rejection_reason } = req.body;

        const profile = await business_profiles.findByPk(id);
        if (!profile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        // Score validation (0 se 100 ke beech hona chahiye) - Admin custom update karega
        if (score !== undefined) {
            const parsedScore = parseInt(score);
            if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
                return res.status(400).json({ message: 'Score must be a number between 0 and 100' });
            }
            profile.score = parsedScore;
        }

        // Status update (approved, rejected, pending, under_review, clarification_required, suspended)
        if (status) {
            profile.verification_status = status;
        }

        if (rejection_reason !== undefined) {
            profile.rejection_reason = rejection_reason;
        }

        // Status aur Score ke hisaab se Level automatically calculate hoga
        profile.level = getBusinessLevel(profile.verification_status, profile.score);

        await profile.save();

        return res.status(200).json({
            message: 'Vendor score and status updated successfully',
            data: {
                id: profile.id,
                business_name: profile.business_name,
                score: profile.score,
                level: profile.level,
                status: profile.verification_status
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


async function verificationQueue(req, res) {
    try {
        // Sirf wahi profiles aayengi jo submit ho chuki hain
        const profiles = await business_profiles.findAll({
            attributes: ['id', 'business_name', 'gst_number', 'verification_status'],
            where: {
                verification_status: {
                    [Op.in]: ['pending', 'under_review', 'clarification_required']
                }
            },
            order: [['createdAt', 'DESC']]  
        });

        return res.status(200).json({
            data: profiles
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


async function runMockGSTCheck(req, res) {
    try {
        const id = req.params.id;

        const profile = await business_profiles.findByPk(id);
        if (!profile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        // Database se gst_number lein (ya req.body se agar alag bheja ho)
        const gstin = req.body?.gstin || profile.gst_number;

        if (!gstin || typeof gstin !== 'string') {
            return res.status(400).json({ 
                status: 'error', 
                message: 'No GST number provided or registered for this business' 
            });
        }

        const trimmedGst = gstin.trim().toUpperCase();

        // 15 Character GST regex validation
        const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        const isValid = gstinPattern.test(trimmedGst);

        return res.status(200).json({
            status: isValid ? 'valid' : 'invalid',
            message: isValid ? 'GSTIN verified successfully' : 'Invalid GSTIN format',
            data: {
                id: profile.id,
                business_name: profile.business_name,
                gstin: trimmedGst,
                is_valid: isValid,
                state_code: isValid ? trimmedGst.substring(0, 2) : null,
                pan_number: isValid ? trimmedGst.substring(2, 12) : null
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


async function documentReview(req, res) {
    try {
        const profiles = await business_profiles.findAll({
        attributes: ['id', 'business_name', 'documents_url', 'verification_status'],
        where: {
            verification_status: {
                [Op.in]: ['pending', 'under_review', 'clarification_required']
            }
        },
        order: [['createdAt', 'DESC']]
});

        return res.status(200).json({
            data: profiles
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


async function SubmitInquiry(req,res){
    try {
        const {business_id,name,email,phone,subject,message}=req.body;

        if(!business_id || !name || !email || !phone || !subject || !message){
            return res.status(400).json({message:"All fields are required"})
        }
        const inquiry =await inquiries.create({
            business_id,
            name,
            email,
            phone,
            subject,
            message
        });
        return res.status(201).json({
            message:"Inquiry submitted successfully",
            data:inquiry
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
        
    }
}

async function GetAllInquiries(req,res){
    try {
       const allInquiries = await inquiries.findAll({
            include: [{
                model: business_profiles,
                as: 'business',
                attributes: ['id', 'business_name']
            }],
            order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
        data: allInquiries
    });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
}


async function GetAllComplaints(req, res) {
    try {
        const allComplaints = await complaints.findAll({
            include: [{
                model: business_profiles,
                as: 'business',
                attributes: ['id', 'business_name']
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            data: allComplaints
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
}   


async function getReportStats(req,res){
    try {
        const totalBusinesses = await business_profiles.count();
        const activeBusinesses = await business_profiles.count({
            where: { status: 'active' }
        });
          const verifiedBusinesses = await business_profiles.count({
            where: {
                verification_status: 'Approved'
            }
        });
         const avgScoreResult = await business_profiles.findOne({
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('score')), 'avgScore']
            ],
            raw: true
        });

         const avgScore = avgScoreResult?.avgScore ? Math.round(Number(avgScoreResult.avgScore)) : 0;

         const totalInquiries = await inquiries.count();
        return res.status(200).json({
            data: {
                totalBusinesses,
                activeBusinesses,
                verifiedBusinesses,
                avgScore,
                totalInquiries,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
}



module.exports = { 
    getAllBusinesses, 
    updateVendorScoreAndStatus, 
    verificationQueue, 
    runMockGSTCheck ,
    documentReview,
    SubmitInquiry,
    GetAllInquiries,
    GetAllComplaints,
    getReportStats
};
