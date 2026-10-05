import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { uploadImages } from '../services/imageService.js';

export const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files?.length) return sendError(res, 'No images selected', ['Choose at least one image to upload.'], 400);
    const images = await uploadImages(req.files, 'products');
    return sendSuccess(res, 'Product images uploaded', { images }, 201);
  } catch (error) {
    next(error);
  }
};

export const uploadCategoryImage = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 'No image selected', ['Choose an image to upload.'], 400);
    const [image] = await uploadImages([req.file], 'categories');
    return sendSuccess(res, 'Category image uploaded', { image }, 201);
  } catch (error) {
    next(error);
  }
};
