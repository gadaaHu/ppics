 import { query, getOne, insert, update } from '../config/database.js';

// Get all cooperatives with district info
export const getCooperatives = async (req, res) => {
  try {
    const { search, district_id } = req.query;
    
    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE c.cooperative_name LIKE ? OR c.description LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }

    if (district_id) {
      whereClause = whereClause ? `${whereClause} AND c.district_id = ?` : 'WHERE c.district_id = ?';
      params.push(district_id);
    }

    const sql = `
      SELECT c.*, d.district_name 
      FROM cooperatives c 
      JOIN districts d ON c.district_id = d.district_id
      ${whereClause}
      ORDER BY d.district_name, c.cooperative_name
    `;

    const cooperatives = await query(sql, params);

    res.json({
      success: true,
      data: cooperatives,
      total: cooperatives.length
    });
  } catch (error) {
    console.error('Get cooperatives error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single cooperative by ID
export const getCooperativeById = async (req, res) => {
  try {
    const { id } = req.params;
    const cooperative = await getOne(`
      SELECT c.*, d.district_name 
      FROM cooperatives c 
      JOIN districts d ON c.district_id = d.district_id 
      WHERE c.cooperative_id = ?
    `, [id]);

    if (!cooperative) {
      return res.status(404).json({
        success: false,
        message: 'Cooperative not found'
      });
    }

    res.json({
      success: true,
      data: cooperative
    });
  } catch (error) {
    console.error('Get cooperative by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new cooperative
export const createCooperative = async (req, res) => {
  try {
    const { cooperative_name, district_id, description } = req.body;

    // Validation
    if (!cooperative_name || cooperative_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Cooperative name is required'
      });
    }

    if (!district_id) {
      return res.status(400).json({
        success: false,
        message: 'District is required'
      });
    }

    // Check if district exists
    const district = await getOne('SELECT * FROM districts WHERE district_id = ?', [district_id]);
    if (!district) {
      return res.status(400).json({
        success: false,
        message: 'Selected district does not exist'
      });
    }

    // Check if cooperative already exists in the same district
    const existing = await getOne(
      'SELECT * FROM cooperatives WHERE cooperative_name = ? AND district_id = ?',
      [cooperative_name, district_id]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A cooperative with this name already exists in this district'
      });
    }

    const sql = `
      INSERT INTO cooperatives (cooperative_name, district_id, description, created_at) 
      VALUES (?, ?, ?, NOW())
    `;

    const id = await insert(sql, [
      cooperative_name,
      district_id,
      description || ''
    ]);

    const cooperative = await getOne(`
      SELECT c.*, d.district_name 
      FROM cooperatives c 
      JOIN districts d ON c.district_id = d.district_id 
      WHERE c.cooperative_id = ?
    `, [id]);

    res.status(201).json({
      success: true,
      data: cooperative,
      message: 'Cooperative created successfully'
    });
  } catch (error) {
    console.error('Create cooperative error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update cooperative
export const updateCooperative = async (req, res) => {
  try {
    const { id } = req.params;
    const { cooperative_name, district_id, description } = req.body;

    // Validation
    if (!cooperative_name || cooperative_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Cooperative name is required'
      });
    }

    if (!district_id) {
      return res.status(400).json({
        success: false,
        message: 'District is required'
      });
    }

    // Check if cooperative exists
    const existing = await getOne('SELECT * FROM cooperatives WHERE cooperative_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Cooperative not found'
      });
    }

    // Check if district exists
    const district = await getOne('SELECT * FROM districts WHERE district_id = ?', [district_id]);
    if (!district) {
      return res.status(400).json({
        success: false,
        message: 'Selected district does not exist'
      });
    }

    // Check if another cooperative has the same name in this district
    const duplicate = await getOne(
      'SELECT * FROM cooperatives WHERE cooperative_name = ? AND district_id = ? AND cooperative_id != ?',
      [cooperative_name, district_id, id]
    );

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'Another cooperative with this name already exists in this district'
      });
    }

    const sql = `
      UPDATE cooperatives 
      SET cooperative_name = ?, district_id = ?, description = ?
      WHERE cooperative_id = ?
    `;

    await update(sql, [cooperative_name, district_id, description || '', id]);

    const cooperative = await getOne(`
      SELECT c.*, d.district_name 
      FROM cooperatives c 
      JOIN districts d ON c.district_id = d.district_id 
      WHERE c.cooperative_id = ?
    `, [id]);

    res.json({
      success: true,
      data: cooperative,
      message: 'Cooperative updated successfully'
    });
  } catch (error) {
    console.error('Update cooperative error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete cooperative
export const deleteCooperative = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if cooperative exists
    const cooperative = await getOne('SELECT * FROM cooperatives WHERE cooperative_id = ?', [id]);
    if (!cooperative) {
      return res.status(404).json({
        success: false,
        message: 'Cooperative not found'
      });
    }

    // Check if cooperative has related records (families, members, etc.)
    const families = await query(
      'SELECT * FROM families WHERE cooperative_id = ?',
      [id]
    );

    if (families.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete cooperative. It has associated families. Please delete them first.'
      });
    }

    await update('DELETE FROM cooperatives WHERE cooperative_id = ?', [id]);

    res.json({
      success: true,
      message: 'Cooperative deleted successfully'
    });
  } catch (error) {
    console.error('Delete cooperative error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get cooperative statistics
export const getCooperativeStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        c.cooperative_id,
        c.cooperative_name,
        d.district_name,
        COUNT(DISTINCT f.family_id) as family_count,
        COUNT(DISTINCT m.member_id) as member_count
      FROM cooperatives c
      JOIN districts d ON c.district_id = d.district_id
      LEFT JOIN families f ON c.cooperative_id = f.cooperative_id
      LEFT JOIN members m ON f.family_id = m.family_id
      GROUP BY c.cooperative_id
      ORDER BY c.cooperative_name
    `);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get cooperative stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
