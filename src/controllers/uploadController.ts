import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadImage, uploadImages, deleteImage } from '../services/uploadService';
import { AppError } from '../middleware/errorHandler';

export const uploadSingle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No image file provided', 400);
  }
  const result = await uploadImage(req.file.path, { folder: 'localfix' });
  res.json(result);
});

export const uploadMultiple = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new AppError('No image files provided', 400);
  }
  const paths = files.map((f) => f.path);
  const results = await uploadImages(paths, { folder: 'localfix' });
  res.json(results);
});

export const deleteSingle = asyncHandler(async (req: Request, res: Response) => {
  const { publicId } = req.params;
  if (!publicId) {
    throw new AppError('Public ID is required', 400);
  }
  await deleteImage(publicId);
  res.json({ message: 'Image deleted' });
});
