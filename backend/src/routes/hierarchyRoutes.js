import express from 'express';
import { getHierarchy, getCooperativeHierarchy } from '../controllers/hierarchyController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with authentication)
router.get('/', authenticate, getHierarchy);
router.get('/cooperative/:cooperativeId', authenticate, getCooperativeHierarchy);

export default router;