const multer = require("multer");
const path = require('path');
const fs = require('fs');

const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/webm',
  'video/ogg',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const createUploadMiddleware = (folder = 'uploads') => {
  const uploadPath = path.join('public', folder);
  
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const originalName = file.originalname;
      const fileExtension = path.extname(originalName);
      const timestamp = Date.now();
      let fileName = `${timestamp}_${originalName.replace(/[^a-zA-Z0-9.]/g, '_')}`;

      cb(null, fileName);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF, WEBP, SVG, MP4, WEBM, OGG`), false);
    }
  };

  return multer({
    storage: storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
    fileFilter: fileFilter,
  });
};

const uploadSingle = createUploadMiddleware('uploads').single('file');
const uploadMultiple = createUploadMiddleware('uploads').array('files', 10);
const uploadfile = createUploadMiddleware('images');

module.exports = uploadfile;
module.exports.uploadSingle = uploadSingle;
module.exports.uploadMultiple = uploadMultiple;
module.exports.createUploadMiddleware = createUploadMiddleware;
module.exports.upload = uploadfile;
