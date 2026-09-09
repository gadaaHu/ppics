 import { query, getOne, insert, update } from '../config/database.js';

// Get all positions
export const getPositions = async (req, res) => {
  try {
    const { search, level, sector } = req.query;
    
    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE position_name LIKE ? OR sector LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }

    if (level) {
      whereClause = whereClause ? `${whereClause} AND level = ?` : 'WHERE level = ?';
      params.push(level);
    }

    if (sector) {
      whereClause = whereClause ? `${whereClause} AND sector = ?` : 'WHERE sector = ?';
      params.push(sector);
    }

    const sql = `
      SELECT * FROM positions 
      ${whereClause}
      ORDER BY level, sector, position_name
    `;

    const positions = await query(sql, params);

    res.json({
      success: true,
      data: positions,
      total: positions.length
    });
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single position by ID
export const getPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const position = await getOne('SELECT * FROM positions WHERE position_id = ?', [id]);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }

    res.json({
      success: true,
      data: position
    });
  } catch (error) {
    console.error('Get position by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new position
export const createPosition = async (req, res) => {
  try {
    const { position_name, level, sector } = req.body;

    // Validation
    if (!position_name || position_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Position name is required'
      });
    }

    if (!level) {
      return res.status(400).json({
        success: false,
        message: 'Level is required'
      });
    }

    // Check if position already exists
    const existing = await getOne(
      'SELECT * FROM positions WHERE position_name = ? AND level = ? AND sector = ?',
      [position_name, level, sector || '']
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This position already exists'
      });
    }

    const sql = `
      INSERT INTO positions (position_name, level, sector, created_at) 
      VALUES (?, ?, ?, NOW())
    `;

    const id = await insert(sql, [
      position_name,
      level,
      sector || ''
    ]);

    const position = await getOne('SELECT * FROM positions WHERE position_id = ?', [id]);

    res.status(201).json({
      success: true,
      data: position,
      message: 'Position created successfully'
    });
  } catch (error) {
    console.error('Create position error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update position
export const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { position_name, level, sector } = req.body;

    // Validation
    if (!position_name || position_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Position name is required'
      });
    }

    if (!level) {
      return res.status(400).json({
        success: false,
        message: 'Level is required'
      });
    }

    // Check if position exists
    const existing = await getOne('SELECT * FROM positions WHERE position_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }

    // Check if another position has the same name
    const duplicate = await getOne(
      'SELECT * FROM positions WHERE position_name = ? AND level = ? AND sector = ? AND position_id != ?',
      [position_name, level, sector || '', id]
    );

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'Another position with this name already exists'
      });
    }

    const sql = `
      UPDATE positions 
      SET position_name = ?, level = ?, sector = ?
      WHERE position_id = ?
    `;

    await update(sql, [position_name, level, sector || '', id]);

    const position = await getOne('SELECT * FROM positions WHERE position_id = ?', [id]);

    res.json({
      success: true,
      data: position,
      message: 'Position updated successfully'
    });
  } catch (error) {
    console.error('Update position error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete position
export const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if position exists
    const position = await getOne('SELECT * FROM positions WHERE position_id = ?', [id]);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }

    // Check if position is assigned to any member
    const assigned = await query(
      'SELECT * FROM member_positions WHERE position_id = ?',
      [id]
    );

    if (assigned.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete position. It is assigned to members. Please remove the assignments first.'
      });
    }

    await update('DELETE FROM positions WHERE position_id = ?', [id]);

    res.json({
      success: true,
      message: 'Position deleted successfully'
    });
  } catch (error) {
    console.error('Delete position error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get position statistics
export const getPositionStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        level,
        COUNT(*) as total_positions,
        COUNT(DISTINCT sector) as total_sectors
      FROM positions
      GROUP BY level
      ORDER BY level
    `);

    const sectorStats = await query(`
      SELECT 
        sector,
        COUNT(*) as total
      FROM positions
      GROUP BY sector
      ORDER BY total DESC
    `);

    res.json({
      success: true,
      data: {
        by_level: stats,
        by_sector: sectorStats
      }
    });
  } catch (error) {
    console.error('Get position stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
