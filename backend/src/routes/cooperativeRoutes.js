 import express from 'express';
import {
  getCooperatives,
  getCooperativeById,
  createCooperative,
  updateCooperative,
  deleteCooperative,
  getCooperativeStats
} from '../controllers/cooperativeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getCooperatives);
router.get('/stats', getCooperativeStats);
router.get('/:id', getCooperativeById);
router.post('/', createCooperative);
router.put('/:id', updateCooperative);
router.delete('/:id', deleteCooperative);

export default router;
