 import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getGallery,
  getGalleryById,
  uploadGallery,
  deleteGallery,
  deleteGalleryByDate,
  updateGallery
} from '../controllers/galleryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for gallery uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/gallery';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, WEBP allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Public routes (view only)
router.get('/', getGallery);
router.get('/:id', getGalleryById);

// Admin routes
router.use(authenticate);
router.use(authorize('admin'));

router.post('/upload', upload.array('images', 20), uploadGallery);
router.delete('/:id', deleteGallery);
router.delete('/date/:date', deleteGalleryByDate);
router.put('/:id', updateGallery);

export default router;
