const express = require('express');
const { 
    getAllBusinesses, 
    updateVendorScoreAndStatus, 
    verificationQueue, 
    runMockGSTCheck,
    documentReview,
    SubmitInquiry,
    GetAllInquiries,
    GetAllComplaints,
    updateComplaint,
    getReportStats,
    GetAllAuditLogs,
    getPlatformSettings,
    updatePlatformSettings,
    exportBusinessReportCSV,
    getAdminOverview,
    viewBusiness,
    updateInquiry,
    deleteInquiry,
    getScoringConfigurations,
    updateScoringConfigurations
} = require('../Controllers/business.controller');
const { checkforAuth } = require('../middleware/authmiddleware');
const { checkpermission } = require('../middleware/permissionmiddleware');

const router = express.Router();

// 1. Dashboard Overview
router.get('/overview', checkforAuth, checkpermission('view_overview'), getAdminOverview);

// 2. Business Management
router.get('/all-businesses', checkforAuth, checkpermission('view_business'), getAllBusinesses);
router.get('/view-business/:id', checkforAuth, checkpermission('view_business'), viewBusiness);
router.patch('/update-score/:id', checkforAuth, checkpermission('update_business'), updateVendorScoreAndStatus);


// 3. Verification & GST Checks
router.get('/verification-queue', checkforAuth, checkpermission('view_verification_queue'), verificationQueue);
router.post('/gst-check/:id', checkforAuth, checkpermission('run_gst_check'), runMockGSTCheck);

// 4. Documents Review
router.get('/document-review', checkforAuth, checkpermission('view_documents'), documentReview);

// 5. Inquiries
router.post('/inquiries', SubmitInquiry); // Public route for inquiries submission
router.get('/all-inquiries', checkforAuth, checkpermission('view_inquiries'), GetAllInquiries);
router.patch('/updateInquiry/:id',checkforAuth,checkpermission('manage_inquiries'),updateInquiry)
router.delete('/deleteInquiry/:id',checkforAuth,checkpermission('manage_inquiries'),deleteInquiry)

// 6. Complaints
router.get('/all-complaints', checkforAuth, checkpermission('view_complaints'), GetAllComplaints);
router.patch('/updateComplaint/:id',checkforAuth,checkpermission('manage_complaints'),updateComplaint)

// 7. Reports & Analytics
router.get('/reports', checkforAuth, checkpermission('view_reports'), getReportStats);
router.get('/export-csv', checkforAuth, checkpermission('export_reports'), exportBusinessReportCSV);

// 8. Audit Logs
router.get('/audit-logs', checkforAuth, checkpermission('view_audit_logs'), GetAllAuditLogs);

// 9. Platform Settings
router.get('/getPlatformSettings', checkforAuth, checkpermission('view_platform_settings'), getPlatformSettings);
router.patch('/updatePlatformSettings', checkforAuth, checkpermission('update_platform_settings'), updatePlatformSettings);

//10. Scoring Configurations
router.get('/getScoring', checkforAuth, checkpermission('view_scoring'), getScoringConfigurations);
router.patch('/updateScoring/:id', checkforAuth, checkpermission('update_scoring'), updateScoringConfigurations);


module.exports = router;
