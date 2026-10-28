const express = require("express");
const router = express.Router();
const { underReviewVerification, clarificationVerification, updateVerificationAction, getAllVerified, pendingVerification } = require("../Controllers/verification.controller");
const {checkforAuth}=require("../middleware/authmiddleware");
const {checkpermission}=require("../middleware/permissionmiddleware");

router.get('/pending', checkforAuth, checkpermission("view_verification"), pendingVerification)
router.get('/underreview', checkforAuth, checkpermission("view_verification"), underReviewVerification)
router.get('/clarification', checkforAuth, checkpermission("view_verification"), clarificationVerification)
router.get('/all-verified', checkforAuth, checkpermission("view_verification"), getAllVerified)
router.patch('/update-action/:id', checkforAuth, checkpermission("update_verification"), updateVerificationAction)

module.exports = router;