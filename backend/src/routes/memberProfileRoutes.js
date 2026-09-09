import express from 'express';
import {
    getMemberProfile,
    updateMemberProfile,
    changeMemberPassword,
    uploadProfilePhoto,
    getMemberStats
} from '../controllers/memberProfileController.js';
import { auth } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();

// Get member profile
router.get('/profile', auth, getMemberProfile);

// Update member profile
router.put('/profile', auth, upload.single('photo'), updateMemberProfile);

// Upload profile photo
router.post('/profile/photo', auth, upload.single('photo'), uploadProfilePhoto);

// Change password
router.put('/profile/password', auth, changeMemberPassword);

// Get member stats
router.get('/profile/stats', auth, getMemberStats);

export default router;