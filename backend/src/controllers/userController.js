import { query, getOne } from '../config/database.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res) => {
  try {
    const users = await query(`
      SELECT u.user_id, u.username, u.full_name, u.email, u.role, u.status, u.cooperative_id, u.family_id, c.cooperative_name, f.family_name 
      FROM users u 
      LEFT JOIN cooperatives c ON u.cooperative_id = c.cooperative_id
      LEFT JOIN families f ON u.family_id = f.family_id
    `);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, password, full_name, email, role, cooperative_id, family_id, status } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ success: false, message: 'Username, password, and role are required' });
    }

    if (role === 'leader' && !cooperative_id) {
      return res.status(400).json({ success: false, message: 'Cooperative assignment is required for leaders' });
    }

    if (['family_leader', 'member'].includes(role) && (!cooperative_id || !family_id)) {
      return res.status(400).json({ success: false, message: 'Cooperative and Family assignment are required for this role' });
    }

    // Check if user already exists
    const existing = await getOne('SELECT * FROM users WHERE username = ?', [username]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const coopId = role === 'admin' ? null : cooperative_id;
    const famId = ['family_leader', 'member'].includes(role) ? family_id : null;
    const userStatus = status || 'active';

    const result = await query(
      'INSERT INTO users (username, password, full_name, email, role, cooperative_id, family_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, full_name || null, email || null, role, coopId, famId, userStatus]
    );

    res.status(201).json({ success: true, message: 'User created successfully', data: { user_id: result.insertId } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, full_name, email, role, cooperative_id, family_id, status } = req.body;

    if (!username || !role) {
      return res.status(400).json({ success: false, message: 'Username and role are required' });
    }

    if (role === 'leader' && !cooperative_id) {
      return res.status(400).json({ success: false, message: 'Cooperative assignment is required for leaders' });
    }

    if (['family_leader', 'member'].includes(role) && (!cooperative_id || !family_id)) {
      return res.status(400).json({ success: false, message: 'Cooperative and Family assignment are required for this role' });
    }

    const existing = await getOne('SELECT * FROM users WHERE username = ? AND user_id != ?', [username, id]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username already taken by another user' });
    }

    const coopId = role === 'admin' ? null : cooperative_id;
    const famId = ['family_leader', 'member'].includes(role) ? family_id : null;
    const userStatus = status || 'active';

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        'UPDATE users SET username = ?, password = ?, full_name = ?, email = ?, role = ?, cooperative_id = ?, family_id = ?, status = ? WHERE user_id = ?',
        [username, hashedPassword, full_name || null, email || null, role, coopId, famId, userStatus, id]
      );
    } else {
      await query(
        'UPDATE users SET username = ?, full_name = ?, email = ?, role = ?, cooperative_id = ?, family_id = ?, status = ? WHERE user_id = ?',
        [username, full_name || null, email || null, role, coopId, famId, userStatus, id]
      );
    }

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deletion if we had context, but for now just execute
    await query('DELETE FROM users WHERE user_id = ?', [id]);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};
