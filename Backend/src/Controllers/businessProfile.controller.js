const { business_profiles, verification } = require('../models');
const {
  addDocuments,
  removeUploadedFiles,
  uploadDirectory,
} = require("../services/businessDocument.service");

const fs = require("fs/promises");
const path = require("path");

async function uploadBusinessDocuments(req, res, next) {
  const files = req.files || [];
  const documentType = req.body.document_type || null;

  try {
    if (files.length === 0) {
      const error = new Error("Please select at least one PDF");
      error.statusCode = 400;
      throw error;
    }

    // Assumption: each business profile belongs to req.user.id
    const profile = await business_profiles.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    if (!profile) {
      const error = new Error("Business profile not found");
      error.statusCode = 404;
      throw error;
    }

    const documents = await addDocuments(profile, files, documentType);

    return res.status(201).json({
      success: true,
      message: "Documents uploaded successfully",
      documents,
    });
  } catch (error) {
    await removeUploadedFiles(files);
    return next(error);
  }
}

async function downloadBusinessDocument(req, res, next) {
  try {
    let { filename } = req.params;

    // If user provided UUID without .pdf, append it automatically
    if (!filename.toLowerCase().endsWith(".pdf")) {
      filename = `${filename}.pdf`;
    }

    // Accept only generated UUID-based PDF filenames.
    if (!/^[0-9a-f-]{36}\.pdf$/i.test(filename)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document filename",
      });
    }

    const userRole = req.user?.role?.name;
    const isStaff = ['Super Admin', 'Admin', 'Verification Team', 'Support Team'].includes(userRole);

    let profile;
    let document;

    if (isStaff) {
      // Staff (Admin, Super Admin, Verification Team) can view any vendor's documents
      const allProfiles = await business_profiles.findAll({
        attributes: ['id', 'documents_url']
      });

      profile = allProfiles.find((p) => {
        const docs = Array.isArray(p.documents_url) ? p.documents_url : [];
        return docs.some((d) => d.documentUrl && d.documentUrl.endsWith(`/${filename}`));
      });

      if (profile && Array.isArray(profile.documents_url)) {
        document = profile.documents_url.find((item) =>
          item.documentUrl && item.documentUrl.endsWith(`/${filename}`)
        );
      }
    } else {
      // Normal Vendor can ONLY access documents belonging to their own business profile
      profile = await business_profiles.findOne({
        where: {
          user_id: req.user.id,
        },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Business profile not found",
        });
      }

      const documents = Array.isArray(profile.documents_url)
        ? profile.documents_url
        : [];

      document = documents.find(
        (item) => item.documentUrl && item.documentUrl.endsWith(`/${filename}`)
      );

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }
    }

    const filePath = path.join(uploadDirectory, filename);

    await fs.access(filePath);

    const friendlyName = `${document?.documentName || "document"}.pdf`;
    return res.download(filePath, friendlyName);
  } catch (error) {
    if (error.code === "ENOENT") {
      error.statusCode = 404;
      error.message = "Document file not found";
    }

    return next(error);
  }
}

async function createBusinessProfile(req, res) {
    try {
        const userId = req.user.id;

        const existing = await business_profiles.findOne({ where: { user_id: userId } });
        if (existing) {
            return res.status(400).json({ 
                message: 'Business profile already submitted',
                status: existing.verification_status 
            });
        }

         const { business_name,legal_name, industry, business_email, business_phone, business_address, gst_number, website, description, documents_url,city,state } = req.body;
      
          // Validation: Required fields
        if (!business_name || !industry || !business_email || !business_phone) {
            return res.status(400).json({ message: 'Required business fields are missing' });
        }
        
         const business_profile = await business_profiles.create({
            business_name,
            industry,
            legal_name,
            business_email,
            business_phone,
            business_address,
            gst_number: gst_number || null,
            website: website || null,
            description: description || null,
            documents_url: documents_url || null,
            city:city || null,
            state:state || null,
            user_id: userId,
            verification_status: 'pending'
        });

        await verification.create({
            business_id: business_profile.id,
            verification_status: 'pending'
        });

        return res.status(201).json({ message: 'Business profile created successfully', business_profile });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function getProfile(req, res) {
    try {
        const user_id = req.user.id;
        const business_profile = await business_profiles.findOne({ where: { user_id } });
        if (!business_profile) {
            return res.status(404).json({ 
                message: 'No business profile found. Please fill the onboarding form.',
            });
        }
        return res.status(200).json({ message: 'Business profile fetched successfully', business_profile });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}




module.exports = { createBusinessProfile, getProfile, uploadBusinessDocuments,
  downloadBusinessDocument };