 import express from 'express';
import {
  getDistricts,
  getDistrictById,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  getDistrictStats
} from '../controllers/districtController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Public routes (within admin)
router.get('/', getDistricts);
router.get('/stats', getDistrictStats);
router.get('/:id', getDistrictById);

// CRUD operations
router.post('/', createDistrict);
router.put('/:id', updateDistrict);
router.delete('/:id', deleteDistrict);

export default router;
