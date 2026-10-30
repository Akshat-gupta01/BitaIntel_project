const express = require('express');
const {
  saveCapabilities,
  getCapabilities,
  uploadFacilityDocs,
} = require('../Controllers/vendorCapabilities.controller');
const { checkforAuth } = require('../middleware/authmiddleware');
const { uploadFacilityMedia } = require('../middleware/upload.middleware');

const router = express.Router();

// Step 3 - Vendor Capabilities Routes
router.post('/save', checkforAuth, saveCapabilities);
router.get('/me', checkforAuth, getCapabilities);
router.post(
  '/upload-docs',
  checkforAuth,
  uploadFacilityMedia.array('documents', 10),
  uploadFacilityDocs
);

module.exports = router;
