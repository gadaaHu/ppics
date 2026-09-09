import { query, getOne, insert, update } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all events
export const getEvents = async (req, res) => {
  try {
    const { search, upcoming } = req.query;
    
    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE title LIKE ? OR description LIKE ? OR location LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    if (upcoming === 'true') {
      whereClause = whereClause ? `${whereClause} AND date >= CURDATE()` : 'WHERE date >= CURDATE()';
    }

    const sql = `
      SELECT * FROM events 
      ${whereClause}
      ORDER BY date DESC, id DESC
    `;

    const events = await query(sql, params);

    res.json({
      success: true,
      data: events,
      total: events.length
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await getOne('SELECT * FROM events WHERE id = ?', [id]);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get attendance count
    const attendanceCount = await query(
      'SELECT COUNT(*) as total FROM attendance WHERE event_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...event,
        attendance_count: attendanceCount[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get event by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new event
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, photo } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: 'Title and date are required'
      });
    }

    // Handle photo (base64 or file path)
    let photoPath = null;
    if (photo) {
      photoPath = photo;
    }

    const sql = `
      INSERT INTO events (title, description, date, location, photo, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    const id = await insert(sql, [
      title,
      description || '',
      date,
      location || '',
      photoPath
    ]);

    const event = await getOne('SELECT * FROM events WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, photo } = req.body;

    const existing = await getOne('SELECT * FROM events WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const finalPhoto = photo !== undefined ? photo : existing.photo;

    const sql = `
      UPDATE events 
      SET title = ?, description = ?, date = ?, location = ?, photo = ?
      WHERE id = ?
    `;

    await update(sql, [
      title || existing.title,
      description !== undefined ? description : existing.description,
      date || existing.date,
      location !== undefined ? location : existing.location,
      finalPhoto,
      id
    ]);

    const event = await getOne('SELECT * FROM events WHERE id = ?', [id]);

    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await getOne('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Delete attendance records first
    await update('DELETE FROM attendance WHERE event_id = ?', [id]);

    // Delete event
    await update('DELETE FROM events WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};