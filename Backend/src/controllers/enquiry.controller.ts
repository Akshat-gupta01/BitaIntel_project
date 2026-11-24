import type { Request, Response } from "express";
import { Op } from "sequelize";
import { BusinessEntity, BusinessProduct } from "../models/index.js";
import BusinessEnquiry from "../models/BusinessEnquiry.model.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

/**
 * 1. POST /api/v1/enquiries
 * Public endpoint: Submit buyer procurement enquiry / RFQ for a vendor business
 * Per user workflow: Enquiries are routed directly to the Super Admin for centralized review.
 */
export async function submitEnquiry(req: Request, res: Response) {
  try {
    const {
      businessId,
      businessSlug,
      productId,
      productName,
      buyerName,
      name,
      sender_name,
      buyerEmail,
      email,
      sender_email,
      buyerPhone,
      phone,
      sender_phone,
      buyerCompany,
      company,
      sender_company,
      subject,
      details,
      message,
      budget,
    } = req.body;

    const resolvedBuyerName = buyerName || name || sender_name;
    const resolvedBuyerEmail = buyerEmail || email || sender_email;
    const resolvedBuyerPhone = buyerPhone || phone || sender_phone || null;
    const resolvedBuyerCompany = buyerCompany || company || sender_company || null;
    const resolvedMessage = details || message;
    const targetIdentifier = businessSlug || businessId;

    // Resolve target business entity by numeric ID, slug, or legal/trade name
    let targetBusiness = null;
    const isNumeric = typeof targetIdentifier === "number" || (/^\d+$/.test(String(targetIdentifier || "").trim()));

    if (isNumeric) {
      targetBusiness = await BusinessEntity.findByPk(Number(targetIdentifier));
    }

    if (!targetBusiness) {
      const searchKey = String(targetIdentifier || "").trim();
      targetBusiness = await BusinessEntity.findOne({
        where: {
          [Op.or]: [
            { slug: searchKey },
            { name: searchKey },
            { legalName: searchKey },
          ],
        },
      });
    }

    if (!targetBusiness) {
      return sendError(
        res,
        "Target business entity could not be found. Please verify the company identifier.",
        404,
        "ERR_BUSINESS_NOT_FOUND"
      );
    }

    // Resolve product if provided by ID or by name
    let verifiedProductId: number | null = null;
    let verifiedProductName = productName || null;

    if (productId && (typeof productId === "number" || /^\d+$/.test(String(productId)))) {
      const prod = await BusinessProduct.findOne({
        where: { id: Number(productId), businessId: targetBusiness.id },
      });
      if (prod) {
        verifiedProductId = prod.id;
        verifiedProductName = verifiedProductName || prod.name;
      }
    } else if (productName) {
      const prod = await BusinessProduct.findOne({
        where: { name: productName, businessId: targetBusiness.id },
      });
      if (prod) {
        verifiedProductId = prod.id;
      }
    }

    // Generate readable enquiry code e.g. ENQ-805
    const timestampPart = Date.now().toString().slice(-3);
    const randomPart = Math.floor(100 + Math.random() * 900);
    const enquiryNumber = `ENQ-${timestampPart}${randomPart}`;

    const enquiry = await BusinessEnquiry.create({
      enquiryNumber,
      businessId: targetBusiness.id,
      productId: verifiedProductId,
      productName: verifiedProductName,
      buyerName: resolvedBuyerName,
      buyerEmail: resolvedBuyerEmail,
      buyerPhone: resolvedBuyerPhone,
      buyerCompany: resolvedBuyerCompany,
      subject: subject || (verifiedProductName ? `Request RFQ: ${verifiedProductName}` : "Procurement / RFQ Enquiry"),
      details: resolvedMessage,
      budget: budget || null,
      status: "New",
      replyMessage: null,
      repliedAt: null,
    });

    return sendSuccess(
      res,
      {
        id: enquiry.id,
        enquiryId: enquiry.enquiryNumber,
        enquiryNumber: enquiry.enquiryNumber,
        businessName: targetBusiness.name,
        businessSlug: targetBusiness.slug,
        buyerName: enquiry.buyerName,
        sender_name: enquiry.buyerName,
        buyerEmail: enquiry.buyerEmail,
        sender_email: enquiry.buyerEmail,
        buyerCompany: enquiry.buyerCompany,
        sender_company: enquiry.buyerCompany,
        subject: enquiry.subject,
        message: "Enquiry received and routed to BITAINTEL Super Admin for verification.",
        status: enquiry.status,
        createdAt: enquiry.createdAt,
      },
      201,
      { message: "Enquiry received and routed to BITAINTEL Super Admin for verification." }
    );
  } catch (error: any) {
    console.error("Error submitting enquiry:", error);
    return sendError(res, error.message || "Failed to submit enquiry", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 2. GET /api/v1/admin/enquiries
 * Authenticated Super Admin endpoint: List all buyer enquiries received across the platform
 */
export async function getAdminEnquiries(req: Request, res: Response) {
  try {
    const enquiries = await BusinessEnquiry.findAll({
      include: [
        {
          model: BusinessEntity,
          as: "business",
          attributes: ["id", "name", "legalName", "slug", "registrationNo", "logoUrl"],
        },
        {
          model: BusinessProduct,
          as: "product",
          attributes: ["id", "name", "hsnCode", "indicativePrice", "currency", "images"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = enquiries.map((enq: any) => {
      const createdDate = new Date(enq.createdAt);
      const dateFormatted = createdDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        id: String(enq.id),
        enquiryId: enq.enquiryNumber,
        enquiryNumber: enq.enquiryNumber,
        businessId: enq.businessId,
        targetBusinessName: enq.business?.name || "Target Vendor",
        targetBusinessLegalName: enq.business?.legalName || enq.business?.name,
        targetBusinessSlug: enq.business?.slug || "",
        targetBusinessLogo: enq.business?.logoUrl || null,
        buyerName: enq.buyerName,
        name: enq.buyerName,
        sender_name: enq.buyerName,
        buyerCompany: enq.buyerCompany || "Enterprise Buyer",
        company: enq.buyerCompany || "Enterprise Buyer",
        sender_company: enq.buyerCompany || "Enterprise Buyer",
        buyerEmail: enq.buyerEmail,
        email: enq.buyerEmail,
        sender_email: enq.buyerEmail,
        buyerPhone: enq.buyerPhone || "N/A",
        phone: enq.buyerPhone || "N/A",
        sender_phone: enq.buyerPhone || "N/A",
        subject: enq.subject,
        details: enq.details,
        message: enq.details,
        date: dateFormatted,
        status: enq.status,
        budget: enq.budget || "Commercial RFQ",
        productId: enq.productId || null,
        productName: enq.productName || enq.product?.name || null,
        product: enq.product || null,
        replyMessage: enq.replyMessage || null,
        vendor_notes: enq.replyMessage || null,
        repliedAt: enq.repliedAt || null,
        createdAt: enq.createdAt,
      };
    });

    return sendSuccess(res, {
      enquiries: formatted,
      totalCount: formatted.length,
    });
  } catch (error: any) {
    console.error("Error fetching admin enquiries:", error);
    return sendError(res, error.message || "Failed to fetch enquiries", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 3. PATCH /api/v1/admin/enquiries/:id/status
 * Super Admin updates lifecycle status of any enquiry
 */
export async function updateAdminEnquiryStatus(req: Request, res: Response) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : String(req.params.id || "");
    const { status } = req.body;

    let enquiry = null;
    if (/^\d+$/.test(id)) {
      enquiry = await BusinessEnquiry.findByPk(Number(id));
    }
    if (!enquiry) {
      enquiry = await BusinessEnquiry.findOne({ where: { enquiryNumber: id } });
    }

    if (!enquiry) {
      return sendError(res, "Enquiry record not found", 404, "ERR_ENQUIRY_NOT_FOUND");
    }

    enquiry.status = status;
    await enquiry.save();

    return sendSuccess(
      res,
      {
        id: String(enquiry.id),
        enquiryId: enquiry.enquiryNumber,
        enquiryNumber: enquiry.enquiryNumber,
        status: enquiry.status,
      },
      200,
      { message: `Enquiry status updated to ${status} by Super Admin` }
    );
  } catch (error: any) {
    console.error("Error updating admin enquiry status:", error);
    return sendError(res, error.message || "Failed to update enquiry status", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 4. POST /api/v1/admin/enquiries/:id/reply
 * Super Admin dispatches response / proposal to buyer
 */
export async function replyAdminEnquiry(req: Request, res: Response) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : String(req.params.id || "");
    const { replyMessage } = req.body;

    let enquiry = null;
    if (/^\d+$/.test(id)) {
      enquiry = await BusinessEnquiry.findByPk(Number(id));
    }
    if (!enquiry) {
      enquiry = await BusinessEnquiry.findOne({ where: { enquiryNumber: id } });
    }

    if (!enquiry) {
      return sendError(res, "Enquiry record not found", 404, "ERR_ENQUIRY_NOT_FOUND");
    }

    enquiry.replyMessage = replyMessage;
    enquiry.repliedAt = new Date();
    enquiry.status = "Responded";
    await enquiry.save();

    return sendSuccess(
      res,
      {
        id: String(enquiry.id),
        enquiryId: enquiry.enquiryNumber,
        enquiryNumber: enquiry.enquiryNumber,
        status: enquiry.status,
        replyMessage: enquiry.replyMessage,
        repliedAt: enquiry.repliedAt,
      },
      200,
      {
        message: `Admin response transmitted to buyer ${enquiry.buyerEmail}`,
      }
    );
  } catch (error: any) {
    console.error("Error replying to enquiry by admin:", error);
    return sendError(res, error.message || "Failed to submit reply", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 5. GET /api/v1/vendor/enquiries
 * Authenticated vendor endpoint: In the new flow, buyer enquiries are managed by Super Admin.
 */
export async function getVendorEnquiries(req: Request, res: Response) {
  try {
    return sendSuccess(res, {
      enquiries: [],
      totalCount: 0,
      message: "Buyer procurement enquiries are centralized and verified through the BITAINTEL Super Admin Desk.",
    });
  } catch (error: any) {
    console.error("Error in vendor enquiries:", error);
    return sendError(res, error.message || "Failed to fetch enquiries", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * 6. PATCH /api/v1/vendor/enquiries/:id/status
 */
export async function updateEnquiryStatus(req: Request, res: Response) {
  return updateAdminEnquiryStatus(req, res);
}

/**
 * 7. POST /api/v1/vendor/enquiries/:id/reply
 */
export async function replyEnquiry(req: Request, res: Response) {
  return replyAdminEnquiry(req, res);
}
