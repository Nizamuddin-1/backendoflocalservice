import { Response } from 'express';
import { AuthRequest } from '../types';
import { uploadImage, uploadImages, deleteImage } from '../services/uploadService';
import { AppError } from '../middleware/errorHandler';
import { handleControllerError } from '../utils/handleControllerError';

export const uploadSingle = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      throw new AppError('No image file provided', 400);
    }

    const filePath = file.path;
    const result = await uploadImage(filePath, { folder: 'localfix' });
    res.status(200).json({ data: result, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const uploadMultiple = async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError('No image files provided', 400);
    }

    const paths = files.map((f) => f.path);
    const results = await uploadImages(paths, { folder: 'localfix' });
    res.status(200).json({ data: results, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const deleteSingle = async (req: AuthRequest, res: Response) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      throw new AppError('Public ID is required', 400);
    }

    await deleteImage(publicId);
    res.status(200).json({ data: { message: 'Image deleted' }, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};
