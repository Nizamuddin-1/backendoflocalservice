import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import * as uploadController from '../controllers/uploadController';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.use(authenticate);

router.post('/image', upload.single('image'), uploadController.uploadSingle);
router.post('/images', upload.array('images', 10), uploadController.uploadMultiple);
router.delete('/image/:publicId', uploadController.deleteSingle);

export default router;
