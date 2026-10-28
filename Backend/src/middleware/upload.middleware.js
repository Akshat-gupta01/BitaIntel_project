const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");


// file ka par save hogi /uploads/business-documents folder me 
//if folder nhi hai toh use create karega agar parent folder bhi nhi hai toh create karega.
const uploadDirectory = path.resolve(
  process.cwd(),
  "uploads",
  "business-documents"
);

fs.mkdirSync(uploadDirectory, { recursive: true });
// multer ko yeh btana jo file upload kar rahe hai uski kahha store karna hai 
//destination  function hai jo file ko store karne ki jagah batata hai 
//filename function hai jo file ka name batata hai 
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  // filename crypto use karke random bana rahe hai taaki collision na ho 
  filename: (req, file, callback) => {
    const filename = `${crypto.randomUUID()}.pdf`;
    callback(null, filename);
  },
});

//Kaunsi file upload ho sakti hai?  only pdf wali hi allowed hogi
const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".pdf" || file.mimetype !== "application/pdf") {
    const error = new Error("Only PDF documents are allowed");
    error.statusCode = 400;
    return callback(error);
  }

  callback(null, true);
};

// Maximum 5 files, each up to 5MB
const uploadDocuments = multer({
  storage,
  fileFilter,
  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = {
  uploadDocuments,
  uploadDirectory,
};