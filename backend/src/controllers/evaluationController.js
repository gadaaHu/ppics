import { query, getOne, insert, update } from '../config/database.js';

export const createEvaluation = async (req, res) => {
  try {
    const { member_id, evaluation_period, total_score, criteria_scores, remarks } = req.body;
    const evaluator_id = req.user.userId;
    const userRole = req.user.role;

    if (!member_id || !evaluation_period || total_score === undefined) {
      return res.status(400).json({ success: false, message: 'Member, evaluation period, and score are required.' });
    }

    // Prevent duplicate evaluations for same member + period
    const existing = await getOne(
      'SELECT evaluation_id FROM member_evaluations WHERE member_id = ? AND evaluation_period = ?',
      [member_id, evaluation_period]
    );
    if (existing) {
      return res.status(409).json({ success: false, message: 'An evaluation for this member and period already exists.' });
    }

    const status = userRole === 'family_leader' ? 'Pending' : 'Approved';

    const result = await insert(
      'INSERT INTO member_evaluations (member_id, evaluator_id, evaluation_period, total_score, criteria_scores, remarks, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [member_id, evaluator_id, evaluation_period, total_score, JSON.stringify(criteria_scores || {}), remarks || null, status]
    );

    res.status(201).json({ success: true, message: 'Evaluation submitted successfully', data: { evaluation_id: result } });
  } catch (error) {
    console.error('Error creating evaluation:', error);
    res.status(500).json({ success: false, message: 'Failed to create evaluation' });
  }
};

export const getEvaluations = async (req, res) => {
  try {
    const { role, cooperative_id, family_id } = req.user;
    
    let sql = `
      SELECT e.*, m.full_name as member_name, m.phone as member_phone, u.full_name as evaluator_name, u.role as evaluator_role
      FROM member_evaluations e
      JOIN members m ON e.member_id = m.member_id
      JOIN users u ON e.evaluator_id = u.user_id
    `;
    const params = [];
    
    if (role === 'leader') {
      sql += ' WHERE m.cooperative_id = ?';
      params.push(cooperative_id);
    } else if (role === 'family_leader') {
      sql += ' WHERE m.cooperative_id = ? AND m.family_id = ?';
      params.push(cooperative_id, family_id);
    }
    
    sql += ' ORDER BY e.created_at DESC';

    const evaluations = await query(sql, params);
    res.json({ success: true, data: evaluations });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch evaluations' });
  }
};

export const getMemberEvaluations = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluations = await query(`
      SELECT e.*, u.full_name as evaluator_name, u.role as evaluator_role
      FROM member_evaluations e
      JOIN users u ON e.evaluator_id = u.user_id
      WHERE e.member_id = ?
      ORDER BY e.created_at DESC
    `, [id]);
    
    res.json({ success: true, data: evaluations });
  } catch (error) {
    console.error('Error fetching member evaluations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch member evaluations' });
  }
};

export const approveEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, cooperative_id } = req.user;

    // Only allow admins and cooperative leaders to approve
    if (role !== 'admin' && role !== 'leader') {
      return res.status(403).json({ success: false, message: 'Unauthorized to approve evaluations' });
    }

    // Verify the evaluation exists and optionally belongs to the leader's cooperative
    const existing = await getOne(`
      SELECT e.*, m.cooperative_id
      FROM member_evaluations e
      JOIN members m ON e.member_id = m.member_id
      WHERE e.evaluation_id = ?
    `, [id]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }

    if (role === 'leader' && existing.cooperative_id !== cooperative_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Member outside your cooperative' });
    }

    if (existing.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Evaluation is already approved' });
    }

    await update('UPDATE member_evaluations SET status = ? WHERE evaluation_id = ?', ['Approved', id]);

    res.json({ success: true, message: 'Evaluation approved successfully' });
  } catch (error) {
    console.error('Error approving evaluation:', error);
    res.status(500).json({ success: false, message: 'Failed to approve evaluation' });
  }
};

export const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { evaluation_period, total_score, criteria_scores, remarks } = req.body;
    
    // Check if evaluation exists
    const existing = await getOne('SELECT * FROM member_evaluations WHERE evaluation_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }

    // Optional: You could prevent editing if it's already 'Approved'
    // if (existing.status === 'Approved') {
    //   return res.status(400).json({ success: false, message: 'Cannot edit an approved evaluation' });
    // }

    await update(
      'UPDATE member_evaluations SET evaluation_period = ?, total_score = ?, criteria_scores = ?, remarks = ? WHERE evaluation_id = ?',
      [evaluation_period, total_score, JSON.stringify(criteria_scores || {}), remarks || null, id]
    );

    res.json({ success: true, message: 'Evaluation updated successfully' });
  } catch (error) {
    console.error('Error updating evaluation:', error);
    res.status(500).json({ success: false, message: 'Failed to update evaluation' });
  }
};

export const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM member_evaluations WHERE evaluation_id = ?', [id]);
    res.json({ success: true, message: 'Evaluation deleted successfully' });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    res.status(500).json({ success: false, message: 'Failed to delete evaluation' });
  }
};
