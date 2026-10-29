const express = require('express');
const { 
  createBusinessProfile, 
  getProfile, 
  uploadBusinessDocuments, 
  downloadBusinessDocument,
  uploadlogo,
  upload,
  uploadbrochure
} = require('../Controllers/BusinessProfile.controller');
const { checkforAuth } = require('../middleware/authmiddleware');
const { uploadDocuments } = require('../middleware/upload.middleware');

const router = express.Router();

router.post('/create', checkforAuth, createBusinessProfile);
router.get('/profile', checkforAuth, getProfile);

//logo upload
router.post('/upload-logo',checkforAuth,upload.single('logo'), uploadlogo)

router.post('/upload-brochure', checkforAuth, uploadDocuments.single('brochure'), uploadbrochure);



// Document routes
router.post('/upload-documents', checkforAuth, uploadDocuments.array('documents', 5), uploadBusinessDocuments);
router.get('/documents/:filename', checkforAuth, downloadBusinessDocument);

module.exports = router;
