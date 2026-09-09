import express from 'express';
import {
    getELearningMaterials,
    getELearningMaterialById,
    createELearningMaterial,
    updateELearningMaterial,
    deleteELearningMaterial,
    getELearningCategories
} from '../controllers/eLearningController.js';
import { auth, isAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for e-learning uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/e-learning';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|mp4|avi|mov|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images, documents, and videos are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: fileFilter
});

// =============================================
// PUBLIC ROUTES
// =============================================
router.get('/', getELearningMaterials);
router.get('/categories', getELearningCategories);
router.get('/:id', getELearningMaterialById);

// =============================================
// ADMIN ROUTES
// =============================================
// Create
router.post('/', auth, isAdmin, upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), createELearningMaterial);

// Update - Handle PUT with _method override
router.post('/:id', auth, isAdmin, upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), (req, res, next) => {
    // Check if _method=PUT was sent
    if (req.body._method === 'PUT') {
        // Remove _method from body to avoid SQL issues
        delete req.body._method;
        // Call the update controller
        updateELearningMaterial(req, res, next);
    } else {
        // If no _method, treat as GET or other
        res.status(405).json({
            success: false,
            message: 'Method not allowed. Use _method=PUT for updates.'
        });
    }
});

// Delete
router.delete('/:id', auth, isAdmin, deleteELearningMaterial);

export default router;