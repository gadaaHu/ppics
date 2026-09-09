import { query, getOne, insert, update } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'members');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// =============================================
// GET ALL MEMBERS - Supports both Admin and Member access
// =============================================
export const getMembers = async (req, res) => {
    try {
        const { search, district_id, cooperative_id, family_id } = req.query;
        const { role: userRole, isMember, memberId, cooperative_id: userCooperativeId, family_id: userFamilyId } = req.user;

        console.log('📋 Fetching members...');
        console.log('📋 User info:', { userRole, isMember, memberId, userCooperativeId, userFamilyId });

        let whereClauses = [];
        let params = [];

        // If member (not admin/leader), only show members from their cooperative
        if (isMember && userRole === 'member') {
            whereClauses.push('m.cooperative_id = ?');
            params.push(userCooperativeId);
        }

        // If leader, only show members from their cooperative
        if (userRole === 'leader') {
            whereClauses.push('m.cooperative_id = ?');
            params.push(userCooperativeId);
        }

        // If family_leader, only show members from their family
        if (userRole === 'family_leader') {
            whereClauses.push('m.cooperative_id = ? AND m.family_id = ?');
            params.push(userCooperativeId, userFamilyId);
        }

        if (search) {
            whereClauses.push('(m.full_name LIKE ? OR m.phone LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (district_id) {
            whereClauses.push('m.district_id = ?');
            params.push(district_id);
        }

        if (cooperative_id) {
            whereClauses.push('m.cooperative_id = ?');
            params.push(cooperative_id);
        }

        if (family_id) {
            whereClauses.push('m.family_id = ?');
            params.push(family_id);
        }

        // Build WHERE clause
        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const sql = `
            SELECT m.*, 
                   f.family_name, 
                   c.cooperative_name, 
                   d.district_name,
                   GROUP_CONCAT(DISTINCT p.position_name SEPARATOR ', ') as position_name
            FROM members m
            LEFT JOIN families f ON m.family_id = f.family_id
            LEFT JOIN cooperatives c ON m.cooperative_id = c.cooperative_id
            LEFT JOIN districts d ON m.district_id = d.district_id
            LEFT JOIN member_positions mp ON m.member_id = mp.member_id
            LEFT JOIN positions p ON mp.position_id = p.position_id
            ${whereSql}
            GROUP BY m.member_id
            ORDER BY d.district_name, c.cooperative_name, f.family_name, m.full_name
        `;

        console.log('📝 SQL:', sql);
        console.log('📝 Params:', params);

        const members = await query(sql, params);
        
        console.log(`✅ Found ${members.length} members`);

        // Add photo URL
        const membersWithPhoto = members.map(member => ({
            ...member,
            photo_url: member.photo ? `/uploads/members/${member.photo}` : null
        }));

        res.json({
            success: true,
            data: membersWithPhoto
        });
    } catch (error) {
        console.error('❌ Get members error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================================
// GET SINGLE MEMBER BY ID
// =============================================
export const getMemberById = async (req, res) => {
    try {
        const { id } = req.params;

        const member = await getOne(`
            SELECT m.*, 
                   f.family_name, 
                   c.cooperative_name, 
                   d.district_name,
                   GROUP_CONCAT(DISTINCT p.position_name SEPARATOR ', ') as position_name,
                   GROUP_CONCAT(DISTINCT p.position_id SEPARATOR ', ') as position_id
            FROM members m
            LEFT JOIN families f ON m.family_id = f.family_id
            LEFT JOIN cooperatives c ON m.cooperative_id = c.cooperative_id
            LEFT JOIN districts d ON m.district_id = d.district_id
            LEFT JOIN member_positions mp ON m.member_id = mp.member_id
            LEFT JOIN positions p ON mp.position_id = p.position_id
            WHERE m.member_id = ?
            GROUP BY m.member_id
        `, [id]);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        res.json({
            success: true,
            data: member
        });
    } catch (error) {
        console.error('Get member by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// CREATE NEW MEMBER - Fixed (No created_at)
// =============================================
export const createMember = async (req, res) => {
    try {
        const {
            full_name, gender, phone, email, family_id, cooperative_id, district_id,
            nation, education_level, field_of_study, birth_region, birth_zone,
            birth_woreda_kebele, current_region, current_zone, current_woreda_kebele,
            membership_year, leader_status, key_strength, key_weakness, grade,
            membership_fee, training_center, training_type, training_round,
            training_year, training_result, social_link1, social_link2,
            additional_info, position_id, status
        } = req.body;
        const userRole = req.user?.role;

        console.log('📋 Creating member:', { full_name, gender, cooperative_id, family_id });

        // Validate required fields
        if (!full_name || !gender) {
            return res.status(400).json({
                success: false,
                message: 'Full name and gender are required'
            });
        }

        // Handle photo upload
        let photoPath = null;
        if (req.file) {
            photoPath = req.file.filename;
            console.log('📷 Photo uploaded:', photoPath);
        }

        // ✅ Removed created_at - let database handle it with default
        const sql = `
            INSERT INTO members (
                full_name, gender, phone, email, family_id, cooperative_id, district_id,
                photo, nation, education_level, field_of_study, birth_region, birth_zone,
                birth_woreda_kebele, current_region, current_zone, current_woreda_kebele,
                membership_year, leader_status, key_strength, key_weakness, grade,
                membership_fee, training_center, training_type, training_round,
                training_year, training_result, social_link1, social_link2, additional_info,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const memberId = await insert(sql, [
            full_name, gender, phone || null, email || null, 
            family_id || null, cooperative_id || null, district_id || null,
            photoPath, nation || null, education_level || null, field_of_study || null, 
            birth_region || null, birth_zone || null,
            birth_woreda_kebele || null, current_region || null, current_zone || null, 
            current_woreda_kebele || null,
            membership_year || null, leader_status || null, key_strength || null, 
            key_weakness || null, grade || null,
            membership_fee || null, training_center || null, training_type || null, 
            training_round || null,
            training_year || null, training_result || null, social_link1 || null, 
            social_link2 || null, additional_info || null,
            userRole === 'member' ? 'Pending' : (status || 'Active')
        ]);

        console.log(`✅ Member created with ID: ${memberId}`);

        // Assign position if provided
        if (position_id) {
            await insert(
                'INSERT INTO member_positions (member_id, position_id, start_date) VALUES (?, ?, NOW())',
                [memberId, position_id]
            );
            console.log(`✅ Position ${position_id} assigned to member ${memberId}`);
        }

        const newMember = await getOne('SELECT * FROM members WHERE member_id = ?', [memberId]);

        res.status(201).json({
            success: true,
            data: newMember,
            message: 'Member added successfully'
        });
    } catch (error) {
        console.error('❌ Create member error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================================
// UPDATE MEMBER
// =============================================
export const updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            full_name, gender, phone, email, family_id, cooperative_id, district_id,
            nation, education_level, field_of_study, birth_region, birth_zone,
            birth_woreda_kebele, current_region, current_zone, current_woreda_kebele,
            membership_year, leader_status, key_strength, key_weakness, grade,
            membership_fee, training_center, training_type, training_round,
            training_year, training_result, social_link1, social_link2,
            additional_info, position_id, status
        } = req.body;

        console.log(`📋 Updating member ${id}:`, { full_name, gender, cooperative_id, family_id });

        const existing = await getOne('SELECT * FROM members WHERE member_id = ?', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        let photoPath = existing.photo;
        if (req.file) {
            // Delete old photo if exists
            if (existing.photo && fs.existsSync(path.join(UPLOAD_DIR, existing.photo))) {
                fs.unlinkSync(path.join(UPLOAD_DIR, existing.photo));
                console.log(`🗑️ Deleted old photo: ${existing.photo}`);
            }
            photoPath = req.file.filename;
            console.log(`📷 New photo uploaded: ${photoPath}`);
        }

        const sql = `
            UPDATE members SET
                full_name = ?, gender = ?, phone = ?, email = ?, family_id = ?,
                cooperative_id = ?, district_id = ?, nation = ?, education_level = ?,
                field_of_study = ?, birth_region = ?, birth_zone = ?,
                birth_woreda_kebele = ?, current_region = ?, current_zone = ?,
                current_woreda_kebele = ?, membership_year = ?, leader_status = ?,
                key_strength = ?, key_weakness = ?, grade = ?, membership_fee = ?,
                training_center = ?, training_type = ?, training_round = ?,
                training_year = ?, training_result = ?, social_link1 = ?,
                social_link2 = ?, additional_info = ?, photo = ?,
                status = ?
            WHERE member_id = ?
        `;

        await update(sql, [
            full_name, gender, phone || null, email || null, 
            family_id || null, cooperative_id || null, district_id || null, 
            nation || null, education_level || null,
            field_of_study || null, birth_region || null, birth_zone || null, 
            birth_woreda_kebele || null,
            current_region || null, current_zone || null, current_woreda_kebele || null, 
            membership_year || null,
            leader_status || null, key_strength || null, key_weakness || null, 
            grade || null, membership_fee || null,
            training_center || null, training_type || null, training_round || null,
            training_year || null, training_result || null, social_link1 || null, 
            social_link2 || null, additional_info || null,
            photoPath, status || 'Active', id
        ]);

        // Update position
        if (position_id) {
            const existingPos = await getOne('SELECT * FROM member_positions WHERE member_id = ?', [id]);
            if (existingPos) {
                await update(
                    'UPDATE member_positions SET position_id = ? WHERE member_id = ?',
                    [position_id, id]
                );
            } else {
                await insert(
                    'INSERT INTO member_positions (member_id, position_id, start_date) VALUES (?, ?, NOW())',
                    [id, position_id]
                );
            }
        }

        const updatedMember = await getOne('SELECT * FROM members WHERE member_id = ?', [id]);

        res.json({
            success: true,
            data: updatedMember,
            message: 'Member updated successfully'
        });
    } catch (error) {
        console.error('❌ Update member error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// =============================================
// DELETE MEMBER
// =============================================
export const deleteMember = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`📋 Deleting member ${id}`);

        const member = await getOne('SELECT * FROM members WHERE member_id = ?', [id]);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Delete photo if exists
        if (member.photo && fs.existsSync(path.join(UPLOAD_DIR, member.photo))) {
            fs.unlinkSync(path.join(UPLOAD_DIR, member.photo));
            console.log(`🗑️ Deleted photo: ${member.photo}`);
        }

        // Delete member positions first
        await update('DELETE FROM member_positions WHERE member_id = ?', [id]);

        // Delete member
        await update('DELETE FROM members WHERE member_id = ?', [id]);

        console.log(`✅ Member ${id} deleted successfully`);

        res.json({
            success: true,
            message: 'Member deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete member error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// GET DROPDOWN DATA
// =============================================
export const getDropdownData = async (req, res) => {
    try {
        const [districts, cooperatives, families, positions] = await Promise.all([
            query('SELECT * FROM districts ORDER BY district_name'),
            query('SELECT * FROM cooperatives ORDER BY cooperative_name'),
            query('SELECT * FROM families ORDER BY family_name'),
            query('SELECT * FROM positions ORDER BY level, sector, position_name')
        ]);

        res.json({
            success: true,
            data: {
                districts,
                cooperatives,
                families,
                positions
            }
        });
    } catch (error) {
        console.error('Get dropdown data error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// GET COOPERATIVES BY DISTRICT
// =============================================
export const getCooperativesByDistrict = async (req, res) => {
    try {
        const { districtId } = req.params;
        const cooperatives = await query(
            'SELECT * FROM cooperatives WHERE district_id = ? ORDER BY cooperative_name',
            [districtId]
        );

        res.json({
            success: true,
            data: cooperatives
        });
    } catch (error) {
        console.error('Get cooperatives by district error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// GET FAMILIES BY COOPERATIVE
// =============================================
export const getFamiliesByCooperative = async (req, res) => {
    try {
        const { cooperativeId } = req.params;
        const families = await query(
            'SELECT * FROM families WHERE cooperative_id = ? ORDER BY family_name',
            [cooperativeId]
        );

        res.json({
            success: true,
            data: families
        });
    } catch (error) {
        console.error('Get families by cooperative error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =============================================
// APPROVE MEMBER
// =============================================
export const approveMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { role: userRole, isMember, memberId } = req.user;

        console.log(`📋 Approving member ${id} by user ${memberId || 'admin'}`);

        // Only allow admins, leaders, or family leaders
        if (userRole === 'member') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to approve members'
            });
        }

        const existing = await getOne('SELECT * FROM members WHERE member_id = ?', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Restrict family leaders to their own family
        if (userRole === 'family_leader' && existing.family_id !== req.user.family_id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to approve members outside your family'
            });
        }

        // Restrict leaders to their own cooperative
        if (userRole === 'leader' && existing.cooperative_id !== req.user.cooperative_id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to approve members outside your cooperative'
            });
        }

        if (existing.status === 'Active') {
            return res.status(400).json({
                success: false,
                message: 'Member is already active'
            });
        }

        await update('UPDATE members SET status = ? WHERE member_id = ?', ['Active', id]);

        const updatedMember = await getOne('SELECT * FROM members WHERE member_id = ?', [id]);

        res.json({
            success: true,
            data: updatedMember,
            message: 'Member approved successfully'
        });
    } catch (error) {
        console.error('❌ Approve member error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};