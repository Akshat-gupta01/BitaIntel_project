const fs = require("fs/promises");
const path = require("path");
const {
  uploadDirectory,
} = require("../middleware/upload.middleware");

const MAX_DOCUMENTS = 5;

//Is function ka kaam local folder se uploaded files delete karna hai
//Promise.allSettled() sabhi delete operations ke settle hone ka wait karta hai, chahe koi successful ho ya fail.
async function removeUploadedFiles(files = []) {
  await Promise.allSettled(
    files.map((file) => fs.unlink(file.path))
  );
}

async function validatePdfSignature(file) {
  const handle = await fs.open(file.path, "r");

  try {
    const buffer = Buffer.alloc(5);
    const { bytesRead } = await handle.read(buffer, 0, 5, 0);

    return (
      bytesRead === 5 &&
      buffer.toString("ascii") === "%PDF-"
    );
  } finally {
    await handle.close();
  }
}

function getDocuments(profile) {
  const documents = profile.documents_url;

  if (documents == null) {
    return [];
  }

  if (!Array.isArray(documents)) {
    const error = new Error("Invalid document data in profile");
    error.statusCode = 500;
    throw error;
  }

  return documents;
}

async function addDocuments(profile, files, documentType = null) {
  const existingDocuments = getDocuments(profile);

  if (existingDocuments.length + files.length > MAX_DOCUMENTS) {
    const error = new Error(
      `A maximum of ${MAX_DOCUMENTS} documents is allowed per business profile`
    );
    error.statusCode = 400;
    throw error;
  }

  for (const file of files) {
    const validPdf = await validatePdfSignature(file);

    if (!validPdf) {
      const error = new Error(
        `${file.originalname} is not a valid PDF file`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const newDocuments = files.map((file) => ({
    documentType: documentType || null,
    documentName: path.parse(file.originalname).name,
    documentUrl: `/api/business-profile/documents/${path.basename(file.filename)}`,
    status: 'pending'
  }));

  const updatedDocuments = [
    ...existingDocuments,
    ...newDocuments,
  ];

  await profile.update({
    documents_url: updatedDocuments,
  });

  return newDocuments;
}

module.exports = {
  addDocuments,
  removeUploadedFiles,
  uploadDirectory,
};