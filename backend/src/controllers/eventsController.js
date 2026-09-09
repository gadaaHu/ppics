import { query, getOne, insert, update } from '../config/database.js';

// Get all events with pagination
export const getEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    console.log('📅 Fetching events, limit:', limit, 'page:', page);

    const sql = `
      SELECT * FROM events 
      ORDER BY date DESC, id DESC 
      LIMIT ? OFFSET ?
    `;
    
    const countSql = 'SELECT COUNT(*) as total FROM events';
    
    const [events, countResult] = await Promise.all([
      query(sql, [limit, offset]),
      query(countSql)
    ]);

    const total = countResult[0].total;

    const formattedEvents = events.map(item => ({
      ...item,
      formatted_date: item.date ? new Date(item.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) : null
    }));

    res.json({
      success: true,
      data: formattedEvents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;

    console.log('📅 Fetching upcoming events, limit:', limit);

    const sql = `
      SELECT * FROM events 
      WHERE date >= CURDATE() OR date IS NULL
      ORDER BY date ASC 
      LIMIT ?
    `;
    
    const events = await query(sql, [limit]);

    const formattedEvents = events.map(item => ({
      ...item,
      formatted_date: item.date ? new Date(item.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) : null
    }));

    res.json({
      success: true,
      data: formattedEvents
    });
  } catch (error) {
    console.error('❌ Get upcoming events error:', error);
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

    event.formatted_date = event.date ? new Date(event.date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) : null;

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('❌ Get event by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create event
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, photo, venue, event_type } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const sql = `
      INSERT INTO events (title, description, date, photo, venue, event_type, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const id = await insert(sql, [
      title,
      description || '',
      date || null,
      photo || null,
      venue || '',
      event_type || 'general'
    ]);

    const event = await getOne('SELECT * FROM events WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('❌ Create event error:', error);
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
    const { title, description, date, photo, venue, event_type, status } = req.body;

    const existing = await getOne('SELECT * FROM events WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const sql = `
      UPDATE events 
      SET title = ?, description = ?, date = ?, photo = ?, venue = ?, event_type = ?, status = ?
      WHERE id = ?
    `;

    await update(sql, [
      title || existing.title,
      description || existing.description,
      date || existing.date,
      photo || existing.photo,
      venue || existing.venue,
      event_type || existing.event_type,
      status || existing.status || 'upcoming',
      id
    ]);

    const event = await getOne('SELECT * FROM events WHERE id = ?', [id]);

    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('❌ Update event error:', error);
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

    const existing = await getOne('SELECT * FROM events WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await update('DELETE FROM events WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};