import express from 'express';
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  removeAttachment,
  getDocumentTypes,
  getFilterData
} from '../controllers/planController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Filter data routes
router.get('/filter-data', getFilterData);
router.get('/document-types', getDocumentTypes);

// CRUD routes
router.get('/', getPlans);
router.get('/:id', getPlanById);
router.post('/', createPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);
router.delete('/:id/attachment', removeAttachment);

export default router;