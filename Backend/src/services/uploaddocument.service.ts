import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { createNotification } from "./notification.service.js";
import {
  BusinessBankingDetails,
  BusinessEntity,
  BusinessManufacturingCapability,
  BusinessProduct,
  Certification,
  DocumentVault,
} from "../models/index.js";
import {
  computeSha256,
  deleteStoredFile,
  describeUploadedFile,
  validateUploadedFile,
  type UploadedFileInfo,
} from "../config/upload.js";

export { uploadSingleDocument } from "../config/upload.js";

const PRODUCT_DOCUMENT_COLUMNS = [
  "catalogueDoc",
  "technicalDataSheetDoc",
  "coaDoc",
  "sdsDoc",
] as const;

type ProductDocumentColumn = (typeof PRODUCT_DOCUMENT_COLUMNS)[number];

const FRIENDLY_CATEGORY_NAMES: Record<string, string> = {
  incorporation_cert: "Certificate of Incorporation / Registration Proof",
  address_proof: "Corporate Address Proof / Electricity Bill",
  tax_registration: "Applicable Tax Registrations (GST & PAN Copies)",
  board_resolution: "Authorized Signatory Board Resolution / Letter",
  manufacturing_licence: "Factory / Manufacturing Operating Licence",
  regulatory_approval_dmf: "Regulatory Approvals (DMF / USDMF, CEP & Filings)",
  technical_audit: "Technical Audit & Inspection Report",
  statutory_doc: "Statutory Evidence Document",
  bank_proof: "Cancelled Cheque / Bank Statement",
  signatory_kyc: "Authorized Signatory KYC",
  tax_registration_gst: "GST Registration Certificate",
  tax_registration_pan: "PAN Card",
  factory_license: "Factory License",
  spcb_pollution_cto: "SPCB Pollution Consent (CTO)",
  plant_layout_audit: "Plant Layout & Audit Report",
  iso_quality_cert: "ISO / Quality Certification",
  product_catalog_datasheet: "Product Catalogue / Datasheet",
  nabl_lab_test_report: "NABL Lab Test Report",
  bank_cancelled_cheque: "Cancelled Cheque",
  bank_solvency_letter: "Bank Solvency Letter",
  trade_terms_declaration: "Trade Terms Declaration",
  statutory_evidence: "Statutory Evidence Document",
};

const ALLOWED_STATUTORY_CATEGORIES = new Set(Object.keys(FRIENDLY_CATEGORY_NAMES));

type DocumentMetadata = {
  categoryKey: string;
  categoryName: string;
  moduleCode: string;
  version: string;
  issueDate: string | null;
  expiryDate: string | null;
};

function normalizeText(value: unknown, fallback: string, maxLength: number): string {
  const text = typeof value === "string" ? value.trim() : "";
  return (text || fallback).slice(0, maxLength);
}

function normalizeCategoryKey(value: unknown, fallback: string): string {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  const normalized = raw
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
  return normalized || fallback;
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function parsePositiveId(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function buildDocumentMetadata(
  req: Request,
  fallbackKey = "statutory_evidence",
  fallbackModule = "Step 2"
): DocumentMetadata {
  const body = req.body ?? {};
  const categoryKey = normalizeCategoryKey(
    body.categoryKey ?? body.docType ?? body.documentType,
    fallbackKey
  );

  return {
    categoryKey,
    categoryName: normalizeText(
      body.categoryName,
      FRIENDLY_CATEGORY_NAMES[categoryKey] ?? categoryKey,
      200
    ),
    moduleCode: normalizeText(body.moduleCode, fallbackModule, 20),
    version: normalizeText(body.version, "v1.0", 20),
    issueDate: normalizeDate(body.issueDate),
    expiryDate: normalizeDate(body.expiryDate),
  };
}

async function findBusinessForRequest(req: Request): Promise<BusinessEntity | null> {
  const userId = req.user?.id;
  if (!userId) return null;
  return BusinessEntity.findOne({ where: { ownerUserId: userId } });
}

function sendMissingFile(res: Response, fieldName = "document") {
  return sendError(
    res,
    `No file uploaded. Attach a file with field name "${fieldName}".`,
    400,
    "ERR_NO_FILE"
  );
}

async function upsertVaultEntry(
  businessId: number,
  file: Express.Multer.File,
  info: UploadedFileInfo,
  checksum: string | null,
  metadata: DocumentMetadata
): Promise<DocumentVault> {
  const existing = await DocumentVault.findOne({
    where: { businessId, categoryKey: metadata.categoryKey },
  });

  if (existing) {
    const previousFileUrl = existing.fileUrl;

    existing.categoryName = metadata.categoryName;
    existing.moduleCode = metadata.moduleCode;
    existing.fileName = file.originalname || file.filename;
    existing.fileUrl = info.path;
    existing.fileSizeBytes = file.size;
    existing.mimeType = file.mimetype;
    existing.sha256Checksum = checksum;
    existing.version = metadata.version;
    existing.status = "PENDING";
    existing.issueDate = metadata.issueDate;
    existing.expiryDate = metadata.expiryDate;
    existing.rejectionReason = null;
    existing.verifierName = null;
    existing.verifiedBy = null;
    existing.verifiedAt = null;

    await existing.save();
    if (previousFileUrl !== info.path) deleteStoredFile("documents", previousFileUrl);
    return existing;
  }

  return DocumentVault.create({
    businessId,
    categoryKey: metadata.categoryKey,
    categoryName: metadata.categoryName,
    moduleCode: metadata.moduleCode,
    fileName: file.originalname || file.filename,
    fileUrl: info.path,
    fileSizeBytes: file.size,
    mimeType: file.mimetype,
    sha256Checksum: checksum,
    version: metadata.version,
    status: "PENDING",
    issueDate: metadata.issueDate,
    expiryDate: metadata.expiryDate,
  });
}

async function upsertVaultEntryQuietly(
  businessId: number,
  file: Express.Multer.File,
  info: UploadedFileInfo,
  checksum: string | null,
  metadata: DocumentMetadata
): Promise<DocumentVault | null> {
  try {
    return await upsertVaultEntry(businessId, file, info, checksum, metadata);
  } catch (error) {
    console.warn("Could not sync uploaded document to DocumentVault:", error);
    return null;
  }
}

/**
 * POST /api/v1/vendor/upload-documents
 * Statutory document upload (upsert by categoryKey).
 */
export async function uploadStatutoryDocument(req: Request, res: Response) {
  if (!req.file) return sendMissingFile(res);

  const signatureError = validateUploadedFile(req.file, "documents");
  if (signatureError) {
    return sendError(res, signatureError, 400, "ERR_INVALID_FILE");
  }

  const info = describeUploadedFile(req, req.file, "documents");
  const checksum = computeSha256(req.file.path);

  try {
    const business = await findBusinessForRequest(req);
    if (!business) {
      deleteStoredFile("documents", info.path);
      return sendError(
        res,
        "Please create your business profile before uploading documents.",
        404,
        "ERR_BUSINESS_NOT_FOUND"
      );
    }

    const metadata = buildDocumentMetadata(req);
    if (!ALLOWED_STATUTORY_CATEGORIES.has(metadata.categoryKey)) {
      deleteStoredFile("documents", info.path);
      return sendError(
        res,
        `Unknown document category "${metadata.categoryKey}".`,
        400,
        "ERR_INVALID_CATEGORY"
      );
    }

    const documentRecord = await upsertVaultEntry(
      business.id,
      req.file,
      info,
      checksum,
      metadata
    );

    if (
      metadata.categoryKey === "manufacturing_licence" ||
      metadata.categoryKey === "regulatory_approval_dmf"
    ) {
      const [mfgCap] = await BusinessManufacturingCapability.findOrCreate({
        where: { businessId: business.id },
        defaults: {
          businessId: business.id,
          regulatoryApprovalDoc: info.path,
        },
      });
      if (mfgCap && mfgCap.regulatoryApprovalDoc !== info.path) {
        mfgCap.regulatoryApprovalDoc = info.path;
        await mfgCap.save();
      }
    }

    if (metadata.categoryKey === "technical_audit") {
      const [mfgCap] = await BusinessManufacturingCapability.findOrCreate({
        where: { businessId: business.id },
        defaults: {
          businessId: business.id,
          technicalAuditDoc: info.path,
        },
      });
      if (mfgCap && mfgCap.technicalAuditDoc !== info.path) {
        mfgCap.technicalAuditDoc = info.path;
        await mfgCap.save();
      }
    }

    await createNotification({
      userId: req.user?.id,
      businessId: business.id,
      type: "DOCUMENT",
      title: `Document Uploaded: ${req.file.originalname}`,
      message: `"${metadata.categoryName}" has been vaulted and queued for analyst verification.`,
      actionTab: "documents",
    });

    return sendSuccess(
      res,
      {
        message: "Document uploaded successfully and queued for verification",
        document: {
          ...documentRecord.toJSON(),
          fullUrl: info.url,
        },
      },
      201
    );
  } catch (error) {
    deleteStoredFile("documents", info.path);
    console.error("Upload Statutory Document Error:", error);
    return sendError(res, "Failed to upload document", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * POST /api/v1/vendor/products/upload-document
 * Optionally attaches the document to an owned product. Without productId the
 * file is only stored and its path is returned for a later product save.
 */
export async function uploadProductDocument(req: Request, res: Response) {
  if (!req.file) return sendMissingFile(res);

  const signatureError = validateUploadedFile(req.file, "documents");
  if (signatureError) {
    return sendError(res, signatureError, 400, "ERR_INVALID_FILE");
  }

  const info = describeUploadedFile(req, req.file, "documents");
  const checksum = computeSha256(req.file.path);
  const body = req.body ?? {};
  const productId = parsePositiveId(
    body.productId ?? req.query.productId ?? req.params.id
  );

  try {
    if (!productId) {
      return sendSuccess(
        res,
        {
          message: "Document uploaded successfully",
          ...info,
          sha256Checksum: checksum,
        },
        201
      );
    }

    const business = await findBusinessForRequest(req);
    if (!business) {
      deleteStoredFile("documents", info.path);
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const product = await BusinessProduct.findOne({
      where: { id: productId, businessId: business.id },
    });
    if (!product) {
      deleteStoredFile("documents", info.path);
      return sendError(
        res,
        "Product not found or not owned by your company",
        404,
        "ERR_PRODUCT_NOT_FOUND"
      );
    }

    const column = resolveProductDocumentColumn(body.docType ?? body.type);
    product[column] = info.path;
    await product.save();

    const metadata: DocumentMetadata = {
      categoryKey: `product_document_${product.id}_${column}`.slice(0, 50),
      categoryName: `Product Document - ${product.name} (${column})`.slice(0, 200),
      moduleCode: "Step 4",
      version: "v1.0",
      issueDate: null,
      expiryDate: null,
    };
    const vaultEntry = await upsertVaultEntryQuietly(
      business.id,
      req.file,
      info,
      checksum,
      metadata
    );

    return sendSuccess(
      res,
      {
        message: `Document uploaded and attached to product #${product.id} as ${column}`,
        ...info,
        sha256Checksum: checksum,
        ...(vaultEntry ? { vaultId: vaultEntry.id } : {}),
        product: {
          id: product.id,
          name: product.name,
          updatedField: column,
          [column]: info.path,
        },
      },
      201
    );
  } catch (error) {
    deleteStoredFile("documents", info.path);
    console.error("Upload Product Document Error:", error);
    return sendError(res, "Failed to upload product document", 500, "ERR_INTERNAL_SERVER");
  }
}

function resolveProductDocumentColumn(value: unknown): ProductDocumentColumn {
  const docType = String(value ?? "tds").toLowerCase().trim();
  if (docType.includes("catalog")) return "catalogueDoc";
  if (docType.includes("coa")) return "coaDoc";
  if (docType.includes("sds") || docType.includes("msds")) return "sdsDoc";
  return "technicalDataSheetDoc";
}

/**
 * POST /api/v1/vendor/certifications/upload-document
 * Optionally attaches the evidence document to an owned certification.
 */
export async function uploadCertificationDocument(req: Request, res: Response) {
  if (!req.file) return sendMissingFile(res);

  const signatureError = validateUploadedFile(req.file, "documents");
  if (signatureError) {
    return sendError(res, signatureError, 400, "ERR_INVALID_FILE");
  }

  const info = describeUploadedFile(req, req.file, "documents");
  const checksum = computeSha256(req.file.path);
  const body = req.body ?? {};
  const certificationId = parsePositiveId(
    body.certificationId ?? body.certId ?? req.query.certificationId ?? req.params.id
  );

  try {
    if (!certificationId) {
      return sendSuccess(
        res,
        {
          message: "Document uploaded successfully",
          ...info,
          sha256Checksum: checksum,
        },
        201
      );
    }

    const business = await findBusinessForRequest(req);
    if (!business) {
      deleteStoredFile("documents", info.path);
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const certification = await Certification.findOne({
      where: { id: certificationId, businessId: business.id },
    });
    if (!certification) {
      deleteStoredFile("documents", info.path);
      return sendError(
        res,
        "Certification not found or not owned by your company",
        404,
        "ERR_CERTIFICATION_NOT_FOUND"
      );
    }

    certification.evidenceDoc = info.path;
    await certification.save();

    const metadata: DocumentMetadata = {
      categoryKey: `quality_cert_${certification.id}`.slice(0, 50),
      categoryName: `Quality Certification - ${certification.certificateType}`.slice(0, 200),
      moduleCode: "Step 4",
      version: "v1.0",
      issueDate: certification.issueDate,
      expiryDate: certification.expiryDate,
    };
    const vaultEntry = await upsertVaultEntryQuietly(
      business.id,
      req.file,
      info,
      checksum,
      metadata
    );

    return sendSuccess(
      res,
      {
        message: `Evidence document uploaded and attached to certification #${certification.id}`,
        ...info,
        sha256Checksum: checksum,
        ...(vaultEntry ? { vaultId: vaultEntry.id } : {}),
        certification: {
          id: certification.id,
          certificateType: certification.certificateType,
          certificateNumber: certification.certificateNumber,
          evidenceDoc: info.path,
        },
      },
      201
    );
  } catch (error) {
    deleteStoredFile("documents", info.path);
    console.error("Upload Certification Document Error:", error);
    return sendError(
      res,
      "Failed to upload certification document",
      500,
      "ERR_INTERNAL_SERVER"
    );
  }
}

/**
 * POST /api/v1/vendor/commercial/bank-proof
 * Stores the cancelled cheque / bank statement on the banking record.
 */
export async function uploadBankProofDocument(req: Request, res: Response) {
  if (!req.file) return sendMissingFile(res);

  const signatureError = validateUploadedFile(req.file, "documents");
  if (signatureError) {
    return sendError(res, signatureError, 400, "ERR_INVALID_FILE");
  }

  const info = describeUploadedFile(req, req.file, "documents");
  const checksum = computeSha256(req.file.path);

  try {
    const business = await findBusinessForRequest(req);
    if (!business) {
      deleteStoredFile("documents", info.path);
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    let banking = await BusinessBankingDetails.findOne({
      where: { businessId: business.id },
    });

    if (!banking) {
      banking = await BusinessBankingDetails.create({
        businessId: business.id,
        accountHolderName: business.legalName || business.name || "Pending",
        bankName: "Pending",
        accountNumber: "Pending",
        ifscCode: "PENDING0001",
        bankProofDoc: info.path,
      });
    } else {
      const previousFileUrl = banking.bankProofDoc;
      banking.bankProofDoc = info.path;
      await banking.save();
      if (previousFileUrl !== info.path) deleteStoredFile("documents", previousFileUrl);
    }

    const metadata: DocumentMetadata = {
      categoryKey: "bank_proof",
      categoryName: FRIENDLY_CATEGORY_NAMES.bank_proof,
      moduleCode: "Step 5",
      version: "v1.0",
      issueDate: null,
      expiryDate: null,
    };
    const vaultEntry = await upsertVaultEntryQuietly(
      business.id,
      req.file,
      info,
      checksum,
      metadata
    );

    return sendSuccess(
      res,
      {
        message: "Bank proof uploaded successfully",
        ...info,
        sha256Checksum: checksum,
        ...(vaultEntry ? { vaultId: vaultEntry.id } : {}),
        commercial: {
          id: banking.id,
          bankingId: banking.id,
          bankProofDoc: info.path,
        },
      },
      201
    );
  } catch (error) {
    deleteStoredFile("documents", info.path);
    console.error("Upload Bank Proof Error:", error);
    return sendError(res, "Failed to upload bank proof", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * POST /api/v1/vendor/upload-file
 * Generic storage endpoint. It only stores the file and returns its path; the
 * caller decides which record should own it.
 */
export async function uploadGenericDocument(req: Request, res: Response) {
  if (!req.file) return sendMissingFile(res);

  const signatureError = validateUploadedFile(req.file, "documents");
  if (signatureError) {
    return sendError(res, signatureError, 400, "ERR_INVALID_FILE");
  }

  const info = describeUploadedFile(req, req.file, "documents");
  return sendSuccess(
    res,
    {
      message: "Document uploaded successfully",
      ...info,
      sha256Checksum: computeSha256(req.file.path),
    },
    201
  );
}

/**
 * GET /api/v1/vendor/documents
 */
export async function getDocuments(req: Request, res: Response) {
  try {
    const business = await findBusinessForRequest(req);
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const documents = await DocumentVault.findAll({
      where: { businessId: business.id },
      order: [["id", "ASC"]],
    });

    const mappedDocuments = documents.map((document) => ({
      ...document.toJSON(),
      fullUrl: `${req.protocol}://${req.get("host")}${document.fileUrl}`,
    }));

    return sendSuccess(res, {
      total: mappedDocuments.length,
      documents: mappedDocuments,
    });
  } catch (error) {
    console.error("Get Documents Error:", error);
    return sendError(res, "Failed to fetch documents", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * DELETE /api/v1/vendor/documents/:id
 */
export async function deleteDocument(req: Request, res: Response) {
  try {
    const business = await findBusinessForRequest(req);
    if (!business) {
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const documentId = parsePositiveId(req.params.id);
    if (!documentId) {
      return sendError(res, "Invalid document ID", 400, "ERR_INVALID_ID");
    }

    const documentRecord = await DocumentVault.findOne({
      where: { id: documentId, businessId: business.id },
    });
    if (!documentRecord) {
      return sendError(
        res,
        "Document not found or not owned by your company",
        404,
        "ERR_NOT_FOUND"
      );
    }

    const fileUrl = documentRecord.fileUrl;
    await documentRecord.destroy();
    deleteStoredFile("documents", fileUrl);

    return sendSuccess(res, {
      message: "Document removed successfully",
      documentId,
    });
  } catch (error) {
    console.error("Delete Document Error:", error);
    return sendError(res, "Failed to delete document", 500, "ERR_INTERNAL_SERVER");
  }
}
