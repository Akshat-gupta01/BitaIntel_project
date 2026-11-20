import type { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { BusinessEntity, BusinessPersonnel, BusinessProduct } from "../models/index.js";
import {
  deleteRequestFiles,
  deleteStoredFile,
  describeUploadedFile,
  validateUploadedFile,
  type UploadedFileInfo,
} from "../config/upload.js";

export { uploadMultipleImages, uploadSingleImage } from "../config/upload.js";

const MAX_PRODUCT_IMAGES = 20;

type ProductImageMode = "append" | "replace";

function parsePositiveId(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function getUploadedFiles(req: Request): Express.Multer.File[] {
  return Array.isArray(req.files) ? req.files : [];
}

function findBusinessForRequest(req: Request): Promise<BusinessEntity | null> {
  const userId = req.user?.id;
  if (!userId) return Promise.resolve(null);
  return BusinessEntity.findOne({ where: { ownerUserId: userId } });
}

function validateFiles(
  files: Express.Multer.File[]
): { error: string | null } {
  for (const file of files) {
    const error = validateUploadedFile(file, "images");
    if (error) {
      // validateUploadedFile deletes the invalid file; remove the rest too.
      deleteRequestFiles(
        files.filter((candidate) => candidate !== file),
        "images"
      );
      return { error };
    }
  }
  return { error: null };
}

function sendMissingImage(res: Response, fieldName = "image") {
  return sendError(
    res,
    `No image uploaded. Attach a file with field name "${fieldName}".`,
    400,
    "ERR_NO_FILE"
  );
}

function isManagedImagePath(value: unknown): value is string {
  return typeof value === "string" && value.includes("/uploads/image/");
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function deleteReplacedFiles(previous: unknown, next: string[]): void {
  if (!Array.isArray(previous)) return;

  const nextSet = new Set(next);
  for (const imagePath of previous) {
    if (isManagedImagePath(imagePath) && !nextSet.has(imagePath)) {
      deleteStoredFile("images", imagePath);
    }
  }
}

type SingleImageTarget =
  | { kind: "personnel"; personnelId: number }
  | { kind: "product"; productId: number }
  | { kind: "none" };

function resolveSingleImageTarget(
  req: Request,
  forcedPersonnelId?: unknown
): { target: SingleImageTarget; error?: string } {
  const body = req.body ?? {};
  const personnelId = parsePositiveId(
    forcedPersonnelId ?? body.personnelId ?? body.personId
  );
  const productId = parsePositiveId(body.productId ?? req.query.productId);

  if (personnelId && productId) {
    return {
      target: { kind: "none" },
      error: "Send either personnelId or productId, not both.",
    };
  }
  if (personnelId) return { target: { kind: "personnel", personnelId } };
  if (productId) return { target: { kind: "product", productId } };
  return { target: { kind: "none" } };
}

async function handleSingleImage(
  req: Request,
  res: Response,
  forcedPersonnelId?: unknown
) {
  if (!req.file) return sendMissingImage(res);

  const signatureError = validateUploadedFile(req.file, "images");
  if (signatureError) {
    return sendError(res, signatureError, 400, "ERR_INVALID_FILE");
  }

  const info = describeUploadedFile(req, req.file, "images");
  const { target, error } = resolveSingleImageTarget(req, forcedPersonnelId);
  if (error) {
    deleteStoredFile("images", info.path);
    return sendError(res, error, 400, "ERR_INVALID_TARGET");
  }

  if (target.kind === "none") {
    return sendSuccess(
      res,
      {
        message: "Image uploaded successfully",
        ...imageResponse(info),
      },
      201
    );
  }

  try {
    const business = await findBusinessForRequest(req);
    if (!business) {
      deleteStoredFile("images", info.path);
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    if (target.kind === "personnel") {
      const person = await BusinessPersonnel.findOne({
        where: { id: target.personnelId, businessId: business.id },
      });
      if (!person) {
        deleteStoredFile("images", info.path);
        return sendError(
          res,
          "Personnel not found or not owned by your company",
          404,
          "ERR_PERSONNEL_NOT_FOUND"
        );
      }

      const previousPhoto = person.photoUrl;
      person.photoUrl = info.path;
      await person.save();

      if (previousPhoto !== info.path && isManagedImagePath(previousPhoto)) {
        deleteStoredFile("images", previousPhoto);
      }

      return sendSuccess(
        res,
        {
          message: `Image uploaded and saved as photo for personnel #${person.id}`,
          ...imageResponse(info),
          personnel: person,
        },
        201
      );
    }

    const product = await BusinessProduct.findOne({
      where: { id: target.productId, businessId: business.id },
    });
    if (!product) {
      deleteStoredFile("images", info.path);
      return sendError(
        res,
        "Product not found or not owned by your company",
        404,
        "ERR_PRODUCT_NOT_FOUND"
      );
    }

    const currentImages = Array.isArray(product.images) ? product.images : [];
    const nextImages = uniqueStrings([...currentImages, info.path]);
    if (nextImages.length > MAX_PRODUCT_IMAGES) {
      deleteStoredFile("images", info.path);
      return sendError(
        res,
        `A product can have at most ${MAX_PRODUCT_IMAGES} images.`,
        400,
        "ERR_IMAGE_LIMIT"
      );
    }

    product.images = nextImages;
    await product.save();

    return sendSuccess(
      res,
      {
        message: `Image uploaded and added to product #${product.id}`,
        ...imageResponse(info),
        product,
      },
      201
    );
  } catch (error) {
    deleteStoredFile("images", info.path);
    console.error("Upload Image Error:", error);
    return sendError(res, "Failed to upload image", 500, "ERR_INTERNAL_SERVER");
  }
}

function imageResponse(info: UploadedFileInfo) {
  return {
    filename: info.filename,
    originalName: info.originalName,
    path: info.path,
    url: info.url,
    size: info.size,
    mimetype: info.mimetype,
  };
}

/**
 * POST /api/v1/vendor/upload-image
 * POST /api/v1/vendor/products/upload-image
 * Optional target: personnelId/personId or productId.
 */
export async function uploadImageController(req: Request, res: Response) {
  return handleSingleImage(req, res);
}

/**
 * POST /api/v1/vendor/personnel/:id/photo
 */
export async function uploadPersonnelPhotoController(req: Request, res: Response) {
  return handleSingleImage(req, res, req.params.id);
}

/**
 * POST /api/v1/vendor/upload-images
 * POST /api/v1/vendor/products/upload-images
 * Uploads up to 10 images. Without productId it only stores files and returns
 * their paths. With productId it updates the owned product gallery.
 */
export async function uploadMultipleImagesController(req: Request, res: Response) {
  const files = getUploadedFiles(req);
  if (files.length === 0) {
    return sendMissingImage(res, "images");
  }

  const { error: signatureError } = validateFiles(files);
  if (signatureError) {
    return sendError(res, signatureError, 400, "ERR_INVALID_FILE");
  }

  const details = files.map((file) => describeUploadedFile(req, file, "images"));
  const paths = details.map((file) => file.path);
  const body = req.body ?? {};
  const productId = parsePositiveId(
    body.productId ?? body.id ?? req.query.productId ?? req.params.id
  );

  if (!productId) {
    return sendSuccess(
      res,
      {
        message: `${files.length} image(s) uploaded successfully`,
        count: files.length,
        paths,
        urls: details.map((file) => file.url),
        files: details,
      },
      201
    );
  }

  const rawMode = String(body.mode ?? "append").toLowerCase();
  if (rawMode !== "append" && rawMode !== "replace") {
    deleteRequestFiles(files, "images");
    return sendError(
      res,
      'Invalid mode. Use "append" or "replace".',
      400,
      "ERR_INVALID_MODE"
    );
  }
  const mode = rawMode as ProductImageMode;

  try {
    const business = await findBusinessForRequest(req);
    if (!business) {
      deleteRequestFiles(files, "images");
      return sendError(res, "Business profile not found", 404, "ERR_BUSINESS_NOT_FOUND");
    }

    const product = await BusinessProduct.findOne({
      where: { id: productId, businessId: business.id },
    });
    if (!product) {
      deleteRequestFiles(files, "images");
      return sendError(
        res,
        "Product not found or not owned by your company",
        404,
        "ERR_PRODUCT_NOT_FOUND"
      );
    }

    const previousImages = Array.isArray(product.images) ? product.images : [];
    const nextImages =
      mode === "replace" ? uniqueStrings(paths) : uniqueStrings([...previousImages, ...paths]);

    if (nextImages.length > MAX_PRODUCT_IMAGES) {
      deleteRequestFiles(files, "images");
      return sendError(
        res,
        `A product can have at most ${MAX_PRODUCT_IMAGES} images.`,
        400,
        "ERR_IMAGE_LIMIT"
      );
    }

    product.images = nextImages;
    await product.save();

    if (mode === "replace") {
      deleteReplacedFiles(previousImages, nextImages);
    }

    return sendSuccess(
      res,
      {
        message: `${files.length} image(s) uploaded and saved to product #${product.id}`,
        count: files.length,
        paths,
        urls: details.map((file) => file.url),
        files: details,
        product,
      },
      201
    );
  } catch (error) {
    deleteRequestFiles(files, "images");
    console.error("Upload Multiple Images Error:", error);
    return sendError(res, "Failed to upload images", 500, "ERR_INTERNAL_SERVER");
  }
}
