import multer from 'multer';

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      const error = new Error('Only JPEG, PNG, WebP, and AVIF images are allowed.');
      error.statusCode = 415;
      return callback(error);
    }
    return callback(null, true);
  },
});

export const uploadProductImages = upload.array('images', 8);
export const uploadCategoryImage = upload.single('image');
