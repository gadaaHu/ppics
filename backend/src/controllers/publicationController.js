import { query, getOne, insert, update } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'publications');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// =============================================
// GET ALL PUBLICATIONS
// =============================================
export const getPublications = async (req, res) => {
    try {
        const { category, language, search, limit = 20, page = 1 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClauses = [];
        let params = [];

        if (category) {
            whereClauses.push('category = ?');
            params.push(category);
        }

        if (language) {
            whereClauses.push('language = ?');
            params.push(language);
        }

        if (search) {
            whereClauses.push('(title LIKE ? OR description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        // Only show published publications
        whereClauses.push('status = ?');
        params.push('published');

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const sql = `
            SELECT p.*, 
                   u.full_name as uploaded_by_name,
                   DATE_FORMAT(p.created_at, '%Y-%m-%d') as formatted_date
            FROM publications p
            LEFT JOIN users u ON p.uploaded_by = u.user_id
            ${whereSql}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const countSql = `SELECT COUNT(*) as total FROM publications ${whereSql}`;

        const [publications, countResult] = await Promise.all([
            query(sql, [...params, parseInt(limit), offset]),
            query(countSql, params)
        ]);

        // Add file URLs
        const publicationsWithUrl = publications.map(pub => ({
            ...pub,
            file_url: pub.file_path ? `http://localhost:5000/uploads/publications/${pub.file_path}` : null,
            preview_url: pub.file_path && pub.file_path.endsWith('.pdf') 
                ? `http://localhost:5000/uploads/publications/${pub.file_path}#toolbar=0` 
                : null
        }));

        res.json({
            success: true,
            data: publicationsWithUrl,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0]?.total || 0,
                pages: Math.ceil((countResult[0]?.total || 0) / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get publications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// GET SINGLE PUBLICATION BY ID
// =============================================
export const getPublicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const publication = await getOne(`
            SELECT p.*, 
                   u.full_name as uploaded_by_name,
                   DATE_FORMAT(p.created_at, '%Y-%m-%d') as formatted_date
            FROM publications p
            LEFT JOIN users u ON p.uploaded_by = u.user_id
            WHERE p.id = ? AND p.status = 'published'
        `, [id]);

        if (!publication) {
            return res.status(404).json({
                success: false,
                message: 'Publication not found'
            });
        }

        publication.file_url = publication.file_path 
            ? `http://localhost:5000/uploads/publications/${publication.file_path}` 
            : null;

        res.json({
            success: true,
            data: publication
        });
    } catch (error) {
        console.error('Get publication error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// CREATE PUBLICATION (Admin only)
// =============================================
export const createPublication = async (req, res) => {
    try {
        const { title, description, category, language, status = 'draft' } = req.body;
        const { userId } = req.user;

        if (!title || !req.file) {
            return res.status(400).json({
                success: false,
                message: 'Title and file are required'
            });
        }

        const filePath = req.file.filename;

        const id = await insert(`
            INSERT INTO publications (
                title, description, category, language, 
                file_path, status, uploaded_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [title, description || null, category || 'general', language || 'am', filePath, status, userId]);

        const newPublication = await getOne('SELECT * FROM publications WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            data: newPublication,
            message: 'Publication created successfully'
        });
    } catch (error) {
        console.error('Create publication error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// UPDATE PUBLICATION (Admin only)
// =============================================
export const updatePublication = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, language, status } = req.body;

        const existing = await getOne('SELECT * FROM publications WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Publication not found'
            });
        }

        let filePath = existing.file_path;
        if (req.file) {
            // Delete old file
            if (existing.file_path && fs.existsSync(path.join(UPLOAD_DIR, existing.file_path))) {
                fs.unlinkSync(path.join(UPLOAD_DIR, existing.file_path));
            }
            filePath = req.file.filename;
        }

        await update(`
            UPDATE publications SET
                title = ?,
                description = ?,
                category = ?,
                language = ?,
                file_path = ?,
                status = ?
            WHERE id = ?
        `, [title, description || null, category || 'general', language || 'am', filePath, status || 'draft', id]);

        const updated = await getOne('SELECT * FROM publications WHERE id = ?', [id]);

        res.json({
            success: true,
            data: updated,
            message: 'Publication updated successfully'
        });
    } catch (error) {
        console.error('Update publication error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// DELETE PUBLICATION (Admin only)
// =============================================
export const deletePublication = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await getOne('SELECT * FROM publications WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Publication not found'
            });
        }

        // Delete file
        if (existing.file_path && fs.existsSync(path.join(UPLOAD_DIR, existing.file_path))) {
            fs.unlinkSync(path.join(UPLOAD_DIR, existing.file_path));
        }

        await update('DELETE FROM publications WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Publication deleted successfully'
        });
    } catch (error) {
        console.error('Delete publication error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// GET PUBLICATION CATEGORIES
// =============================================
export const getPublicationCategories = async (req, res) => {
    try {
        const categories = await query(`
            SELECT DISTINCT category, COUNT(*) as count 
            FROM publications 
            WHERE status = 'published' 
            GROUP BY category 
            ORDER BY category
        `);

        const languages = await query(`
            SELECT DISTINCT language, COUNT(*) as count 
            FROM publications 
            WHERE status = 'published' 
            GROUP BY language 
            ORDER BY language
        `);

        res.json({
            success: true,
            data: {
                categories,
                languages
            }
        });
    } catch (error) {
        console.error('Get publication categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};