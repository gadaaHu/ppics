import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', authenticate, isAdmin, updateSettings);

export default router;
