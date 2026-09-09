import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, getOne, insert, update } from '../config/database.js';

// ✅ LOGIN - Supports Users and Members
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/Phone and password are required'
      });
    }

    let user = null;
    let userType = null;
    let memberData = null;

    // Try users table
    const dbUser = await getOne(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (dbUser) {
      user = dbUser;
      userType = 'user';
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    } else {
      // Try members table
      const member = await getOne(
        'SELECT * FROM members WHERE phone = ?',
        [username]
      );

      if (member) {
        memberData = member;
        userType = 'member';
        
        const defaultPassword = 'TempIcspp@2026!';
        const memberPassword = member.password || defaultPassword;
        
        if (memberPassword !== password) {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
          });
        }

        if (member.status === 'inactive') {
          return res.status(401).json({
            success: false,
            message: 'Your account is deactivated. Please contact admin.'
          });
        }

        user = {
          user_id: `M${member.member_id}`,
          username: member.phone,
          full_name: member.full_name,
          role: 'member',
          status: member.status || 'active',
          is_member: true,
          member_id: member.member_id,
          cooperative_id: member.cooperative_id,
          district_id: member.district_id,
          family_id: member.family_id,
          phone: member.phone,
          email: member.email
        };
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }

    if (userType === 'user' && user.status === 'inactive') {
      return res.status(401).json({
        success: false,
        message: 'Your account is deactivated. Please contact admin.'
      });
    }

    const token = jwt.sign(
      { 
        userId: user.user_id,
        username: user.username,
        role: user.role,
        userType: userType,
        isMember: userType === 'member',
        memberId: userType === 'member' ? user.member_id : null,
        cooperative_id: user.cooperative_id || null,
        family_id: user.family_id || null
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const userData = {
      user_id: user.user_id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      is_member: userType === 'member',
      member_id: userType === 'member' ? user.member_id : null,
      phone: user.phone || null,
      email: user.email || null,
      cooperative_id: user.cooperative_id || null,
      district_id: user.district_id || null,
      family_id: user.family_id || null
    };

    // 📊 Get member statistics - Check table structure first
    let stats = null;
    if (userType === 'member' && memberData) {
      try {
        // Try to get attendance count - check if column exists
        let attendanceCount = 0;
        try {
          // First, check if the attendance table has member_id or member_no
          const tableInfo = await query('SHOW COLUMNS FROM attendance');
          const hasMemberId = tableInfo.some(col => col.Field === 'member_id');
          const hasMemberNo = tableInfo.some(col => col.Field === 'member_no');
          const hasMember = tableInfo.some(col => col.Field === 'member');
          
          if (hasMemberId) {
            const result = await getOne(
              'SELECT COUNT(*) as total FROM attendance WHERE member_id = ?',
              [memberData.member_id]
            );
            attendanceCount = result?.total || 0;
          } else if (hasMemberNo) {
            const result = await getOne(
              'SELECT COUNT(*) as total FROM attendance WHERE member_no = ?',
              [memberData.member_no || memberData.member_id]
            );
            attendanceCount = result?.total || 0;
          } else if (hasMember) {
            const result = await getOne(
              'SELECT COUNT(*) as total FROM attendance WHERE member = ?',
              [memberData.member_id]
            );
            attendanceCount = result?.total || 0;
          }
        } catch (e) {
          // If attendance table doesn't exist or column not found, just skip
          console.log('⚠️ Attendance table not found or column missing:', e.message);
        }
        
        stats = {
          totalAttendance: attendanceCount,
          memberSince: memberData.created_at || memberData.membership_year || new Date().toISOString().split('T')[0]
        };
      } catch (error) {
        console.log('⚠️ Could not fetch member stats:', error.message);
        stats = {
          totalAttendance: 0,
          memberSince: memberData?.created_at || new Date().toISOString().split('T')[0]
        };
      }
    }

    console.log(`✅ Login successful: ${user.full_name} (${userType})`);

    res.json({
      success: true,
      token,
      user: userData,
      stats: stats,
      message: `Welcome ${user.full_name}!`
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// ✅ REGISTER
export const register = async (req, res) => {
  try {
    const { username, password, full_name, role, cooperative_id, phone } = req.body;

    if (!username || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Username, password and full name are required'
      });
    }

    const existingUser = await getOne('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    const sql = `
      INSERT INTO users (username, password, full_name, role, cooperative_id, phone, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())
    `;

    const userId = await insert(sql, [
      username,
      password,
      full_name,
      role || 'member',
      cooperative_id || null,
      phone || null
    ]);

    const newUser = await getOne('SELECT * FROM users WHERE user_id = ?', [userId]);
    const { password: _, ...userData } = newUser;

    const token = jwt.sign(
      { 
        userId: userData.user_id, 
        username: userData.username,
        role: userData.role,
        userType: 'user',
        isMember: false
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: userData,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ✅ GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const { userId, isMember, memberId } = req.user;

    if (isMember && memberId) {
      const member = await getOne('SELECT * FROM members WHERE member_id = ?', [memberId]);
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }
      
      // Try to get attendance count
      let totalAttendance = 0;
      try {
        const result = await getOne('SELECT COUNT(*) as total FROM attendance WHERE member_id = ?', [memberId]);
        totalAttendance = result?.total || 0;
      } catch (e) {
        // Attendance table might not have member_id column
        console.log('⚠️ Could not get attendance count:', e.message);
      }
      
      return res.json({
        success: true,
        data: { 
          ...member, 
          is_member: true, 
          role: 'member',
          total_attendance: totalAttendance
        }
      });
    } else {
      const user = await getOne(
        'SELECT user_id, username, full_name, role, cooperative_id, email, phone, status, created_at FROM users WHERE user_id = ?',
        [userId]
      );
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      return res.json({
        success: true,
        data: { ...user, is_member: false }
      });
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ✅ UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, email } = req.body;
    const { userId, isMember, memberId } = req.user;

    if (isMember && memberId) {
      await update(
        'UPDATE members SET full_name = ?, phone = ?, email = ? WHERE member_id = ?',
        [full_name, phone, email, memberId]
      );
      const updated = await getOne('SELECT * FROM members WHERE member_id = ?', [memberId]);
      return res.json({
        success: true,
        data: updated,
        message: 'Profile updated successfully'
      });
    } else {
      await update(
        'UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?',
        [full_name, phone, userId]
      );
      const updated = await getOne('SELECT * FROM users WHERE user_id = ?', [userId]);
      const { password, ...userData } = updated;
      return res.json({
        success: true,
        data: userData,
        message: 'Profile updated successfully'
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ✅ CHANGE USER PASSWORD
export const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await getOne('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await update('UPDATE users SET password = ? WHERE user_id = ?', [hashedNewPassword, userId]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ✅ CHANGE MEMBER PASSWORD
export const changeMemberPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { memberId } = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const member = await getOne('SELECT * FROM members WHERE member_id = ?', [memberId]);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const currentMemberPassword = member.password || 'TempIcspp@2026!';
    if (currentMemberPassword !== currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    await update('UPDATE members SET password = ? WHERE member_id = ?', [newPassword, memberId]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change member password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ✅ GET ALL USERS (Admin Only)
export const getUsers = async (req, res) => {
  try {
    const users = await query(
      'SELECT user_id, username, full_name, role, cooperative_id, email, phone, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ✅ GET ALL MEMBERS (Admin Only)
export const getMembersList = async (req, res) => {
  try {
    const members = await query(`
      SELECT m.member_id, m.full_name, m.phone, m.email, m.status, 
             c.cooperative_name, d.district_name,
             m.created_at
      FROM members m
      LEFT JOIN cooperatives c ON m.cooperative_id = c.cooperative_id
      LEFT JOIN districts d ON m.district_id = d.district_id
      ORDER BY m.created_at DESC
    `);
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Get members list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ✅ RESET MEMBER PASSWORD (Admin Only)
export const resetMemberPassword = async (req, res) => {
  try {
    const { memberId } = req.params;
    const defaultPassword = 'TempIcspp@2026!';

    const member = await getOne('SELECT * FROM members WHERE member_id = ?', [memberId]);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    await update('UPDATE members SET password = ? WHERE member_id = ?', [defaultPassword, memberId]);

    res.json({
      success: true,
      message: `Password reset to default: ${defaultPassword}`
    });
  } catch (error) {
    console.error('Reset member password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};