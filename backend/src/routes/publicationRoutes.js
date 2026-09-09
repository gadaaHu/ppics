import express from 'express';
import {
    getPublications,
    getPublicationById,
    createPublication,
    updatePublication,
    deletePublication,
    getPublicationCategories
} from '../controllers/publicationController.js';
import { auth, isAdmin } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();

// =============================================
// PUBLIC ROUTES
// =============================================
router.get('/', getPublications);
router.get('/categories', getPublicationCategories);
router.get('/:id', getPublicationById);

// =============================================
// ADMIN ROUTES
// =============================================
router.post('/', auth, isAdmin, upload.single('file'), createPublication);
router.put('/:id', auth, isAdmin, upload.single('file'), updatePublication);
router.delete('/:id', auth, isAdmin, deletePublication);

export default router;