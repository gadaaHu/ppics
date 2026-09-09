import express from 'express';
import {
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember,
    getDropdownData,
    getCooperativesByDistrict,
    getFamiliesByCooperative,
    approveMember
} from '../controllers/memberController.js';
import { auth, isAdmin, isLeader, isMember } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();

// =============================================
// DROPDOWN DATA ROUTES
// =============================================
// Get dropdown data (districts, cooperatives, families, positions)
router.get('/dropdown', auth, getDropdownData);

// Get cooperatives by district
router.get('/cooperatives/:districtId', auth, getCooperativesByDistrict);

// Get families by cooperative
router.get('/families/:cooperativeId', auth, getFamiliesByCooperative);

// =============================================
// MEMBER ROUTES - View (Admin, Leader, Member)
// =============================================
// Get all members
router.get('/', auth, getMembers);

// Get single member by ID
router.get('/:id', auth, getMemberById);

// =============================================
// CREATE MEMBER - Admin, Leader, Member can add
// =============================================
router.post('/', auth, isMember, upload.single('photo'), createMember);

// =============================================
// UPDATE MEMBER - Only Admin and Leader
// =============================================
router.put('/:id', auth, isLeader, upload.single('photo'), updateMember);

// =============================================
// APPROVE MEMBER
// =============================================
router.put('/:id/approve', auth, approveMember);

// =============================================
// DELETE MEMBER - Only Admin
// =============================================
router.delete('/:id', auth, isAdmin, deleteMember);

export default router;