import { query, getOne, insert, update } from '../config/database.js';

// Get all payments relevant to the user
export const getPayments = async (req, res) => {
  try {
    const { role, cooperative_id, family_id } = req.user;
    
    let sql = `
      SELECT p.*, m.full_name as member_name, m.phone as member_phone, u.full_name as approver_name
      FROM member_payments p
      JOIN members m ON p.member_id = m.member_id
      LEFT JOIN users u ON p.approved_by = u.user_id
    `;
    const params = [];
    
    // Filter by scope
    if (role === 'leader') {
      sql += ' WHERE m.cooperative_id = ?';
      params.push(cooperative_id);
    } else if (role === 'family_leader') {
      sql += ' WHERE m.cooperative_id = ? AND m.family_id = ?';
      params.push(cooperative_id, family_id);
    }
    
    sql += ' ORDER BY p.created_at DESC';

    const payments = await query(sql, params);
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

export const getMemberPayments = async (req, res) => {
  try {
    const { memberId, isMember, userId } = req.user;
    
    let targetMemberId = memberId;

    if (!isMember || !targetMemberId) {
      const userRow = await getOne('SELECT phone FROM users WHERE user_id = ?', [userId]);
      if (userRow) {
        const memberRow = await getOne('SELECT member_id FROM members WHERE phone = ?', [userRow.phone]);
        if (memberRow) {
          targetMemberId = memberRow.member_id;
        }
      }
    }

    if (!targetMemberId) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    const payments = await query(`
      SELECT p.*, m.full_name as member_name, u.full_name as approver_name
      FROM member_payments p
      JOIN members m ON p.member_id = m.member_id
      LEFT JOIN users u ON p.approved_by = u.user_id
      WHERE p.member_id = ? AND p.status = 'Approved'
      ORDER BY p.created_at DESC
    `, [targetMemberId]);
    
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching member payments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch member payments' });
  }
};

// Log a new payment (Pending by default)
export const createPayment = async (req, res) => {
  try {
    const { member_id, amount, payment_month, payment_year } = req.body;
    
    if (!member_id || !amount || !payment_month || !payment_year) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Prevent duplicate payment for same member + month + year
    const existing = await getOne(
      'SELECT payment_id FROM member_payments WHERE member_id = ? AND payment_month = ? AND payment_year = ?',
      [member_id, payment_month, payment_year]
    );
    if (existing) {
      return res.status(409).json({ success: false, message: 'A payment record for this member and period already exists.' });
    }

    // Insert pending payment
    const insertId = await insert(
      'INSERT INTO member_payments (member_id, amount, payment_month, payment_year, status) VALUES (?, ?, ?, ?, ?)',
      [member_id, amount, payment_month, payment_year, 'Pending']
    );

    res.status(201).json({ success: true, message: 'Payment logged successfully', data: { payment_id: insertId } });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment' });
  }
};

// Approve payment and generate receipt
export const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user;

    // Only allow family leaders or higher to approve payments
    if (role === 'member') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const existing = await getOne('SELECT * FROM member_payments WHERE payment_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (existing.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Payment is already approved' });
    }

    // Generate unique receipt number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    const receipt_number = `RCPT-${timestamp}-${random}`;

    await update(
      'UPDATE member_payments SET status = ?, approved_by = ?, receipt_number = ? WHERE payment_id = ?',
      ['Approved', userId, receipt_number, id]
    );

    res.json({ success: true, message: 'Payment approved successfully', receipt_number });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ success: false, message: 'Failed to approve payment' });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM member_payments WHERE payment_id = ?', [id]);
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete payment' });
  }
};
