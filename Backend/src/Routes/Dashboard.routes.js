const express = require('express');
const {
    getAccountSettings,
    updateAccountSettings,
    getVerificationDetails,
    getAllIndustries,
    getBusinessDetails,
    updateBusinessProfile,
    getVendorDocuments,
    SubmitComplaint,
    GetMyComplaints
} = require('../Controllers/Dashboard.controller');
const { checkforAuth } = require('../middleware/authmiddleware');

const router = express.Router();

// Account Settings (Visible in Vendor Dashboard Settings tab)
router.get('/get-settings', checkforAuth, getAccountSettings);
router.patch('/update-settings', checkforAuth, updateAccountSettings);

// Verification Status and Steps
router.get('/verification', checkforAuth, getVerificationDetails);

// Business Profile tab
router.get('/get-industries', checkforAuth, getAllIndustries);
router.get('/business-details', checkforAuth, getBusinessDetails);
router.patch('/update-business-profile', checkforAuth, updateBusinessProfile);

// Documents tab (GST, PAN, Incorporation, Address Proof)
router.get('/get-vendor-documents', checkforAuth, getVendorDocuments);


//submit complaint by vendor

router.post('/complaints',checkforAuth,SubmitComplaint)

router.get('/my-complaints',checkforAuth,GetMyComplaints)


module.exports = router;
