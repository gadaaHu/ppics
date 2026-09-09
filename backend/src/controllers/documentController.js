import { query, getOne, insert, update } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'plans');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// =============================================
// DOCUMENT TYPES
// =============================================

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

export const createDocumentType = async (req, res) => {
    try {
        const { name, code, description, required } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        const id = await insert(`
            INSERT INTO document_type (name, code, description, required) 
            VALUES (?, ?, ?, ?)
        `, [name, code || null, description || null, required || false]);

        const newType = await getOne('SELECT * FROM document_type WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            data: newType,
            message: 'Document type created successfully'
        });
    } catch (error) {
        console.error('Create document type error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// FAMILIES - MEMBERS ONLY SEE THEIR FAMILY
// =============================================

export const getFamilies = async (req, res) => {
    try {
        const { cooperativeId } = req.params;
        const { userRole, isMember, memberId } = req.user;

        console.log('📋 Get families - User:', { userRole, isMember, memberId, cooperativeId });

        let sql = 'SELECT family_id, family_name FROM families';
        let params = [];

        // For members, only return their own family
        if (isMember && memberId) {
            const member = await getOne('SELECT family_id FROM members WHERE member_id = ?', [memberId]);
            console.log('📋 Member family_id:', member?.family_id);
            
            if (member && member.family_id) {
                sql += ' WHERE family_id = ?';
                params.push(member.family_id);
            } else {
                // Member has no family assigned
                return res.json({
                    success: true,
                    data: []
                });
            }
        } else if (cooperativeId && cooperativeId !== 'null' && cooperativeId !== 'undefined') {
            // For leaders/admins, get all families in cooperative
            sql += ' WHERE cooperative_id = ?';
            params.push(parseInt(cooperativeId));
        } else {
            return res.json({
                success: true,
                data: []
            });
        }

        sql += ' ORDER BY family_name';

        console.log('📋 Get families SQL:', sql, params);
        const families = await query(sql, params);

        console.log(`✅ Found ${families.length} families`);

        res.json({
            success: true,
            data: families
        });
    } catch (error) {
        console.error('Get families error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// COOPERATIVE DOCUMENTS - LEADERS ONLY
// =============================================

export const getCooperativeDocuments = async (req, res) => {
    try {
        const { cooperativeId } = req.params;
        const { userRole } = req.user;

        // Only leaders and admins can see cooperative documents
        if (userRole !== 'admin' && userRole !== 'leader') {
            return res.status(403).json({
                success: false,
                message: 'Only leaders can view cooperative documents'
            });
        }

        console.log('📋 Fetching cooperative documents for cooperativeId:', cooperativeId);

        const sql = `
            SELECT p.*, dt.name as document_type_name, 'Cooperative Level' as doc_level
            FROM plans p 
            LEFT JOIN document_type dt ON p.document_type_id = dt.id 
            WHERE p.family_id IS NULL 
            AND p.cooperative_id = ?
            ORDER BY p.created_at DESC
        `;

        const documents = await query(sql, [parseInt(cooperativeId)]);
        
        console.log(`✅ Found ${documents.length} cooperative documents`);

        const docsWithFileInfo = documents.map(doc => ({
            ...doc,
            file_exists: doc.attachment ? fs.existsSync(path.join(UPLOAD_DIR, doc.attachment)) : false,
            file_extension: doc.attachment ? doc.attachment.split('.').pop().toLowerCase() : null
        }));

        res.json({
            success: true,
            data: docsWithFileInfo
        });
    } catch (error) {
        console.error('Get cooperative documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// FAMILY DOCUMENTS - MEMBERS ONLY THEIR FAMILY
// =============================================

export const getFamilyDocuments = async (req, res) => {
    try {
        const { familyId } = req.params;
        const { userRole, isMember, memberId } = req.user;

        console.log('📋 Fetching family documents for familyId:', familyId);
        console.log('📋 User info:', { userRole, isMember, memberId });

        // Check if user has access to this family
        let hasAccess = false;
        let allowedFamilyId = null;

        if (userRole === 'admin' || userRole === 'leader') {
            hasAccess = true;
            allowedFamilyId = parseInt(familyId);
        } else if (isMember && memberId) {
            const member = await getOne('SELECT family_id FROM members WHERE member_id = ?', [memberId]);
            console.log('📋 Member family_id:', member?.family_id, 'Requested familyId:', parseInt(familyId));
            
            if (member && member.family_id) {
                // Members can ONLY access their own family
                if (member.family_id === parseInt(familyId)) {
                    hasAccess = true;
                    allowedFamilyId = member.family_id;
                } else {
                    console.log(`❌ Member ${memberId} attempted to access family ${familyId} but belongs to family ${member.family_id}`);
                    return res.status(403).json({
                        success: false,
                        message: 'You can only view your own family documents'
                    });
                }
            }
        }

        if (!hasAccess) {
            console.log('❌ Access denied for familyId:', familyId);
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get family documents (family_id IS NOT NULL)
        const sql = `
            SELECT p.*, dt.name as document_type_name, 'Family Level' as doc_level
            FROM plans p 
            LEFT JOIN document_type dt ON p.document_type_id = dt.id 
            WHERE p.family_id = ?
            ORDER BY p.created_at DESC
        `;

        const documents = await query(sql, [parseInt(familyId)]);
        
        console.log(`✅ Found ${documents.length} family documents`);

        const docsWithFileInfo = documents.map(doc => ({
            ...doc,
            file_exists: doc.attachment ? fs.existsSync(path.join(UPLOAD_DIR, doc.attachment)) : false,
            file_extension: doc.attachment ? doc.attachment.split('.').pop().toLowerCase() : null
        }));

        res.json({
            success: true,
            data: docsWithFileInfo
        });
    } catch (error) {
        console.error('Get family documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================================
// ADD FAMILY DOCUMENT - MEMBERS ONLY THEIR FAMILY
// =============================================

export const addFamilyDocument = async (req, res) => {
    try {
        const { family_id, cooperative_id, title, description, date, document_type_id } = req.body;
        const { userRole, isMember, memberId } = req.user;

        console.log('📋 Adding family document:', { family_id, cooperative_id, title, date });

        // Check if user has permission
        let hasPermission = false;

        if (userRole === 'admin' || userRole === 'leader') {
            hasPermission = true;
        } else if (isMember && memberId) {
            const member = await getOne('SELECT family_id FROM members WHERE member_id = ?', [memberId]);
            if (member && member.family_id === parseInt(family_id)) {
                hasPermission = true;
            } else {
                console.log(`❌ Member ${memberId} attempted to add document to family ${family_id} but belongs to family ${member?.family_id}`);
                return res.status(403).json({
                    success: false,
                    message: 'You can only add documents to your own family'
                });
            }
        }

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to add documents to this family'
            });
        }

        if (!title || !date) {
            return res.status(400).json({
                success: false,
                message: 'Title and date are required'
            });
        }

        let attachment = '';
        if (req.file) {
            attachment = req.file.filename;
        }

        const id = await insert(`
            INSERT INTO plans (family_id, cooperative_id, title, description, date, attachment, document_type_id, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [family_id, cooperative_id || null, title, description || null, date, attachment, document_type_id || null]);

        const newDoc = await getOne('SELECT * FROM plans WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            data: newDoc,
            message: 'Document added successfully'
        });
    } catch (error) {
        console.error('Add family document error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================================
// UPDATE FAMILY DOCUMENT - MEMBERS ONLY THEIR FAMILY
// =============================================

export const updateFamilyDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, document_type_id } = req.body;
        const { userRole, isMember, memberId } = req.user;

        const existing = await getOne('SELECT * FROM plans WHERE id = ? AND family_id IS NOT NULL', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check permission
        let hasPermission = false;

        if (userRole === 'admin' || userRole === 'leader') {
            hasPermission = true;
        } else if (isMember && memberId) {
            const member = await getOne('SELECT family_id FROM members WHERE member_id = ?', [memberId]);
            if (member && member.family_id === existing.family_id) {
                hasPermission = true;
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'You can only update documents in your own family'
                });
            }
        }

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this document'
            });
        }

        let attachment = existing.attachment;
        if (req.file) {
            if (existing.attachment && fs.existsSync(path.join(UPLOAD_DIR, existing.attachment))) {
                fs.unlinkSync(path.join(UPLOAD_DIR, existing.attachment));
            }
            attachment = req.file.filename;
        }

        await update(`
            UPDATE plans SET 
                title = ?, 
                description = ?, 
                date = ?, 
                document_type_id = ?,
                attachment = ?
            WHERE id = ?
        `, [title, description || null, date, document_type_id || null, attachment, id]);

        const updated = await getOne('SELECT * FROM plans WHERE id = ?', [id]);

        res.json({
            success: true,
            data: updated,
            message: 'Document updated successfully'
        });
    } catch (error) {
        console.error('Update family document error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// DELETE FAMILY DOCUMENT - MEMBERS ONLY THEIR FAMILY
// =============================================

export const deleteFamilyDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { userRole, isMember, memberId } = req.user;

        const existing = await getOne('SELECT * FROM plans WHERE id = ? AND family_id IS NOT NULL', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check permission
        let hasPermission = false;

        if (userRole === 'admin' || userRole === 'leader') {
            hasPermission = true;
        } else if (isMember && memberId) {
            const member = await getOne('SELECT family_id FROM members WHERE member_id = ?', [memberId]);
            if (member && member.family_id === existing.family_id) {
                hasPermission = true;
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'You can only delete documents from your own family'
                });
            }
        }

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this document'
            });
        }

        if (existing.attachment && fs.existsSync(path.join(UPLOAD_DIR, existing.attachment))) {
            fs.unlinkSync(path.join(UPLOAD_DIR, existing.attachment));
        }

        await update('DELETE FROM plans WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Delete family document error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// COOPERATIVE DOCUMENTS - LEADERS ONLY
// =============================================

export const addCooperativeDocument = async (req, res) => {
    try {
        const { cooperative_id, title, description, date, document_type_id } = req.body;
        const { userRole } = req.user;

        if (userRole !== 'admin' && userRole !== 'leader') {
            return res.status(403).json({
                success: false,
                message: 'Only leaders can add cooperative documents'
            });
        }

        if (!title || !date) {
            return res.status(400).json({
                success: false,
                message: 'Title and date are required'
            });
        }

        let attachment = '';
        if (req.file) {
            attachment = req.file.filename;
        }

        const id = await insert(`
            INSERT INTO plans (cooperative_id, title, description, date, attachment, document_type_id, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [cooperative_id, title, description || null, date, attachment, document_type_id || null]);

        const newDoc = await getOne('SELECT * FROM plans WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            data: newDoc,
            message: 'Cooperative document added successfully'
        });
    } catch (error) {
        console.error('Add cooperative document error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const updateCooperativeDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, document_type_id } = req.body;
        const { userRole } = req.user;

        if (userRole !== 'admin' && userRole !== 'leader') {
            return res.status(403).json({
                success: false,
                message: 'Only leaders can update cooperative documents'
            });
        }

        const existing = await getOne('SELECT * FROM plans WHERE id = ? AND family_id IS NULL', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        let attachment = existing.attachment;
        if (req.file) {
            if (existing.attachment && fs.existsSync(path.join(UPLOAD_DIR, existing.attachment))) {
                fs.unlinkSync(path.join(UPLOAD_DIR, existing.attachment));
            }
            attachment = req.file.filename;
        }

        await update(`
            UPDATE plans SET 
                title = ?, 
                description = ?, 
                date = ?, 
                document_type_id = ?,
                attachment = ?
            WHERE id = ? AND family_id IS NULL
        `, [title, description || null, date, document_type_id || null, attachment, id]);

        const updated = await getOne('SELECT * FROM plans WHERE id = ?', [id]);

        res.json({
            success: true,
            data: updated,
            message: 'Cooperative document updated successfully'
        });
    } catch (error) {
        console.error('Update cooperative document error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const deleteCooperativeDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { userRole } = req.user;

        if (userRole !== 'admin' && userRole !== 'leader') {
            return res.status(403).json({
                success: false,
                message: 'Only leaders can delete cooperative documents'
            });
        }

        const existing = await getOne('SELECT * FROM plans WHERE id = ? AND family_id IS NULL', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        if (existing.attachment && fs.existsSync(path.join(UPLOAD_DIR, existing.attachment))) {
            fs.unlinkSync(path.join(UPLOAD_DIR, existing.attachment));
        }

        await update('DELETE FROM plans WHERE id = ? AND family_id IS NULL', [id]);

        res.json({
            success: true,
            message: 'Cooperative document deleted successfully'
        });
    } catch (error) {
        console.error('Delete cooperative document error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// DOCUMENT STATISTICS
// =============================================

export const getDocumentStats = async (req, res) => {
    try {
        const { cooperativeId, familyId } = req.query;
        const { userRole, isMember, memberId } = req.user;

        let whereClause = '';
        let params = [];

        // For members, only count their own family documents
        if (isMember && memberId) {
            const member = await getOne('SELECT family_id FROM members WHERE member_id = ?', [memberId]);
            if (member && member.family_id) {
                whereClause = 'WHERE family_id = ?';
                params.push(member.family_id);
            }
        } else if (cooperativeId && cooperativeId !== 'null') {
            whereClause = 'WHERE cooperative_id = ?';
            params.push(parseInt(cooperativeId));
        }

        const totalDocs = await getOne(`SELECT COUNT(*) as total FROM plans ${whereClause}`, params);

        const byType = await query(`
            SELECT dt.name, COUNT(p.id) as count
            FROM plans p
            LEFT JOIN document_type dt ON p.document_type_id = dt.id
            ${whereClause}
            GROUP BY dt.id, dt.name
            ORDER BY count DESC
        `, params);

        res.json({
            success: true,
            data: {
                total: totalDocs?.total || 0,
                byType: byType
            }
        });
    } catch (error) {
        console.error('Get document stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};