const multer = require("multer");
const path = require('path');
const fs = require('fs');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/ogg',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

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
      const baseName = originalName.replace(/[^a-zA-Z0-9.]/g, '_').replace(fileExtension, '');
      const fileName = `${timestamp}_${baseName}${fileExtension}`;
      cb(null, fileName);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed.`), false);
    }
  };

  const multerInstance = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter,
  });

  return {
    single: (fieldName) => {
      const middleware = multerInstance.single(fieldName);
      return (req, res, cb) => {
        middleware(req, res, (err) => {
          if (err) return cb(err);
          if (req.file) {
            req.file.folder = folder;
          }
          cb();
        });
      };
    },
    any: () => {
      const middleware = multerInstance.any();
      return (req, res, cb) => {
        middleware(req, res, (err) => {
          if (err) return cb(err);
          if (req.file) {
            req.file.folder = folder;
          }
          if (req.files && req.files.length > 0) {
            req.files.forEach(f => { f.folder = folder; });
            req.file = req.files[0];
          }
          cb();
        });
      };
    },
    array: multerInstance.array,
  };
};

const uploadSingle = (fieldName, folder = 'uploads') => {
  if (typeof fieldName !== 'string') {
    throw new Error('uploadSingle must be called with a field name, e.g., uploadSingle("image")');
  }
  return createUploadMiddleware(folder).single(fieldName);
};
const uploadMultiple = (fieldName, maxCount = 10, folder = 'uploads') => {
  if (typeof fieldName !== 'string') {
    throw new Error('uploadMultiple must be called with a field name, e.g., uploadMultiple("files")');
  }
  return createUploadMiddleware(folder).array(fieldName, maxCount);
};
const uploadfile = createUploadMiddleware('images');

module.exports = uploadfile;
module.exports.uploadSingle = uploadSingle;
module.exports.uploadMultiple = uploadMultiple;
module.exports.createUploadMiddleware = createUploadMiddleware;
module.exports.upload = uploadfile;
