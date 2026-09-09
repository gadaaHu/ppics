import { query, getOne, insert, update } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'e-learning');

// ✅ Use the BASE_URL from environment
const BASE_URL = process.env.BASE_URL || `http://ppics.mecrvs.gov.et:${process.env.PORT || 5001}`;

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// =============================================
// GET ALL E-LEARNING MATERIALS
// =============================================
export const getELearningMaterials = async (req, res) => {
    try {
        const { category, language, type, level, search, limit = 20, page = 1 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { userRole } = req.user || {};

        console.log('📋 Fetching e-learning materials...');
        console.log('📋 User role:', userRole);

        let whereClauses = [];
        let params = [];

        if (category) {
            whereClauses.push('e.category = ?');
            params.push(category);
        }

        if (language) {
            whereClauses.push('e.language = ?');
            params.push(language);
        }

        if (type) {
            whereClauses.push('e.material_type = ?');
            params.push(type);
        }

        if (level) {
            whereClauses.push('e.level = ?');
            params.push(level);
        }

        if (search) {
            whereClauses.push('(e.title LIKE ? OR e.description LIKE ? OR e.author LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const isAdmin = userRole === 'admin';
        
        if (!isAdmin) {
            whereClauses.push('e.status = ?');
            params.push('published');
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const sql = `
            SELECT e.*, 
                   u.full_name as uploaded_by_name,
                   DATE_FORMAT(e.created_at, '%Y-%m-%d') as formatted_date,
                   DATE_FORMAT(e.updated_at, '%Y-%m-%d') as updated_date
            FROM e_learning e
            LEFT JOIN users u ON e.uploaded_by = u.user_id
            ${whereSql}
            ORDER BY e.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const countSql = `SELECT COUNT(*) as total FROM e_learning e ${whereSql}`;

        const [materials, countResult] = await Promise.all([
            query(sql, [...params, parseInt(limit), offset]),
            query(countSql, params)
        ]);

        console.log(`✅ Found ${materials.length} materials`);

        // ✅ Use BASE_URL from environment
        const materialsWithUrl = materials.map(material => ({
            ...material,
            file_url: material.file_path ? `${BASE_URL}/uploads/e-learning/${material.file_path}` : null,
            thumbnail_url: material.thumbnail ? `${BASE_URL}/uploads/e-learning/${material.thumbnail}` : null
        }));

        res.json({
            success: true,
            data: materialsWithUrl,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0]?.total || 0,
                pages: Math.ceil((countResult[0]?.total || 0) / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('❌ Get e-learning materials error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================================
// GET SINGLE E-LEARNING MATERIAL
// =============================================
export const getELearningMaterialById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userRole } = req.user || {};

        const material = await getOne(`
            SELECT e.*, 
                   u.full_name as uploaded_by_name
            FROM e_learning e
            LEFT JOIN users u ON e.uploaded_by = u.user_id
            WHERE e.id = ?
        `, [id]);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Learning material not found'
            });
        }

        if (userRole !== 'admin' && material.status !== 'published') {
            return res.status(403).json({
                success: false,
                message: 'This material is not available'
            });
        }

        await update('UPDATE e_learning SET views = COALESCE(views, 0) + 1 WHERE id = ?', [id]);

        // ✅ Use BASE_URL from environment
        material.file_url = material.file_path 
            ? `${BASE_URL}/uploads/e-learning/${material.file_path}` 
            : null;
        material.thumbnail_url = material.thumbnail 
            ? `${BASE_URL}/uploads/e-learning/${material.thumbnail}` 
            : null;

        res.json({
            success: true,
            data: material
        });
    } catch (error) {
        console.error('Get e-learning material error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


// =============================================
// CREATE E-LEARNING MATERIAL (Admin only)
// =============================================
export const createELearningMaterial = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            category, 
            language, 
            material_type, 
            status = 'draft',
            duration,
            level,
            author,
            tags,
            video_url
        } = req.body;
        const { userId } = req.user;

        console.log('📋 Creating e-learning material:');
        console.log('📋 Title:', title);
        console.log('📋 Category:', category);
        console.log('📋 Status:', status);

        // Validate required fields
        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        // Check if file was uploaded
        if (!req.files || !req.files.file || req.files.file.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'File is required'
            });
        }

        const filePath = req.files.file[0].filename;
        let thumbnail = null;
        
        if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
            thumbnail = req.files.thumbnail[0].filename;
        }

        console.log('📁 File uploaded:', filePath);
        console.log('🖼️ Thumbnail:', thumbnail);

        const sql = `
            INSERT INTO e_learning (
                title, description, category, language, material_type,
                file_path, thumbnail, duration, level, author,
                tags, video_url, status, uploaded_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            title.trim(), 
            description ? description.trim() : null, 
            category || 'general', 
            language || 'am',
            material_type || 'document',
            filePath,
            thumbnail,
            duration || null,
            level || 'beginner',
            author || null,
            tags || null,
            video_url || null,
            status || 'draft',
            userId || null
        ];

        const id = await insert(sql, values);

        const newMaterial = await getOne('SELECT * FROM e_learning WHERE id = ?', [id]);

        console.log('✅ E-learning material created with ID:', id);

        res.status(201).json({
            success: true,
            data: newMaterial,
            message: 'Learning material created successfully'
        });
    } catch (error) {
        console.error('❌ Create e-learning material error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================================
// UPDATE E-LEARNING MATERIAL (Admin only)
// =============================================
export const updateELearningMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            description, 
            category, 
            language, 
            material_type,
            status,
            duration,
            level,
            author,
            tags,
            video_url
        } = req.body;

        console.log('📋 Updating e-learning material:', { id, title, status });

        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const existing = await getOne('SELECT * FROM e_learning WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Learning material not found'
            });
        }

        let filePath = existing.file_path;
        if (req.files && req.files.file && req.files.file.length > 0) {
            if (existing.file_path && fs.existsSync(path.join(UPLOAD_DIR, existing.file_path))) {
                fs.unlinkSync(path.join(UPLOAD_DIR, existing.file_path));
            }
            filePath = req.files.file[0].filename;
        }

        let thumbnail = existing.thumbnail;
        if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
            if (existing.thumbnail && fs.existsSync(path.join(UPLOAD_DIR, existing.thumbnail))) {
                fs.unlinkSync(path.join(UPLOAD_DIR, existing.thumbnail));
            }
            thumbnail = req.files.thumbnail[0].filename;
        }

        const sql = `
            UPDATE e_learning SET
                title = ?,
                description = ?,
                category = ?,
                language = ?,
                material_type = ?,
                file_path = ?,
                thumbnail = ?,
                duration = ?,
                level = ?,
                author = ?,
                tags = ?,
                video_url = ?,
                status = ?
            WHERE id = ?
        `;

        await update(sql, [
            title.trim(), 
            description ? description.trim() : null, 
            category || 'general', 
            language || 'am',
            material_type || 'document',
            filePath,
            thumbnail,
            duration || null,
            level || 'beginner',
            author || null,
            tags || null,
            video_url || null,
            status || 'draft',
            id
        ]);

        const updated = await getOne('SELECT * FROM e_learning WHERE id = ?', [id]);

        console.log('✅ E-learning material updated:', id);

        res.json({
            success: true,
            data: updated,
            message: 'Learning material updated successfully'
        });
    } catch (error) {
        console.error('❌ Update e-learning material error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================================
// DELETE E-LEARNING MATERIAL (Admin only)
// =============================================
export const deleteELearningMaterial = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await getOne('SELECT * FROM e_learning WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Learning material not found'
            });
        }

        if (existing.file_path && fs.existsSync(path.join(UPLOAD_DIR, existing.file_path))) {
            fs.unlinkSync(path.join(UPLOAD_DIR, existing.file_path));
        }
        if (existing.thumbnail && fs.existsSync(path.join(UPLOAD_DIR, existing.thumbnail))) {
            fs.unlinkSync(path.join(UPLOAD_DIR, existing.thumbnail));
        }

        await update('DELETE FROM e_learning WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Learning material deleted successfully'
        });
    } catch (error) {
        console.error('Delete e-learning material error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// GET E-LEARNING CATEGORIES
// =============================================
export const getELearningCategories = async (req, res) => {
    try {
        const categories = await query(`
            SELECT DISTINCT e.category, COUNT(*) as count 
            FROM e_learning e
            GROUP BY e.category 
            ORDER BY e.category
        `);

        const languages = await query(`
            SELECT DISTINCT e.language, COUNT(*) as count 
            FROM e_learning e
            GROUP BY e.language 
            ORDER BY e.language
        `);

        const types = await query(`
            SELECT DISTINCT e.material_type, COUNT(*) as count 
            FROM e_learning e
            GROUP BY e.material_type 
            ORDER BY e.material_type
        `);

        const levels = await query(`
            SELECT DISTINCT e.level, COUNT(*) as count 
            FROM e_learning e
            GROUP BY e.level 
            ORDER BY 
                CASE e.level 
                    WHEN 'beginner' THEN 1 
                    WHEN 'intermediate' THEN 2 
                    WHEN 'advanced' THEN 3 
                    WHEN 'expert' THEN 4 
                END
        `);

        res.json({
            success: true,
            data: {
                categories,
                languages,
                types,
                levels
            }
        });
    } catch (error) {
        console.error('Get e-learning categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};