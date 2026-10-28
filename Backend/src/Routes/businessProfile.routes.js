const express = require('express');
const { 
  createBusinessProfile, 
  getProfile, 
  uploadBusinessDocuments, 
  downloadBusinessDocument 
} = require('../Controllers/BusinessProfile.controller');
const { checkforAuth } = require('../middleware/authmiddleware');
const { uploadDocuments } = require('../middleware/upload.middleware');

const router = express.Router();

router.post('/create', checkforAuth, createBusinessProfile);
router.get('/profile', checkforAuth, getProfile);

// Document routes
router.post('/upload-documents', checkforAuth, uploadDocuments.array('documents', 5), uploadBusinessDocuments);
router.get('/documents/:filename', checkforAuth, downloadBusinessDocument);

module.exports = router;
