 import express from 'express';
import {
  markAttendance,
  getAttendanceByEvent,
  getAttendanceByMember,
  getAttendanceStats,
  scanBarcode
} from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin routes
router.get('/stats', authorize('admin'), getAttendanceStats);
router.post('/mark', authorize('admin'), markAttendance);
router.post('/scan', authorize('admin'), scanBarcode);
router.get('/event/:eventId', authorize('admin'), getAttendanceByEvent);
router.get('/member/:memberId', authorize('admin'), getAttendanceByMember);

export default router;
