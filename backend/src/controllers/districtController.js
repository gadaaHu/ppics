 import { query, getOne, insert, update } from '../config/database.js';

// Get all districts
export const getDistricts = async (req, res) => {
  try {
    const { search } = req.query;
    
    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE district_name LIKE ? OR description LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }

    const sql = `
      SELECT * FROM districts 
      ${whereClause}
      ORDER BY district_name ASC
    `;

    const districts = await query(sql, params);

    res.json({
      success: true,
      data: districts,
      total: districts.length
    });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single district by ID
export const getDistrictById = async (req, res) => {
  try {
    const { id } = req.params;
    const district = await getOne('SELECT * FROM districts WHERE district_id = ?', [id]);

    if (!district) {
      return res.status(404).json({
        success: false,
        message: 'District not found'
      });
    }

    res.json({
      success: true,
      data: district
    });
  } catch (error) {
    console.error('Get district by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new district
export const createDistrict = async (req, res) => {
  try {
    const { district_name, description } = req.body;

    // Validation
    if (!district_name || district_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'District name is required'
      });
    }

    // Check if district already exists
    const existing = await getOne(
      'SELECT * FROM districts WHERE district_name = ?',
      [district_name]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'District already exists'
      });
    }

    const sql = `
      INSERT INTO districts (district_name, description, created_at) 
      VALUES (?, ?, NOW())
    `;

    const id = await insert(sql, [
      district_name,
      description || ''
    ]);

    const district = await getOne('SELECT * FROM districts WHERE district_id = ?', [id]);

    res.status(201).json({
      success: true,
      data: district,
      message: 'District created successfully'
    });
  } catch (error) {
    console.error('Create district error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update district
export const updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { district_name, description } = req.body;

    // Validation
    if (!district_name || district_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'District name is required'
      });
    }

    // Check if district exists
    const existing = await getOne('SELECT * FROM districts WHERE district_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'District not found'
      });
    }

    // Check if another district has the same name
    const duplicate = await getOne(
      'SELECT * FROM districts WHERE district_name = ? AND district_id != ?',
      [district_name, id]
    );

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'Another district with this name already exists'
      });
    }

    const sql = `
      UPDATE districts 
      SET district_name = ?, description = ?
      WHERE district_id = ?
    `;

    await update(sql, [district_name, description || '', id]);

    const district = await getOne('SELECT * FROM districts WHERE district_id = ?', [id]);

    res.json({
      success: true,
      data: district,
      message: 'District updated successfully'
    });
  } catch (error) {
    console.error('Update district error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete district
export const deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if district exists
    const district = await getOne('SELECT * FROM districts WHERE district_id = ?', [id]);
    if (!district) {
      return res.status(404).json({
        success: false,
        message: 'District not found'
      });
    }

    // Check if district has related records (cooperatives, members, etc.)
    const cooperatives = await query(
      'SELECT * FROM cooperatives WHERE district_id = ?',
      [id]
    );

    if (cooperatives.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete district. It has associated cooperatives. Please delete them first.'
      });
    }

    await update('DELETE FROM districts WHERE district_id = ?', [id]);

    res.json({
      success: true,
      message: 'District deleted successfully'
    });
  } catch (error) {
    console.error('Delete district error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get district statistics
export const getDistrictStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        d.district_id,
        d.district_name,
        COUNT(DISTINCT c.cooperative_id) as cooperative_count,
        COUNT(DISTINCT f.family_id) as family_count,
        COUNT(DISTINCT m.member_id) as member_count
      FROM districts d
      LEFT JOIN cooperatives c ON d.district_id = c.district_id
      LEFT JOIN families f ON c.cooperative_id = f.cooperative_id
      LEFT JOIN members m ON f.family_id = m.family_id
      GROUP BY d.district_id
      ORDER BY d.district_name
    `);

    const totalStats = await query(`
      SELECT 
        COUNT(DISTINCT district_id) as total_districts,
        COUNT(DISTINCT cooperative_id) as total_cooperatives,
        COUNT(DISTINCT family_id) as total_families,
        COUNT(DISTINCT member_id) as total_members
      FROM districts d
      LEFT JOIN cooperatives c ON d.district_id = c.district_id
      LEFT JOIN families f ON c.cooperative_id = f.cooperative_id
      LEFT JOIN members m ON f.family_id = m.family_id
    `);

    res.json({
      success: true,
      data: {
        districts: stats,
        totals: totalStats[0] || { total_districts: 0, total_cooperatives: 0, total_families: 0, total_members: 0 }
      }
    });
  } catch (error) {
    console.error('Get district stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
