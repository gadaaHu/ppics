 import { query, getOne, insert, update } from '../config/database.js';

// Mark attendance
export const markAttendance = async (req, res) => {
  try {
    const { member_id, event_id } = req.body;

    if (!member_id || !event_id) {
      return res.status(400).json({
        success: false,
        message: 'Member ID and Event ID are required'
      });
    }

    // Check if member exists
    const member = await getOne('SELECT * FROM members WHERE member_id = ?', [member_id]);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if event exists
    const event = await getOne('SELECT * FROM events WHERE id = ?', [event_id]);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if already marked attendance
    const existing = await getOne(
      'SELECT * FROM attendance WHERE member_id = ? AND event_id = ?',
      [member_id, event_id]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this member'
      });
    }

    // Mark attendance
    const sql = `
      INSERT INTO attendance (member_id, event_id, scan_time, created_at) 
      VALUES (?, ?, NOW(), NOW())
    `;

    const id = await insert(sql, [member_id, event_id]);

    const attendance = await getOne('SELECT * FROM attendance WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      data: {
        ...attendance,
        member: member,
        event: event
      },
      message: `Attendance marked for ${member.full_name}`
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get attendance by event
export const getAttendanceByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const attendance = await query(`
      SELECT a.*, 
             m.full_name, 
             m.phone, 
             m.email,
             m.member_no
      FROM attendance a
      JOIN members m ON a.member_id = m.member_id
      WHERE a.event_id = ?
      ORDER BY a.scan_time DESC
    `, [eventId]);

    // Get total registered members for this event (optional)
    const totalMembers = await query(
      'SELECT COUNT(*) as total FROM members WHERE cooperative_id IN (SELECT cooperative_id FROM events WHERE id = ?)',
      [eventId]
    );

    res.json({
      success: true,
      data: {
        attendance,
        total: attendance.length,
        event_id: eventId
      }
    });
  } catch (error) {
    console.error('Get attendance by event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get attendance by member
export const getAttendanceByMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const attendance = await query(`
      SELECT a.*, 
             e.title as event_title,
             e.date as event_date,
             e.location as event_location
      FROM attendance a
      JOIN events e ON a.event_id = e.id
      WHERE a.member_id = ?
      ORDER BY a.scan_time DESC
    `, [memberId]);

    res.json({
      success: true,
      data: attendance,
      total: attendance.length
    });
  } catch (error) {
    console.error('Get attendance by member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get attendance statistics
export const getAttendanceStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        e.id as event_id,
        e.title as event_title,
        e.date as event_date,
        COUNT(a.id) as total_attendance
      FROM events e
      LEFT JOIN attendance a ON e.id = a.event_id
      GROUP BY e.id
      ORDER BY e.date DESC
    `);

    const totalStats = await query(`
      SELECT 
        COUNT(DISTINCT event_id) as total_events_with_attendance,
        COUNT(*) as total_attendance_records
      FROM attendance
    `);

    res.json({
      success: true,
      data: {
        events: stats,
        totals: totalStats[0] || { total_events_with_attendance: 0, total_attendance_records: 0 }
      }
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Scan barcode (member_id)
export const scanBarcode = async (req, res) => {
  try {
    const { barcode, event_id } = req.body;

    if (!barcode || !event_id) {
      return res.status(400).json({
        success: false,
        message: 'Barcode and Event ID are required'
      });
    }

    // Try to find member by barcode (member_id or member_no)
    const member = await getOne(
      'SELECT * FROM members WHERE member_id = ? OR member_no = ?',
      [barcode, barcode]
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if event exists
    const event = await getOne('SELECT * FROM events WHERE id = ?', [event_id]);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if already marked attendance
    const existing = await getOne(
      'SELECT * FROM attendance WHERE member_id = ? AND event_id = ?',
      [member.member_id, event_id]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked'
      });
    }

    // Mark attendance
    const sql = `
      INSERT INTO attendance (member_id, event_id, scan_time, created_at) 
      VALUES (?, ?, NOW(), NOW())
    `;

    await insert(sql, [member.member_id, event_id]);

    res.json({
      success: true,
      message: `✅ Attendance marked for ${member.full_name}`,
      data: {
        member: member,
        event: event
      }
    });
  } catch (error) {
    console.error('Scan barcode error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
