import express from 'express';
import { getPayments, createPayment, approvePayment, deletePayment, getMemberPayments } from '../controllers/paymentController.js';
import { auth, isAnyLeader } from '../middleware/auth.js';

const router = express.Router();

// Allow any leader (Family Leader or higher) to fetch, create, approve, and delete payments
router.get('/', auth, isAnyLeader, getPayments);
router.post('/', auth, isAnyLeader, createPayment);
router.put('/:id/approve', auth, isAnyLeader, approvePayment);
router.delete('/:id', auth, isAnyLeader, deletePayment);

// Allow members to fetch their own payments
router.get('/my-payments', auth, getMemberPayments);

export default router;
