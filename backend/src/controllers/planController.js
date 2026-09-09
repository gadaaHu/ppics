import { query, getOne, insert, update } from '../config/database.js';

// Get all plans with filters
export const getPlans = async (req, res) => {
  try {
    const { 
      district_id, 
      cooperative_id, 
      family_id, 
      filter, 
      document_type_id,
      search 
    } = req.query;

    console.log('📋 Fetching plans with filters:', { district_id, cooperative_id, family_id, filter, document_type_id, search });

    let whereClauses = [];
    let params = [];

    // Build WHERE clause
    if (district_id) {
      whereClauses.push('d.district_id = ?');
      params.push(district_id);
    }

    if (cooperative_id) {
      whereClauses.push('c.cooperative_id = ?');
      params.push(cooperative_id);
    }

    if (family_id) {
      whereClauses.push('p.family_id = ?');
      params.push(family_id);
    }

    if (filter === 'cooperative') {
      whereClauses.push('p.family_id IS NULL');
    }

    if (document_type_id) {
      whereClauses.push('p.document_type_id = ?');
      params.push(document_type_id);
    }

    if (search) {
      whereClauses.push('(p.title LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT p.*, 
             dt.name as document_type_name, 
             f.family_name, 
             c.cooperative_name, 
             d.district_name,
             CASE 
               WHEN p.family_id IS NOT NULL THEN 'Family'
               ELSE 'Cooperative'
             END as level_type
      FROM plans p
      LEFT JOIN document_type dt ON p.document_type_id = dt.id
      LEFT JOIN families f ON p.family_id = f.family_id
      LEFT JOIN cooperatives c ON f.cooperative_id = c.cooperative_id
      LEFT JOIN districts d ON c.district_id = d.district_id
      ${whereSql}
      ORDER BY p.created_at DESC
    `;

    console.log('📝 SQL:', sql);
    console.log('📝 Params:', params);

    const plans = await query(sql, params);

    // Add file info
    const plansWithFileInfo = plans.map(plan => ({
      ...plan,
      file_exists: plan.attachment ? true : false,
      file_extension: plan.attachment ? plan.attachment.split('.').pop().toLowerCase() : null
    }));

    res.json({
      success: true,
      data: plansWithFileInfo,
      filters: { district_id, cooperative_id, family_id, filter, document_type_id, search }
    });
  } catch (error) {
    console.error('❌ Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get plan by ID
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await getOne('SELECT * FROM plans WHERE id = ?', [id]);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Get plan by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create plan
export const createPlan = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      attachment, 
      document_type_id, 
      family_id,
      cooperative_id 
    } = req.body;

    if (!title || !date || !document_type_id) {
      return res.status(400).json({
        success: false,
        message: 'Title, date and document type are required'
      });
    }

    const sql = `
      INSERT INTO plans (
        title, description, date, attachment, 
        document_type_id, family_id, cooperative_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const id = await insert(sql, [
      title,
      description || '',
      date,
      attachment || null,
      document_type_id,
      family_id || null,
      cooperative_id || null
    ]);

    const plan = await getOne('SELECT * FROM plans WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      data: plan,
      message: 'Document added successfully'
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update plan
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, description, date, attachment, 
      document_type_id, family_id, cooperative_id 
    } = req.body;

    const existing = await getOne('SELECT * FROM plans WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    const finalAttachment = attachment !== undefined ? attachment : existing.attachment;

    const sql = `
      UPDATE plans 
      SET title = ?, description = ?, date = ?, attachment = ?,
          document_type_id = ?, family_id = ?, cooperative_id = ?
      WHERE id = ?
    `;

    await update(sql, [
      title || existing.title,
      description !== undefined ? description : existing.description,
      date || existing.date,
      finalAttachment,
      document_type_id || existing.document_type_id,
      family_id !== undefined ? family_id : existing.family_id,
      cooperative_id !== undefined ? cooperative_id : existing.cooperative_id,
      id
    ]);

    const plan = await getOne('SELECT * FROM plans WHERE id = ?', [id]);

    res.json({
      success: true,
      data: plan,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete plan
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await getOne('SELECT * FROM plans WHERE id = ?', [id]);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    await update('DELETE FROM plans WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Remove attachment only
export const removeAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await getOne('SELECT * FROM plans WHERE id = ?', [id]);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    await update('UPDATE plans SET attachment = NULL WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Attachment removed successfully'
    });
  } catch (error) {
    console.error('Remove attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get document types
export const getDocumentTypes = async (req, res) => {
  try {
    const types = await query('SELECT * FROM document_type ORDER BY name');
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Get document types error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get filter data (districts, cooperatives, families)
export const getFilterData = async (req, res) => {
  try {
    const [districts, cooperatives, families] = await Promise.all([
      query('SELECT * FROM districts ORDER BY district_name'),
      query('SELECT * FROM cooperatives ORDER BY cooperative_name'),
      query(`
        SELECT f.*, c.cooperative_name 
        FROM families f 
        INNER JOIN cooperatives c ON f.cooperative_id = c.cooperative_id 
        WHERE f.cooperative_id IS NOT NULL 
        ORDER BY c.cooperative_name, f.family_name
      `)
    ]);

    res.json({
      success: true,
      data: { districts, cooperatives, families }
    });
  } catch (error) {
    console.error('Get filter data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};