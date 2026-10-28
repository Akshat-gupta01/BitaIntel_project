const { business_profiles, verification } = require('../models');
const { recordAuditLog } = require('../services/auditLogger.service');

async function underReviewVerification(req, res) {
    try {
        const data = await business_profiles.findAll({
            where: {
                verification_status: 'under_review'
            },
            attributes: [
                'id',
                'business_name',
                'gst_number',
                'verification_status',
                'city',
                'state',
                'score',
                'level',
                'rejection_reason',
                'createdAt'
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Under Review Verifications fetched successfully',
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error('Error in underReviewVerification:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

async function pendingVerification(req, res) {
    try {
        const [pendingCount, clarificationCount, completedCount] = await Promise.all([
            business_profiles.count({
                where: { verification_status: 'pending' }
            }),
            business_profiles.count({
                where: { verification_status: 'clarification_required' }
            }),
            business_profiles.count({
                where: { verification_status: 'approved' }
            })
        ]);

        const data = await business_profiles.findAll({
            where: {
                verification_status: 'pending'
            },
            attributes: [
                'id',
                'business_name',
                'gst_number',
                'verification_status',
                'city',
                'state',
                'score',
                'level',
                'createdAt'
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Pending Cases fetched successfully',
            cards: {
                pending_cases: pendingCount,
                awaiting_clarification: clarificationCount,
                completed: completedCount
            },
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error('Error in pendingVerification:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

async function clarificationVerification(req, res) {
    try {
        const data = await business_profiles.findAll({
            where: {
                verification_status: 'clarification_required'
            },
            attributes: [
                'id',
                'business_name',
                'gst_number',
                'verification_status',
                'city',
                'state',
                'score',
                'level',
                'rejection_reason',
                'clarification_notes',
                'createdAt'
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Clarification Required Verifications fetched successfully',
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error('Error in clarificationVerification:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

async function updateVerificationAction(req, res) {
    try {
        // Step 1: Get ID from URL and data from request body
        const id = req.params.id;
        const { status, clarify, reason } = req.body;

        // Step 2: Check whether status is provided
        if (!status) {
            return res.status(400).json({
                message: 'Status is required'
            });
        }

        // Step 2.1: Validate status against allowed enum values
        // (Model ka ENUM DB level pe rokta hai, ye check API level pe clean 400 deta hai)
        const ALLOWED_STATUSES = ['pending', 'under_review', 'clarification_required', 'approved', 'rejected'];
        if (!ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`
            });
        }

        // Step 2.2: Rejection reason is mandatory when status is 'rejected'
        if (status === 'rejected' && (!reason || typeof reason !== 'string' || !reason.trim())) {
            return res.status(400).json({
                message: 'Rejection reason is required'
            });
        }

        // Step 3: Find business profile using ID
        let businessProfile = await business_profiles.findByPk(id);

        // Step 4: If business profile is not found,
        // check whether this ID belongs to a verification record
        if (!businessProfile) {
            const verificationRecord = await verification.findByPk(id);

            // If verification record exists, find its business profile
            if (verificationRecord) {
                businessProfile = await business_profiles.findByPk(
                    verificationRecord.business_id
                );
            }
        }

        // Step 5: If business profile still does not exist
        if (!businessProfile) {
            return res.status(404).json({
                message: 'Business profile not found'
            });
        }

        // Step 6: Update business profile status
        businessProfile.verification_status = status;

        // Level update: Agar status approved nahi hai toh level 0 reset hoga, approved hai toh score ke hisaab se level set hoga
        if (status !== 'approved') {
            businessProfile.level = 0;
        } else {
            const score = businessProfile.score || 0;
            if (score >= 85) businessProfile.level = 4;
            else if (score >= 80) businessProfile.level = 3;
            else if (score >= 70) businessProfile.level = 2;
            else if (score >= 60) businessProfile.level = 1;
            else businessProfile.level = 0;
        }

        // Update clarification notes if provided
        if (clarify !== undefined && clarify !== null) {
            businessProfile.clarification_notes = clarify;
        }

        // Update rejection reason if provided
        if (reason !== undefined && reason !== null) {
            businessProfile.rejection_reason = reason;
        }

        // Status approved hone par purane rejection reason aur clarification notes clear karein
        if (status === 'approved') {
            businessProfile.rejection_reason = null;
            businessProfile.clarification_notes = null;
        }

        // Save changes in business_profiles table
        await businessProfile.save();

        // Step 7: Find latest verification record for this business
        let verificationRecord = await verification.findOne({
            where: {
                business_id: businessProfile.id
            },
            order: [['id', 'DESC']]
        });

        // Step 8: If verification record does not exist, create one
        let isNewRecord = false;
        if (!verificationRecord) {
            verificationRecord = await verification.create({
                business_id: businessProfile.id,
                verification_status: status,
                clarification_notes: clarify || null,
                rejection_reason: reason || null,
                verifier_id: req.user ? req.user.id : null
            });
            isNewRecord = true; // Naya bana hai, save() ki zaroorat nahi
        }

        // Step 9: Only update existing records — naye record ko dobara save mat karo
        if (!isNewRecord) {
            verificationRecord.verification_status = status;

            if (req.user && req.user.id) {
                verificationRecord.verifier_id = req.user.id;
            }

            if (clarify !== undefined && clarify !== null) {
                verificationRecord.clarification_notes = clarify;
            }

            if (reason !== undefined && reason !== null) {
                verificationRecord.rejection_reason = reason;
            }

            // Approved status par verification record ke reasons bhi clear karein
            if (status === 'approved') {
                verificationRecord.rejection_reason = null;
                verificationRecord.clarification_notes = null;
            }

            // Save changes in verifications table (sirf existing record ke liye)
            await verificationRecord.save();
        }

        // Step 10: Record audit log for verification status change
        const actionLabel = status === 'approved' 
            ? 'Verification Approved' 
            : status === 'rejected' 
                ? 'Verification Rejected' 
                : 'Verification Status Updated';

        await recordAuditLog({
            userId: req.user ? req.user.id : null,
            action: actionLabel,
            detail: `Verifier updated business #${businessProfile.id} (${businessProfile.business_name}) status to '${status}'` +
                (reason ? `. Reason: ${reason}` : '') +
                (clarify ? `. Notes: ${clarify}` : ''),
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress
        });

        // Step 11: Send successful response
        return res.status(200).json({
            success: true,
            message: `Business status updated to '${status}' successfully`,
            data: {
                id: businessProfile.id,
                business_name: businessProfile.business_name,
                verification_status: businessProfile.verification_status,
                level: businessProfile.level,
                clarification_notes: verificationRecord.clarification_notes,
                verification_id: verificationRecord.id,
                verification_table_status: verificationRecord.verification_status
            }
        });

    } catch (error) {
        console.error('Error in updateVerificationAction:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

async function getAllVerified(req,res){
    try {
        const data = await business_profiles.findAll({
            where: {
                verification_status: 'approved'
            },
            attributes: [
                'id',
                'business_name',
                'gst_number',
                'verification_status',
                'city',
                'state',
                'score',
                'level',
                'rejection_reason',
                'createdAt'
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: 'All Verified Verifications fetched successfully',
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error('Error in getAllVerified:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = {
    pendingVerification,
    underReviewVerification,
    clarificationVerification,
    updateVerificationAction,
    getAllVerified
};