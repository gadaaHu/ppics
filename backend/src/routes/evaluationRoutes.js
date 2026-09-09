import express from 'express';
import { createEvaluation, getEvaluations, getMemberEvaluations, deleteEvaluation, approveEvaluation, updateEvaluation } from '../controllers/evaluationController.js';
import { auth, isAnyLeader } from '../middleware/auth.js';

const router = express.Router();

// Allow leaders and admins to fetch and create evaluations
router.get('/', auth, isAnyLeader, getEvaluations);
router.post('/', auth, isAnyLeader, createEvaluation);
router.put('/:id', auth, isAnyLeader, updateEvaluation);

// Allow any authenticated user to view member evaluations (e.g. member viewing their own, or admin)
router.get('/member/:id', auth, getMemberEvaluations);

// Allow leaders and admins to approve evaluations
router.put('/:id/approve', auth, isAnyLeader, approveEvaluation);

// Allow deletion of evaluations (for now, any leader can do this, you might restrict to admin later)
router.delete('/:id', auth, isAnyLeader, deleteEvaluation);

export default router;
