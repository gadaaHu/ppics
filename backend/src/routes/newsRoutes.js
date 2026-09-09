import express from 'express';
import {
  getNews,
  getLatestNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
} from '../controllers/newsController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes (view only)
router.get('/', getNews);
router.get('/latest', getLatestNews); // ✅ Added route for latest news
router.get('/:id', getNewsById);

// Admin routes
router.use(authenticate);
router.use(authorize('admin'));

router.post('/', upload.single('news_image'), createNews);
router.put('/:id', upload.single('news_image'), updateNews);
router.delete('/:id', deleteNews);

export default router;