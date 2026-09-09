import { query, getOne, insert, update } from '../config/database.js';

// Get all families with cooperative and district info
export const getFamilies = async (req, res) => {
  try {
    const { search, cooperative_id, district_id } = req.query;
    
    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE f.family_name LIKE ? OR f.description LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }

    if (cooperative_id) {
      whereClause = whereClause ? `${whereClause} AND f.cooperative_id = ?` : 'WHERE f.cooperative_id = ?';
      params.push(cooperative_id);
    }

    if (district_id) {
      whereClause = whereClause ? `${whereClause} AND d.district_id = ?` : 'WHERE d.district_id = ?';
      params.push(district_id);
    }

    const sql = `
      SELECT f.*, 
             c.cooperative_name, 
             d.district_name,
             d.district_id
      FROM families f
      JOIN cooperatives c ON f.cooperative_id = c.cooperative_id
      JOIN districts d ON c.district_id = d.district_id
      ${whereClause}
      ORDER BY d.district_name, c.cooperative_name, f.family_name
    `;

    const families = await query(sql, params);

    res.json({
      success: true,
      data: families,
      total: families.length
    });
  } catch (error) {
    console.error('Get families error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single family by ID
export const getFamilyById = async (req, res) => {
  try {
    const { id } = req.params;
    const family = await getOne(`
      SELECT f.*, 
             c.cooperative_name, 
             d.district_name 
      FROM families f
      JOIN cooperatives c ON f.cooperative_id = c.cooperative_id
      JOIN districts d ON c.district_id = d.district_id
      WHERE f.family_id = ?
    `, [id]);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    res.json({
      success: true,
      data: family
    });
  } catch (error) {
    console.error('Get family by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new family
export const createFamily = async (req, res) => {
  try {
    const { family_name, cooperative_id, description } = req.body;

    // Validation
    if (!family_name || family_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Family name is required'
      });
    }

    if (!cooperative_id) {
      return res.status(400).json({
        success: false,
        message: 'Cooperative is required'
      });
    }

    // Check if cooperative exists
    const cooperative = await getOne('SELECT * FROM cooperatives WHERE cooperative_id = ?', [cooperative_id]);
    if (!cooperative) {
      return res.status(400).json({
        success: false,
        message: 'Selected cooperative does not exist'
      });
    }

    // Check if family already exists in this cooperative
    const existing = await getOne(
      'SELECT * FROM families WHERE family_name = ? AND cooperative_id = ?',
      [family_name, cooperative_id]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A family with this name already exists in this cooperative'
      });
    }

    const sql = `
      INSERT INTO families (family_name, cooperative_id, description, created_at) 
      VALUES (?, ?, ?, NOW())
    `;

    const id = await insert(sql, [
      family_name,
      cooperative_id,
      description || ''
    ]);

    const family = await getOne(`
      SELECT f.*, 
             c.cooperative_name, 
             d.district_name 
      FROM families f
      JOIN cooperatives c ON f.cooperative_id = c.cooperative_id
      JOIN districts d ON c.district_id = d.district_id
      WHERE f.family_id = ?
    `, [id]);

    res.status(201).json({
      success: true,
      data: family,
      message: 'Family created successfully'
    });
  } catch (error) {
    console.error('Create family error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update family
export const updateFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const { family_name, cooperative_id, description } = req.body;

    // Validation
    if (!family_name || family_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Family name is required'
      });
    }

    if (!cooperative_id) {
      return res.status(400).json({
        success: false,
        message: 'Cooperative is required'
      });
    }

    // Check if family exists
    const existing = await getOne('SELECT * FROM families WHERE family_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    // Check if cooperative exists
    const cooperative = await getOne('SELECT * FROM cooperatives WHERE cooperative_id = ?', [cooperative_id]);
    if (!cooperative) {
      return res.status(400).json({
        success: false,
        message: 'Selected cooperative does not exist'
      });
    }

    // Check if another family has the same name in this cooperative
    const duplicate = await getOne(
      'SELECT * FROM families WHERE family_name = ? AND cooperative_id = ? AND family_id != ?',
      [family_name, cooperative_id, id]
    );

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'Another family with this name already exists in this cooperative'
      });
    }

    const sql = `
      UPDATE families 
      SET family_name = ?, cooperative_id = ?, description = ?
      WHERE family_id = ?
    `;

    await update(sql, [family_name, cooperative_id, description || '', id]);

    const family = await getOne(`
      SELECT f.*, 
             c.cooperative_name, 
             d.district_name 
      FROM families f
      JOIN cooperatives c ON f.cooperative_id = c.cooperative_id
      JOIN districts d ON c.district_id = d.district_id
      WHERE f.family_id = ?
    `, [id]);

    res.json({
      success: true,
      data: family,
      message: 'Family updated successfully'
    });
  } catch (error) {
    console.error('Update family error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete family
export const deleteFamily = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if family exists
    const family = await getOne('SELECT * FROM families WHERE family_id = ?', [id]);
    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    // Check if family has related records (members, etc.)
    const members = await query(
      'SELECT * FROM members WHERE family_id = ?',
      [id]
    );

    if (members.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete family. It has associated members. Please remove them first.'
      });
    }

    await update('DELETE FROM families WHERE family_id = ?', [id]);

    res.json({
      success: true,
      message: 'Family deleted successfully'
    });
  } catch (error) {
    console.error('Delete family error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get family statistics
export const getFamilyStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        f.family_id,
        f.family_name,
        c.cooperative_name,
        d.district_name,
        COUNT(DISTINCT m.member_id) as member_count
      FROM families f
      JOIN cooperatives c ON f.cooperative_id = c.cooperative_id
      JOIN districts d ON c.district_id = d.district_id
      LEFT JOIN members m ON f.family_id = m.family_id
      GROUP BY f.family_id
      ORDER BY f.family_name
    `);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get family stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};