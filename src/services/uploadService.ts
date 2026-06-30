import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export async function uploadImage(
  filePath: string,
  options: { folder?: string; transformation?: string } = {}
): Promise<UploadResult> {
  try {
    if (!env.cloudinaryCloudName) {
      return {
        url: filePath,
        publicId: 'mock',
        width: 0,
        height: 0,
        format: 'jpg',
      };
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder || 'localfix',
      transformation: options.transformation || 'q_auto',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch {
    throw new AppError('Failed to upload image', 500);
  }
}

export async function uploadImages(
  filePaths: string[],
  options: { folder?: string } = {}
): Promise<UploadResult[]> {
  try {
    if (!env.cloudinaryCloudName) {
      return filePaths.map((fp) => ({
        url: fp,
        publicId: 'mock',
        width: 0,
        height: 0,
        format: 'jpg',
      }));
    }

    const uploads = filePaths.map((fp) => uploadImage(fp, options));
    return Promise.all(uploads);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to upload images', 500);
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    if (!env.cloudinaryCloudName) return;
    await cloudinary.uploader.destroy(publicId);
  } catch {
    throw new AppError('Failed to delete image', 500);
  }
}
