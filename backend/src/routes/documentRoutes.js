import express from 'express';
import {
    getDocumentTypes,
    createDocumentType,
    getFamilies,
    getCooperativeDocuments,
    getFamilyDocuments,
    addCooperativeDocument,
    updateCooperativeDocument,
    deleteCooperativeDocument,
    addFamilyDocument,
    updateFamilyDocument,
    deleteFamilyDocument,
    getDocumentStats
} from '../controllers/documentController.js';
import { auth, isAdmin, isLeader } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();

// =============================================
// PUBLIC ROUTES (Require Auth)
// =============================================

// Document types
router.get('/types', auth, getDocumentTypes);

// Families
router.get('/families/:cooperativeId', auth, getFamilies);

// Cooperative documents
router.get('/cooperative/:cooperativeId', auth, getCooperativeDocuments);

// Family documents
router.get('/family/:familyId', auth, getFamilyDocuments);

// Document statistics
router.get('/stats', auth, getDocumentStats);

// =============================================
// ADMIN ONLY ROUTES
// =============================================
router.post('/types', auth, isAdmin, createDocumentType);

// =============================================
// LEADER/ADMIN ROUTES (Cooperative Documents)
// =============================================
router.post('/cooperative', auth, isLeader, upload.single('attachment'), addCooperativeDocument);
router.put('/cooperative/:id', auth, isLeader, upload.single('attachment'), updateCooperativeDocument);
router.delete('/cooperative/:id', auth, isLeader, deleteCooperativeDocument);

// =============================================
// AUTHENTICATED USER ROUTES (Family Documents)
// =============================================
router.post('/family', auth, upload.single('attachment'), addFamilyDocument);
router.put('/family/:id', auth, upload.single('attachment'), updateFamilyDocument);
router.delete('/family/:id', auth, deleteFamilyDocument);

export default router;