import express from 'express';
import {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
  getFamilyStats
} from '../controllers/familyController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getFamilies);
router.get('/stats', getFamilyStats);
router.get('/:id', getFamilyById);
router.post('/', createFamily);
router.put('/:id', updateFamily);
router.delete('/:id', deleteFamily);

export default router;