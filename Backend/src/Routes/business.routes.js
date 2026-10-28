const express = require('express');
const { getAllBusinesses, updateVendorScoreAndStatus, verificationQueue, runMockGSTCheck,documentReview,SubmitInquiry,GetAllInquiries,GetAllComplaints,getReportStats } = require('../Controllers/business.controller');
const { checkforAuth } = require('../middleware/authmiddleware');
// this is admin routes for business only admin can access this
const router = express.Router();

router.get('/all-businesses', checkforAuth, getAllBusinesses);

// Admin verification, custom score & status (approve/reject/suspend) update
router.patch('/update-score/:id', checkforAuth, updateVendorScoreAndStatus);

router.get('/verification-queue', checkforAuth, verificationQueue);

router.post("/gst-check/:id", checkforAuth, runMockGSTCheck);

router.get('/document-review',checkforAuth,documentReview)

router.post('/inquiries',SubmitInquiry)

router.get('/all-inquiries',GetAllInquiries)

router.get('/all-complaints',checkforAuth,GetAllComplaints)

router.get('/reports',checkforAuth,getReportStats)



module.exports = router;
