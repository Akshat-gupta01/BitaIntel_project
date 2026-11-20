import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";

import {
  getProfile,
  // createProfile, // Deprecated/Unused: Business profile auto-created during registration (POST /auth/register)
  updateProfile,
  getStatutory,
  createStatutory,
  updateStatutory,
  addFacility,
  getFacilities,
  updateFacility,
  deleteFacility,
  addPersonnel,
  getPersonnel,
  updatePersonnel,
  deletePersonnel,
  saveCapabilities,
  getCapabilities,
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addCertification,
  getCertifications,
  updateCertification,
  deleteCertification,
  updateQualitySystems,
  saveCommercialDetails,
  getDepartmentContacts,
  addDepartmentContact,
  updateDepartmentContact,
  deleteDepartmentContact,
  getCommercialTerms,
  saveCommercialTerms,
  getTradeLogistics,
  saveTradeLogistics,
  getBankingDetails,
  saveBankingDetails,
  submitVerification,
} from "../controllers/vendor.controller.js";
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadImageController,
  uploadPersonnelPhotoController,
  uploadMultipleImagesController,
} from "../services/uploadimage.service.js";
import {
  uploadSingleDocument,
  uploadStatutoryDocument,
  uploadProductDocument,
  uploadCertificationDocument,
  uploadBankProofDocument,
  uploadGenericDocument,
  getDocuments,
  deleteDocument,
} from "../services/uploaddocument.service.js";
import {
  validate,
  // createProfileSchema, // Deprecated: Replaced by updateProfileSchema via PATCH /vendor/update-profile
  updateProfileSchema,
  createStatutorySchema,
  updateStatutorySchema,
  addFacilitySchema,
  updateFacilitySchema,
  addPersonnelSchema,
  updatePersonnelSchema,
  capabilitiesSchema,
  qualitySystemsSchema,
  addProductInputSchema,
  addCertificationInputSchema,
  commercialDetailsSchema,
  departmentContactSchema,
  commercialTermsSchema,
  tradeLogisticsSchema,
  bankingDetailsSchema,
  submitVerificationSchema,
} from "../Validations/vendor.validation.js";

const vendorRouter = Router();

vendorRouter.use(authenticate);

// ─── Step 2: Company Profile & Legal Identity ────────────────────────────────
// NOTE: /create-profile is commented out because registration (POST /auth/register)
// automatically initializes BusinessEntity. All profile saves/modifications use PATCH /update-profile.
// vendorRouter.post("/create-profile", validate(createProfileSchema), createProfile);
vendorRouter.get("/profile", getProfile);
vendorRouter.patch("/update-profile", validate(updateProfileSchema), updateProfile);

// ─── Step 2: Statutory Identifiers (GSTIN / PAN / CIN) ───────────────────────
vendorRouter.get("/statutory", getStatutory);
vendorRouter.post("/create-statutory", validate(createStatutorySchema), createStatutory);
vendorRouter.patch("/update-statutory", validate(updateStatutorySchema), updateStatutory);

// ─── Step 2: Manufacturing Facilities & Plants ───────────────────────────────
vendorRouter.post("/add-facilities", validate(addFacilitySchema), addFacility);
vendorRouter.get("/facilities", getFacilities);
vendorRouter.patch("/facilities/:id", validate(updateFacilitySchema), updateFacility);
vendorRouter.delete("/facilities/:id", deleteFacility);

// ─── Step 2: Key Personnel & Executive Contacts ─────────────────────────────
vendorRouter.post("/add-personnel", validate(addPersonnelSchema), addPersonnel);
vendorRouter.get("/personnel", getPersonnel);
vendorRouter.patch("/personnel/:id", validate(updatePersonnelSchema), updatePersonnel);
vendorRouter.delete("/personnel/:id", deletePersonnel);
vendorRouter.post("/personnel/:id/photo", uploadSingleImage, uploadPersonnelPhotoController);

// ─── Step 2: Foundational Statutory Document Vault ───────────────────────────
vendorRouter.post("/upload-documents", uploadSingleDocument, uploadStatutoryDocument);
vendorRouter.get("/documents", getDocuments);
vendorRouter.delete("/documents/:id", deleteDocument);

// ─── Step 3: Business Classification & Operational Capabilities ──────────────
vendorRouter.post("/save-capabilities", validate(capabilitiesSchema), saveCapabilities);
vendorRouter.get("/capabilities", getCapabilities);

// ─── Step 4: Products & Services Catalog ────────────────────────────────────
vendorRouter.post("/add-product", validate(addProductInputSchema), addProduct);
vendorRouter.get("/products", getProducts);
vendorRouter.post("/products/upload-images", uploadMultipleImages, uploadMultipleImagesController);
vendorRouter.post("/products/upload-image", uploadSingleImage, uploadImageController);
vendorRouter.post("/products/upload-document", uploadSingleDocument, uploadProductDocument);
vendorRouter.patch("/products/:id", updateProduct);
vendorRouter.delete("/products/:id", deleteProduct);


// ─── Step 4: Quality & Regulatory Certifications ─────────────────────────────
vendorRouter.post("/add-certification", validate(addCertificationInputSchema), addCertification);
vendorRouter.get("/certifications", getCertifications);
vendorRouter.patch("/certifications/:id", updateCertification);
vendorRouter.delete("/certifications/:id", deleteCertification);
vendorRouter.post("/certifications/upload-document", uploadSingleDocument, uploadCertificationDocument);

// ─── Step 4: Quality Systems & Testing Capabilities ──────────────────────────
vendorRouter.post("/quality-systems", validate(qualitySystemsSchema), updateQualitySystems);
vendorRouter.patch('/quality-systems',validate(qualitySystemsSchema), updateQualitySystems);

// step-5: Department and Banking system
vendorRouter.post("/add-commercial", validate(commercialDetailsSchema), saveCommercialDetails);
 
// 1. Departmental Business Points of Contact (CRUD)
vendorRouter.get("/commercial/contacts", getDepartmentContacts);
vendorRouter.post("/add-commercial/contacts", validate(departmentContactSchema), addDepartmentContact);
vendorRouter.patch("/commercial/contacts/:id", validate(departmentContactSchema.partial()), updateDepartmentContact);
vendorRouter.delete("/commercial/contacts/:id", deleteDepartmentContact);

// 2. Commercial & Payment Terms (CRUD)
vendorRouter.get("/commercial/terms", getCommercialTerms);
vendorRouter.post("/add-commercial/terms", validate(commercialTermsSchema), saveCommercialTerms);
vendorRouter.patch("/commercial/terms", validate(commercialTermsSchema.partial()), saveCommercialTerms);

// 3. Trade Operations & Logistics (CRUD)
vendorRouter.get("/commercial/trade", getTradeLogistics);
vendorRouter.post("/add-commercial/trade", validate(tradeLogisticsSchema), saveTradeLogistics);
vendorRouter.patch("/commercial/trade", validate(tradeLogisticsSchema.partial()), saveTradeLogistics);

// 4. Banking & Financial Settlement Details (CRUD)
vendorRouter.get("/commercial/banking", getBankingDetails);
vendorRouter.post("/add-commercial/banking", validate(bankingDetailsSchema), saveBankingDetails);
vendorRouter.patch("/commercial/banking", validate(bankingDetailsSchema.partial()), saveBankingDetails);
vendorRouter.post("/commercial/bank-proof", uploadSingleDocument, uploadBankProofDocument);

// ─── Step 6: Final Verification Submission ──────────────────────────────────
vendorRouter.post("/submit-verification", validate(submitVerificationSchema), submitVerification);


// ─── Generic Storage Services ───────────────────────────────────────────────
vendorRouter.post("/upload-image", uploadSingleImage, uploadImageController);
vendorRouter.post("/upload-images", uploadMultipleImages, uploadMultipleImagesController);
vendorRouter.post("/upload-file", uploadSingleDocument, uploadGenericDocument);

export default vendorRouter;
