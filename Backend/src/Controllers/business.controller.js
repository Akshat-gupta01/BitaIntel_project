const { business_profiles, User, inquiries, complaints, auditlog,platform_settings,scoringconfiguration,notification } = require('../models');
const { Op,Sequelize } = require('sequelize');
const { recordAuditLog } = require('../services/auditLogger.service');

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
            const ALLOWED_STATUSES = ['pending', 'under_review', 'clarification_required', 'approved', 'rejected', 'suspended'];
            if (!ALLOWED_STATUSES.includes(status)) {
                return res.status(400).json({
                    message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`
                });
            }
            profile.verification_status = status;

            // Agar status approved hai toh purana rejection reason clear karo
            if (status === 'approved') {
                profile.rejection_reason = null;
                profile.clarification_notes = null;
            }
        }

        if (rejection_reason !== undefined) {
            profile.rejection_reason = rejection_reason;
        }

        // Status aur Score ke hisaab se Level automatically calculate hoga
        profile.level = getBusinessLevel(profile.verification_status, profile.score);

        await profile.save();

        // Audit Log entry: Document Approval ya vendor Update
        const isApproved = status && status.toLowerCase() === 'approved';
        await recordAuditLog({
            userId: req.user ? req.user.id : null,
            action: isApproved ? 'Document Approval' : 'vendor Update',
            detail: isApproved 
                ? `Admin approved document for business #${profile.id} (${profile.business_name})`
                : `Admin updated vendor #${profile.id} (${profile.business_name}) status to '${profile.verification_status}'`,
            ipAddress: req.ip || req.headers['x-forwarded-for']
        });

        return res.status(200).json({
            message: 'vendor score and status updated successfully',
            data: {
                id: profile.id,
                business_name: profile.business_name,
                score: profile.score,
                level: profile.level,
                status: profile.verification_status,
                rejection_reason:profile.rejection_reason,
                clarification_notes:profile.clarification_notes
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

        const profile = await business_profiles.findByPk(business_id);
        if (profile && profile.user_id) {
            await notification.create({
                user_id: profile.user_id,
                title: 'New inquiry received',
                type: 'inquiry',
                is_read: false
            });
        }

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

async function updateInquiry(req,res){
    try {
        const id=req.params.id;
        const {status,admin_response}=req.body;
        const inquiry =await inquiries.findByPk(id);
        if(!inquiry){
            return res.status(404).json({message:"Inquiry not found"});
        }
        if (status) {
            const ALLOWED_INQUIRY_STATUSES = ['new', 'in_progress', 'responded', 'closed'];
            if (!ALLOWED_INQUIRY_STATUSES.includes(status)) {
                return res.status(400).json({
                    message: `Invalid status. Allowed values: ${ALLOWED_INQUIRY_STATUSES.join(', ')}`
                });
            }
            inquiry.status = status;
        }
        if(admin_response){
            inquiry.admin_response=admin_response;
        }
        await inquiry.save();
        return res.status(200).json({
            message:"Inquiry updated successfully",
            data:inquiry
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
}

async function deleteInquiry(req,res){
    try {
        const id=req.params.id;
        const inquiry =await inquiries.findByPk(id);
        if(!inquiry){
            return res.status(404).json({message:"Inquiry not found"});
        }
        await inquiry.destroy();
        return res.status(200).json({message:"Inquiry deleted successfully"})

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

async function updateComplaint(req,res){
    try {
        const id=req.params.id;
        const {status,admin_response}=req.body;
        const complaint =await complaints.findByPk(id);
        if(!complaint){
            return res.status(404).json({message:"Complaint not found"});
        }
        if (status) {
            const ALLOWED_COMPLAINT_STATUSES = ['Open', 'in_progress', 'Closed', 'Resolved'];
            if (!ALLOWED_COMPLAINT_STATUSES.includes(status)) {
                return res.status(400).json({
                    message: `Invalid status. Allowed values: ${ALLOWED_COMPLAINT_STATUSES.join(', ')}`
                });
            }
            complaint.status = status;
        }
        if(admin_response){
            complaint.admin_response=admin_response;
        }
        await complaint.save();
        return res.status(200).json({
            message:"Complaint updated successfully",
            data:complaint
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
}

async function getReportStats(req,res){
    try {
        const totalBusinesses = await business_profiles.count();
        const activeBusinesses = await business_profiles.count({
            where: { verification_status: 'approved' }
        });
          const verifiedBusinesses = await business_profiles.count({
            where: {
                verification_status: 'approved'
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

async function GetAllAuditLogs(req, res) {
    try {
        // Access control is handled by checkpermission('view_audit_logs') middleware in routes
        // Database se saare audit logs fetch karo
        const logs = await auditlog.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Response ke liye data format karo
        const formattedLogs = logs.map((log) => ({
            id: log.id,
            time: log.createdAt,
            user: log.user ? log.user.name : 'Unknown User',
            action: log.action,
            detail: log.detail
        }));

        // Frontend ko response bhejo
        return res.status(200).json({
           
            total: logs.length,
            data: formattedLogs
        });

    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return res.status(500).json({message: 'Failed to retrieve audit logs'});
    }
}

async function getPlatformSettings(req,res){
    try {
          const settings = await platform_settings.findByPk(1);
        if (!settings) {
            return res.status(404).json({
                message: 'Platform settings not found'
            });
        }
        return res.status(200).json({
            data: {
                platform_name: settings.platform_name,
                support_email: settings.support_email,
                badge_threshold: settings.badge_threshold
            }
        });
    } catch (error) {
       console.error('Error fetching platform settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

async function updatePlatformSettings(req,res){
     try {
        const { platform_name, support_email, badge_threshold } = req.body;
        const settings = await platform_settings.findByPk(1);
        if (!settings) {
            return res.status(404).json({
                message: 'Platform settings not found'
            });
        }
        // Jo fields body me aayein sirf unhe update karo
        if (platform_name !== undefined) settings.platform_name = platform_name;
        if (support_email !== undefined) settings.support_email = support_email;
        if (badge_threshold !== undefined) settings.badge_threshold = parseInt(badge_threshold);
        await settings.save();
        return res.status(200).json({
            message: 'Platform settings updated successfully',
            data: settings
        });
        
    } catch (error) {
       console.error('Error updating platform settings:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
    
// export CSV
async function exportBusinessReportCSV(req, res) {
    try {
        // 1. Jo specific database columns chahiye unhe define karein
        const selectedColumns = [
            'business_name',
            'industry',
            'city',
            'state',
            'verification_status',
            'score',
            'level'
        ];

        // 2. Database se real-time data fetch karein (raw: true se direct DB objects milte hain)
        const businesses = await business_profiles.findAll({
            attributes: selectedColumns,
            order: [['createdAt', 'DESC']],
            raw: true // Plain objects deta hai jisme keys exact DB column names hoti hain
        });

        if (businesses.length === 0) {
            return res.status(404).json({ message: 'No records found to export' });
        }

        // 3. Headers: Database ke columns se dynamically nikal lo
        // Result: ['business_name', 'industry', 'city', 'state', 'verification_status', 'score', 'level']
        const headers = Object.keys(businesses[0]);

      
         // 4. Rows: Har row ke data ko match karke CSV format me convert karo
        const rows = businesses.map(row => {
        return headers.map(column => {
            const value = row[column] !== null && row[column] !== undefined ? String(row[column]) : '';
            return `"${value.replace(/"/g, '""')}"`; // Comma aur quotes safe handling
        }).join(',');
});

        // 5. Header aur Rows ko combine karein
        const csvContent = [headers.join(','), ...rows].join('\r\n');

        // 6. Download headers set karein aur response bhejein
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="bitaintel-business-report.csv"');

        return res.status(200).send(csvContent); // 👈 Yeh line missing thi!

    } catch (error) {
        console.error('Error exporting business report:', error);
        return res.status(500).json({ success: false, message: 'Failed to export report' });
    }
}


async function getAdminOverview(req, res) {
    try {
        // 1. Total businesses
        const totalBusinesses = await business_profiles.count();
        // 2. Verified businesses (approved)
        const verified = await business_profiles.count({
            where: { verification_status: 'approved' }
        });
        // 3. Pending verification
        const pendingVerification = await business_profiles.count({
            where: { verification_status: 'pending' }
        });
        // 4. Rejected businesses
        const rejected = await business_profiles.count({
            where: { verification_status: 'rejected' }
        });
        // 5. Total inquiries
        const totalInquiries = await inquiries.count();
        // 6. Average score (Round off to integer)
        const avgScoreData = await business_profiles.findOne({
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('score')), 'avgScore']
            ],
            raw: true
        });
        const averageScore = avgScoreData?.avgScore ? Math.round(Number(avgScoreData.avgScore)) : 0;
        // 7. Docs pending review (pending, under_review, clarification_required)
        const docsPendingReview = await business_profiles.count({
            where: {
                verification_status: {
                    [Op.in]: ['pending', 'under_review', 'clarification_required']
                }
            }
        });
        // 8. Open complaints
        const openComplaints = await complaints.count({
            where: { status: 'Open' }
        });
        // 9. Industry Distribution (Group by industry and count)
        const industryCounts = await business_profiles.findAll({
            attributes: [
                'industry',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            where: {
                industry: { [Op.ne]: null }
            },
            group: ['industry'],
            raw: true
        });
        // Format industry distribution list
        const industryDistribution = industryCounts.map(item => ({
            name: item.industry,
            count: parseInt(item.count, 10)
        }));
        // 10. Single consolidated JSON response
        return res.status(200).json({

            data: {
                metrics: {
                    total_businesses: totalBusinesses,
                    verified: verified,
                    pending_verification: pendingVerification,
                    rejected: rejected,
                    total_inquiries: totalInquiries,
                    average_score: averageScore,
                    docs_pending_review: docsPendingReview,
                    open_complaints: openComplaints
                },
                industry_distribution: industryDistribution
            }
        });
    } catch (error) {
        console.error('Error fetching admin overview:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve admin overview data'
        });
    }
}

async function viewBusiness(req,res){
     try {
        const id=req.params.id;
        // 1. Business Profile find karo
        const business = await business_profiles.findByPk(id);
        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }
        // 2. Active Scoring Categories fetch karo (Weights: 20, 20, 20, 15, 10, 5, 5, 5)
        const scoringConfigs = await scoringconfiguration.findAll({
            where: { is_active: true },
            order: [['id', 'ASC']]
        });
        // 3. GST se PAN number extract karo (Indian GST ke character 3 to 12 PAN hota hai)
        let panNumber = null;
        if (business.gst_number && business.gst_number.length === 15) {
            panNumber = business.gst_number.substring(2, 12);
        }
        // 4. Score Breakdown Calculation (Total Score ke hisaab se categories ka distribution)
        const totalScore = business.score || 0;
        const scoreBreakdown = scoringConfigs.map(config => {
            // Proportional score calculate karein category weight ke anusaar
            const earnedScore = Math.round((config.weight / 100) * totalScore);
            return {
                id: config.id,
                name: config.name,
                weight: config.weight,
                score: earnedScore, // e.g., 18/20
                display: `${earnedScore}/${config.weight}`
            };
        });
        // 5. Documents list structure (Verified checklist)
        const documents = [
            { name: 'GST Certificate', status: business.verification_status === 'approved' ? 'Verified' : 'Pending' },
            { name: 'PAN Document', status: business.verification_status === 'approved' ? 'Verified' : 'Pending' },
            { name: 'Certificate of Incorporation', status: business.verification_status === 'approved' ? 'Verified' : 'Pending' },
            { name: 'Address Proof', status: business.verification_status === 'approved' ? 'Verified' : 'Pending' }
        ];
        // 6. Complete Single JSON Response (Frontend Screenshot ke anusaar)
        return res.status(200).json({
            data: {
                id: business.id,
                business_name: business.business_name,
                legal_name: business.legal_name || `${business.business_name} Private Limited`,
                industry: business.industry || 'General',
                location: `${business.city || 'Pune'}, ${business.state || 'Maharashtra'}, India`,
                website: business.website || `www.${business.business_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                est_year: new Date(business.createdAt).getFullYear() || 2020,
                score: business.score || 0,
                level: business.level || 0,
                verification_status: business.verification_status,
                
                // Left Column: Overview & Identity
                overview: business.description || `${business.business_name} is a verified business operating in ${business.city || 'India'}.`,
                identity: {
                    gstin: business.gst_number || null,
                    pan: panNumber || null
                },
                
                // Left Column: Documents
                documents: documents,
                
                // Right Column: BITAINTEL Score Breakdown
                score_breakdown: scoreBreakdown
            }
        });
    } catch (error) {
        console.error('Error fetching business details:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


async function getScoringConfigurations(req, res) {
    try {
        const configurations = await scoringconfiguration.findAll({
            order: [['id', 'ASC']]
        });
        return res.status(200).json({
            data: configurations
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function updateScoringConfigurations(req, res) {
    try {
        const id = req.params.id;
        const { weight, is_active, description, name } = req.body;
        const configuration = await scoringconfiguration.findByPk(id);
        if (!configuration) {
            return res.status(404).json({
                message: 'Configuration not found'
            });
        }

        if (weight !== undefined) configuration.weight = weight;
        if (is_active !== undefined) configuration.is_active = is_active;
        if (description !== undefined) configuration.description = description;
        if (name !== undefined) configuration.name = name;

        await configuration.save();

        return res.status(200).json({
            message: 'Configuration updated successfully',
            data: configuration
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = { 
    getAllBusinesses, 
    updateVendorScoreAndStatus, 
    verificationQueue, 
    runMockGSTCheck,
    documentReview,
    SubmitInquiry,
    GetAllInquiries,
    updateInquiry,
    GetAllComplaints,
    updateComplaint,
    getReportStats,
    GetAllAuditLogs,
    getPlatformSettings,
    updatePlatformSettings,
    exportBusinessReportCSV,
    getAdminOverview,
    viewBusiness,
    deleteInquiry,
    getScoringConfigurations,
    updateScoringConfigurations
};

