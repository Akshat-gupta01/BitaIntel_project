import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize, authorizeAny, requireRole } from "../middlewares/rbac.middleware.js";

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
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/vendor.controller.js";
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleProductImage,
  uploadMultipleProductImages,
  uploadImageController,
  uploadProductImageController,
  uploadPersonnelPhotoController,
  uploadMultipleImagesController,
  uploadProductImagesController,
  uploadFacilityImagesController,
  updateFacilityPhotosController,
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

// Authentication and Role verification required for all vendor self-service endpoints
vendorRouter.use(authenticate);
vendorRouter.use(requireRole("vendor", "super_admin"));

// ─── Step 2: Company Profile & Legal Identity ────────────────────────────────
vendorRouter.get("/profile", authorizeAny("vendors.view", "vendors.edit"), getProfile);
vendorRouter.patch("/update-profile", validate(updateProfileSchema), authorize("vendors.edit"), updateProfile);

// ─── Step 2: Statutory Identifiers (GSTIN / PAN / CIN) ───────────────────────
vendorRouter.get("/statutory", authorizeAny("vendors.view", "vendors.edit"), getStatutory);
vendorRouter.post("/create-statutory", validate(createStatutorySchema), authorize("vendors.edit"), createStatutory);
vendorRouter.patch("/update-statutory", validate(updateStatutorySchema), authorize("vendors.edit"), updateStatutory);

// ─── Step 2: Manufacturing Facilities & Plants ───────────────────────────────
vendorRouter.post("/add-facilities", validate(addFacilitySchema), authorize("vendors.edit"), addFacility);
vendorRouter.get("/facilities", authorizeAny("vendors.view", "vendors.edit"), getFacilities);
vendorRouter.post("/facilities/upload-images", authorize("vendors.edit"), uploadMultipleImages, uploadFacilityImagesController);
vendorRouter.patch("/facilities/photos", authorize("vendors.edit"), updateFacilityPhotosController);
vendorRouter.patch("/facilities/:id", validate(updateFacilitySchema), authorize("vendors.edit"), updateFacility);
vendorRouter.delete("/facilities/:id", authorize("vendors.edit"), deleteFacility);

// ─── Step 2: Key Personnel & Executive Contacts ─────────────────────────────
vendorRouter.post("/add-personnel", validate(addPersonnelSchema), authorize("vendors.edit"), addPersonnel);
vendorRouter.get("/personnel", authorizeAny("vendors.view", "vendors.edit"), getPersonnel);
vendorRouter.patch("/personnel/:id", validate(updatePersonnelSchema), authorize("vendors.edit"), updatePersonnel);
vendorRouter.delete("/personnel/:id", authorize("vendors.edit"), deletePersonnel);
vendorRouter.post("/personnel/:id/photo", authorize("vendors.edit"), uploadSingleImage, uploadPersonnelPhotoController);

// ─── Step 2: Foundational Statutory Document Vault ───────────────────────────
vendorRouter.post("/upload-documents", authorize("documents.create"), uploadSingleDocument, uploadStatutoryDocument);
vendorRouter.get("/documents", authorize("documents.view"), getDocuments);
vendorRouter.delete("/documents/:id", authorize("documents.create"), deleteDocument);

// ─── Step 3: Business Classification & Operational Capabilities ──────────────
vendorRouter.post("/save-capabilities", validate(capabilitiesSchema), authorize("vendors.edit"), saveCapabilities);
vendorRouter.get("/capabilities", authorizeAny("vendors.view", "vendors.edit"), getCapabilities);

// ─── Step 4: Products & Services Catalog ────────────────────────────────────
vendorRouter.post("/add-product", validate(addProductInputSchema), authorize("products.create"), addProduct);
vendorRouter.post("/products", validate(addProductInputSchema), authorize("products.create"), addProduct);
vendorRouter.get("/products", authorize("products.view"), getProducts);
vendorRouter.post("/products/upload-images", authorize("products.create"), uploadMultipleProductImages, uploadProductImagesController);
vendorRouter.post("/products/upload-image", authorize("products.create"), uploadSingleProductImage, uploadProductImageController);
vendorRouter.post("/products/upload-document", authorize("products.create"), uploadSingleDocument, uploadProductDocument);
vendorRouter.patch("/products/:id", authorize("products.edit"), updateProduct);
vendorRouter.delete("/products/:id", authorize("products.delete"), deleteProduct);

// ─── Step 4: Quality & Regulatory Certifications ─────────────────────────────
vendorRouter.post("/add-certification", validate(addCertificationInputSchema), authorize("documents.create"), addCertification);
vendorRouter.get("/certifications", authorize("documents.view"), getCertifications);
vendorRouter.patch("/certifications/:id", authorize("documents.create"), updateCertification);
vendorRouter.delete("/certifications/:id", authorize("documents.create"), deleteCertification);
vendorRouter.post("/certifications/upload-document", authorize("documents.create"), uploadSingleDocument, uploadCertificationDocument);

// ─── Step 4: Quality Systems & Testing Capabilities ──────────────────────────
vendorRouter.post("/quality-systems", validate(qualitySystemsSchema), authorize("vendors.edit"), updateQualitySystems);
vendorRouter.patch("/quality-systems", validate(qualitySystemsSchema), authorize("vendors.edit"), updateQualitySystems);

// ─── Step 5: Department and Banking system ────────────────────────────────────
vendorRouter.post("/add-commercial", validate(commercialDetailsSchema), authorize("vendors.edit"), saveCommercialDetails);
 
// 1. Departmental Business Points of Contact (CRUD)
vendorRouter.get("/commercial/contacts", authorizeAny("vendors.view", "vendors.edit"), getDepartmentContacts);
vendorRouter.post("/add-commercial/contacts", validate(departmentContactSchema), authorize("vendors.edit"), addDepartmentContact);
vendorRouter.patch("/commercial/contacts/:id", validate(departmentContactSchema.partial()), authorize("vendors.edit"), updateDepartmentContact);
vendorRouter.delete("/commercial/contacts/:id", authorize("vendors.edit"), deleteDepartmentContact);

// 2. Commercial & Payment Terms (CRUD)
vendorRouter.get("/commercial/terms", authorizeAny("vendors.view", "vendors.edit"), getCommercialTerms);
vendorRouter.post("/add-commercial/terms", validate(commercialTermsSchema), authorize("vendors.edit"), saveCommercialTerms);
vendorRouter.patch("/commercial/terms", validate(commercialTermsSchema.partial()), authorize("vendors.edit"), saveCommercialTerms);

// 3. Trade Operations & Logistics (CRUD)
vendorRouter.get("/commercial/trade", authorizeAny("vendors.view", "vendors.edit"), getTradeLogistics);
vendorRouter.post("/add-commercial/trade", validate(tradeLogisticsSchema), authorize("vendors.edit"), saveTradeLogistics);
vendorRouter.patch("/commercial/trade", validate(tradeLogisticsSchema.partial()), authorize("vendors.edit"), saveTradeLogistics);

// 4. Banking & Financial Settlement Details (CRUD)
vendorRouter.get("/commercial/banking", authorizeAny("vendors.view", "vendors.edit"), getBankingDetails);
vendorRouter.post("/add-commercial/banking", validate(bankingDetailsSchema), authorize("vendors.edit"), saveBankingDetails);
vendorRouter.patch("/commercial/banking", validate(bankingDetailsSchema.partial()), authorize("vendors.edit"), saveBankingDetails);
vendorRouter.post("/commercial/bank-proof", authorize("vendors.edit"), uploadSingleDocument, uploadBankProofDocument);

// ─── Step 6: Final Verification Submission ──────────────────────────────────
vendorRouter.post("/submit-verification", validate(submitVerificationSchema), authorize("vendors.edit"), submitVerification);

// ─── Notifications (SRS §5.11) ──────────────────────────────────────────────
vendorRouter.get("/notifications", getNotifications);
vendorRouter.patch("/notifications/read-all", markAllNotificationsRead);
vendorRouter.patch("/notifications/:id/read", markNotificationRead);

// ─── Generic Storage Services ───────────────────────────────────────────────
vendorRouter.post("/upload-image", authorize("vendors.edit"), uploadSingleImage, uploadImageController);
vendorRouter.post("/upload-images", authorize("vendors.edit"), uploadMultipleImages, uploadMultipleImagesController);
vendorRouter.post("/upload-file", authorize("documents.create"), uploadSingleDocument, uploadGenericDocument);

export default vendorRouter;
