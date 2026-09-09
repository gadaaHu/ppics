import express from 'express';
import { 
  login, 
  logout, 
  getProfile, 
  register,
  changeUserPassword,
  changeMemberPassword,
  getUsers,
  getMembersList,
  resetMemberPassword,
  updateProfile
} from '../controllers/authController.js';
import { auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.post('/login', login);
router.post('/register', register);

// ==================== PROTECTED ROUTES ====================
router.get('/profile', auth, getProfile);
router.post('/logout', auth, logout);
router.put('/profile', auth, updateProfile);

// Password change routes
router.put('/change-password/user', auth, changeUserPassword);
router.put('/change-password/member', auth, changeMemberPassword);

// ==================== ADMIN ONLY ROUTES ====================
router.get('/users', auth, isAdmin, getUsers);
router.get('/members-list', auth, isAdmin, getMembersList);
router.put('/reset-password/:memberId', auth, isAdmin, resetMemberPassword);

export default router;