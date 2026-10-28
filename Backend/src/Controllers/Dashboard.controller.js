const { User, business_profiles, industries, complaints, inquiries, notification, scoringconfiguration } = require('../models');
const { Op } = require('sequelize');


async function getAccountSettings(req, res) {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'phone']
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const profile = await business_profiles.findOne({
            where: { user_id: userId },
            attributes: ['business_name']
        });

        return res.status(200).json({
            settings: {
                contact_person: user.name || '',
                email: user.email || '',
                mobile: user.phone || '',
                business_name: profile ? profile.business_name : null
            }
        });
    } catch (error) {
       console.log(error)
       return res.status(500).json({
        message: 'Internal server error'
       })
    }
}

async function updateAccountSettings(req, res) {
    try {
        const userId = req.user.id;
        const { contact_person, email } = req.body;

        const newName = contact_person;

        if (!newName && !email) {
            return res.status(400).json({
       
                message: 'Please provide at least one field to update'
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // email=new email
        // Check if new email is already taken by another account
        if (email && email !== user.email) {
            const emailExists = await User.findOne({
                where: {
                    email,
                    id: { [Op.ne]: userId }
                }
            });

            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already in use by another user'
                });
            }
            user.email = email;
        }

        if (newName) {
            user.name = newName;
        }

        await user.save();

        return res.status(200).json({
        
            message: 'Settings saved successfully',
            settings: {
                contact_person: user.name,
                email: user.email,
                mobile: user.phone
            }
        });
    } catch (error) {
       console.log(error)
       return res.status(500).json({
        message: 'Internal server error'
       })
    }
}
/**
 * GET /api/vendor/verification
 * Detailed KYC Verification Status and Checklist
 */

async function getVerificationDetails(req, res) {
    try {
        // Step 1: Get logged-in user's ID
        const userId = req.user.id;

        // Step 2: Find the user's business profile
        const profile = await business_profiles.findOne({
            where: {
                user_id: userId
            }
        });

        // Step 3: If profile does not exist
        if (!profile) {
            return res.status(200).json({
                status: 'not_submitted',
                message: 'Business profile has not been submitted yet.',
                steps: {
                    phone_verified: true,
                    profile_submitted: false,
                    all_documents_uploaded: false,
                    admin_verified: false
                }
            });
        }

        // Step 4: Get uploaded documents
        let documents = [];

        if (Array.isArray(profile.documents_url)) {
            documents = profile.documents_url;
        }

        // Step 5: Find each required document (by documentType or filename keyword)
        let gstDoc = null;
        let panDoc = null;
        let coiDoc = null;
        let addressDoc = null;

        for (const doc of documents) {
            const docType = (doc.documentType || '').toLowerCase();
            const docName = (doc.documentName || doc.type || '').toLowerCase();

            if (docType === 'gst_certificate' || docType.includes('gst') || docName.includes('gst')) {
                gstDoc = doc;
            } else if (docType === 'pan_document' || docType === 'pan_card' || docType.includes('pan') || docName.includes('pan')) {
                panDoc = doc;
            } else if (
                docType === 'certificate_of_incorporation' ||
                docType === 'coi' ||
                docType.includes('incorporation') ||
                docName.includes('incorporation') ||
                docName.includes('coi')
            ) {
                coiDoc = doc;
            } else if (docType === 'address_proof' || docType.includes('address') || docName.includes('address')) {
                addressDoc = doc;
            }
        }

        // Step 6: Get the status of each document
        const resolveStatus = (doc) => {
            if (!doc) return 'not_uploaded';
            if (doc.status) return doc.status;
            if (profile.verification_status === 'approved') return 'verified';
            return 'pending';
        };

        const gstStatus = resolveStatus(gstDoc);
        const panStatus = resolveStatus(panDoc);
        const coiStatus = resolveStatus(coiDoc);
        const addressStatus = resolveStatus(addressDoc);

        // Step 7: Check whether all required documents are uploaded
        let allDocsUploaded = Boolean(gstDoc && panDoc && coiDoc && addressDoc);

        // Step 8: Check admin verification
        let adminVerified = false;

        if (profile.verification_status === 'approved') {
            adminVerified = true;
        }

        // Step 9: Send the response
        return res.status(200).json({
            status: profile.verification_status,
            rejection_reason: profile.rejection_reason || null,
            business_name: profile.business_name,
            gst_number: profile.gst_number,

            steps: {
                phone_verified: true,
                profile_submitted: true,
                all_documents_uploaded: allDocsUploaded,
                admin_verified: adminVerified
            },

            documents_breakdown: {
                gst_certificate: {
                    title: 'GST Certificate',
                    uploaded: !!gstDoc,
                    status: gstStatus,
                    download_url: gstDoc ? gstDoc.documentUrl : null
                },

                pan_document: {
                    title: 'PAN Document',
                    uploaded: !!panDoc,
                    status: panStatus,
                    download_url: panDoc ? panDoc.documentUrl : null
                },

                certificate_of_incorporation: {
                    title: 'Certificate of Incorporation',
                    uploaded: !!coiDoc,
                    status: coiStatus,
                    download_url: coiDoc ? coiDoc.documentUrl : null
                },

                address_proof: {
                    title: 'Address Proof',
                    uploaded: !!addressDoc,
                    status: addressStatus,
                    download_url: addressDoc ? addressDoc.documentUrl : null
                }
            },

            uploaded_count: documents.length,
            required_count: 4
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}


async function getAllIndustries(req, res) {
    try {
        // Database se saari Active industries nikalenge
        const allIndustries = await industries.findAll({
            where: {
                status: 'Active'
            },
            attributes: ['id', 'name']
            // order: [['name', 'ASC']] // A-Z format me sort hokar aayengi
        });

        return res.status(200).json({
            message: 'Industries fetched successfully',
            industries: allIndustries
        });
    } catch (error) {
       console.log(error);
       return res.status(500).json({
           message: 'Internal server error'
       });
    }
}
// vendor can get and change our business profile
async function getBusinessDetails(req,res) {
    try {
        const userId = req.user.id;

        const profile = await business_profiles.findOne({
            where: { user_id: userId },
            attributes: ['business_name','legal_name','industry','website','description','verification_status']
        });

        if (!profile) {
            return res.status(404).json({
                message: 'Business profile not found'
            });
        }

        return res.status(200).json({
            business_name: profile.business_name || '',
            legal_name: profile.legal_name || '',
            industry: profile.industry || '',
            website: profile.website || '',
            description: profile.description || '',
            verification_status: profile.verification_status
            
        });
    } catch (error) {
       console.log(error)
       return res.status(500).json({
        message: 'Internal server error'
       })
    }
}

async function updateBusinessProfile(req,res) {
    try {
        const userId = req.user.id;
        const { business_name, legal_name, industry, website, description } = req.body;

        const profile = await business_profiles.findOne({ where: { user_id: userId } });

        if (!profile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        profile.business_name = business_name || profile.business_name;
        profile.legal_name = legal_name || profile.legal_name;
        profile.industry = industry || profile.industry;
        profile.website = website || profile.website;
        profile.description = description || profile.description;

        await profile.save();

        return res.status(200).json({
            message: 'Business profile updated successfully',
            profile: {
                business_name: profile.business_name,
                legal_name: profile.legal_name,
                industry: profile.industry,
                website: profile.website,
                description: profile.description
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}


async function getVendorDocuments(req, res) {
    try {
        const userId = req.user.id;

        const profile = await business_profiles.findOne({
            where: { user_id: userId },
            attributes: ['documents_url', 'verification_status']
        });

        if (!profile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        const documents = Array.isArray(profile.documents_url) ? profile.documents_url : [];

        let gstDoc = null;
        let panDoc = null;
        let coiDoc = null;
        let addressDoc = null;

        for (const doc of documents) {
            const docType = (doc.documentType || '').toLowerCase();
            const docName = (doc.documentName || doc.type || '').toLowerCase();

            if (docType === 'gst_certificate' || docType.includes('gst') || docName.includes('gst')) {
                gstDoc = doc;
            } else if (docType === 'pan_document' || docType === 'pan_card' || docType.includes('pan') || docName.includes('pan')) {
                panDoc = doc;
            } else if (
                docType === 'certificate_of_incorporation' ||
                docType === 'coi' ||
                docType.includes('incorporation') ||
                docName.includes('incorporation') ||
                docName.includes('coi')
            ) {
                coiDoc = doc;
            } else if (docType === 'address_proof' || docType.includes('address') || docName.includes('address')) {
                addressDoc = doc;
            }
        }

        const resolveStatus = (doc) => {
            if (!doc) return 'Not Uploaded';
            if (doc.status) return doc.status;
            if (profile.verification_status === 'approved') return 'Verified';
            return 'Pending';
        };

        return res.status(200).json({
            message: 'Documents fetched successfully',
            documents: [
                {
                    title: 'GST Certificate',
                    type: 'gst_certificate',
                    status: resolveStatus(gstDoc),
                    download_url: gstDoc ? gstDoc.documentUrl : null,
                    uploaded: !!gstDoc
                },
                {
                    title: 'PAN Document',
                    type: 'pan_document',
                    status: resolveStatus(panDoc),
                    download_url: panDoc ? panDoc.documentUrl : null,
                    uploaded: !!panDoc
                },
                {
                    title: 'Certificate of Incorporation',
                    type: 'certificate_of_incorporation',
                    status: resolveStatus(coiDoc),
                    download_url: coiDoc ? coiDoc.documentUrl : null,
                    uploaded: !!coiDoc
                },
                {
                    title: 'Address Proof',
                    type: 'address_proof',
                    status: resolveStatus(addressDoc),
                    download_url: addressDoc ? addressDoc.documentUrl : null,
                    uploaded: !!addressDoc
                }
            ]
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


async function SubmitComplaint(req, res) {
    try {
        const userId = req.user.id;
        const { category, priority, subject, description, business_id } = req.body;

        if (!category || !priority || !subject || !description) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        // Vendor ka apna business profile nikalenge
        let targetBusinessId = business_id;
        if (!targetBusinessId) {
            const profile = await business_profiles.findOne({ where: { user_id: userId } });
            targetBusinessId = profile ? profile.id : null;
        }

        const complaint = await complaints.create({
            user_id: userId,
            business_id: targetBusinessId,
            category: category || 'Documentation',
            priority: priority || 'Medium',
            subject,
            description,
            status: 'Open'
        });

        return res.status(201).json({
            message: 'Complaint submitted successfully',
            data: complaint
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}


async function GetMyComplaints(req, res) {
    try {
        const userId = req.user.id;
        const myComplaints = await complaints.findAll({
            where: { user_id: userId },
            include: [{
                model: business_profiles,
                as: 'business',
                attributes: ['id', 'business_name']
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            data: myComplaints
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
}

async function GetMyInquiries(req, res) {
    try {
        const userId = req.user.id;
        const profile = await business_profiles.findOne({ where: { user_id: userId } });
        if (!profile) {
            return res.status(200).json({ data: [] });
        }
        const myInquiries = await inquiries.findAll({
            where: { business_id: profile.id },
            include: [{
                model: business_profiles,
                as: 'business',
                attributes: ['id', 'business_name']
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            data: myInquiries
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
}

async function updateMyInquiry(req, res) {
    try {
        const userId = req.user.id;
        const id=req.params.id;
        const { status } = req.body;

        const profile = await business_profiles.findOne({ where: { user_id: userId } });
        if (!profile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        const inquiry = await inquiries.findOne({
            where: { id, business_id: profile.id }
        });

        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        if (status) {
            inquiry.status = status;
        }
        await inquiry.save();

        return res.status(200).json({
            message: 'Inquiry updated successfully',
            data: inquiry
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function reportInquirySpam(req, res) {
    try {
        const userId = req.user.id;
        const id=req.params.id;
        const { is_spam,spam_reason } = req.body;

        const profile = await business_profiles.findOne({ where: { user_id: userId } });
        if (!profile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        const inquiry = await inquiries.findOne({
            where: { id, business_id: profile.id }
        });

        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        inquiry.is_spam = (is_spam !== undefined) ? is_spam : true;
        if (spam_reason) {
            inquiry.spam_reason = spam_reason;
        }
        await inquiry.save();

        return res.status(200).json({
            message: 'Inquiry updated successfully',
            data: inquiry
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// 1. Fetch Logged-in Vendor's Notifications
async function GetMyNotifications(req, res) {
    try {
        const userId = req.user.id;

        const notifications = await notification.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            data: notifications
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// 2. Mark a Notification as Read (When vendor clicks "Mark read")
async function MarkNotificationAsRead(req, res) {
    try {
        const userId = req.user.id;
        const id=req.params.id;

        const notif = await notification.findOne({
            where: { id, user_id: userId }
        });

        if (!notif) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notif.is_read = true;
        await notif.save();

        return res.status(200).json({
            message: 'Notification marked as read',
            data: notif
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

//vendor score page
function getScoreRating(score) {
    if (score >= 85) return 'EXCELLENT';
    if (score >= 70) return 'GOOD';
    if (score >= 50) return 'AVERAGE';
    return 'NEEDS IMPROVEMENT';
}

async function getVendorScoreDetails(req, res) {
    try {
        // 1. Login vendor ki user ID nikalo
        const userId = req.user.id;

        // 2. Database se vendor ka business profile lao
        const profile = await business_profiles.findOne({
            where: { user_id: userId }
        });

        // Agar business profile nahi mila
        if (!profile) {
            return res.status(404).json({
                message: 'Business profile not found'
            });
        }

        // 3. Active scoring configurations database se lao
        const scoringConfigs = await scoringconfiguration.findAll({
            where: { is_active: true },
            order: [['weight', 'DESC']]
        });

        // 4. Vendor ka total score nikalo
        const totalScore = profile.score || 0;

        // 5. Har category ka score calculate karo
        const breakdown = [];

        for (const config of scoringConfigs) {
            // Category ka maximum score
            const maxScore = config.weight; 

            // Total score ke ratio ke according category score
            const earnedScore = Math.round(
                (totalScore / 100) * maxScore
            );

            // Category ka percentage calculate karo
            let percentage = 0;

            if (maxScore > 0) {
                percentage = Math.round(
                    (earnedScore / maxScore) * 100
                );
            }

            // Category ki details array mein add karo
            breakdown.push({
                id: config.id,
                name: config.name,
                score: earnedScore,
                max_score: maxScore,
                percentage: percentage
            });
        }

        // 6. Total score ke according rating nikalo
        const rating = getScoreRating(totalScore);

        // 7. Frontend ko response bhejo
        return res.status(200).json({
            success: true,
            data: {
                total_score: totalScore,
                rating: rating,
                level: profile.level,
                verification_status: profile.verification_status,
                breakdown: breakdown
            }
        });

    } catch (error) {
        // Agar code mein error aaya
        console.error(error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}


async function getOverview(req,res){
    try {
        const userId = req.user.id;
        const profile = await business_profiles.findOne({ where: { user_id: userId } });
        if (!profile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }
        const totalInquiries = await inquiries.count({ where: { business_id: profile.id } });
        const recentInquiries = await inquiries.findAll({
            where: { business_id: profile.id },
            attributes: ['id', 'name', 'subject', 'status', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        const score = profile.score || 0;
        const rating = getScoreRating(score);

         // 3. Profile Completion % Calculate karein (12 fields ke basis par)
        const fieldsToCheck = [
            profile.business_name,
            profile.legal_name,
            profile.industry,
            profile.business_email,
            profile.business_phone,
            profile.business_address,
            profile.city,
            profile.state,
            profile.gst_number,
            profile.website,
            profile.description,
            (Array.isArray(profile.documents_url) && profile.documents_url.length >= 4)
        ];
        //falsy value remove karta hai
        const filledCount = fieldsToCheck.filter(Boolean).length;
        const profileCompletion = Math.round((filledCount / fieldsToCheck.length) * 100);
       
       // 4. Documents Status Summary (Charon documents ka status)
        const documents = Array.isArray(profile.documents_url) ? profile.documents_url : [];
        const findDoc = (keyword) => documents.find(d => 
            (d.documentType || '').toLowerCase().includes(keyword) || 
            (d.documentName || '').toLowerCase().includes(keyword)
        );
        const resolveDocStatus = (doc) => {
            if (!doc) return 'Not Uploaded';
            if (doc.status) return doc.status;
            if (profile.verification_status === 'approved') return 'Verified';
            return 'Pending';
        };
        const documentsSummary = [
            { title: 'GST Certificate', status: resolveDocStatus(findDoc('gst')) },
            { title: 'PAN Document', status: resolveDocStatus(findDoc('pan')) },
            { title: 'Certificate of Incorporation', status: resolveDocStatus(findDoc('incorporation') || findDoc('coi')) },
            { title: 'Address Proof', status: resolveDocStatus(findDoc('address')) }
        ];
        // 5. Verification Status & Message
        const isApproved = profile.verification_status === 'approved';
        const verificationStatusText = isApproved ? 'Verified' : profile.verification_status;
        const verificationMessage = isApproved
            ? 'Your business is fully approved and visible in the directory.'
            : 'Your business profile is currently under review by our verification team.';
        return res.status(200).json({
            message: 'Overview fetched successfully',
            data: {
                business_name: profile.business_name,
                business_id: profile.id,
                // Top 4 Metrics Cards
                stats: {
                    profile_completion: profileCompletion, // e.g. 91%
                    score: profile.score || 0,            // e.g. 91
                    level: profile.level || 0,            // e.g. 4 ("Level 4")
                    total_inquiries: totalInquiries       // e.g. 4
                },
                // Verification Status Card
                verification: {
                    status: verificationStatusText,
                    is_verified: isApproved,
                    message: verificationMessage
                },
                // Documents Summary Card
                documents: documentsSummary,
                // Recent Inquiries Table
                recent_inquiries: recentInquiries
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}   

module.exports = {
    getAccountSettings,
    updateAccountSettings,
    getVerificationDetails,
    getAllIndustries,
    getBusinessDetails,
    updateBusinessProfile,
    getVendorDocuments,
    SubmitComplaint,
    GetMyComplaints,
    GetMyInquiries,
    reportInquirySpam,
    updateMyInquiry,
    GetMyNotifications,
    MarkNotificationAsRead,
    getVendorScoreDetails,
    getOverview
};
