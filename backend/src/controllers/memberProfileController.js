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

// Get member profile with all details
export const getMemberProfile = async (req, res) => {
    try {
        const { memberId, isMember } = req.user;

        if (!isMember || !memberId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Member only.'
            });
        }

        const member = await getOne(`
            SELECT m.*, 
                   f.family_name, 
                   c.cooperative_name, 
                   d.district_name,
                   GROUP_CONCAT(DISTINCT p.position_name SEPARATOR ', ') as positions
            FROM members m
            LEFT JOIN families f ON m.family_id = f.family_id
            LEFT JOIN cooperatives c ON m.cooperative_id = c.cooperative_id
            LEFT JOIN districts d ON m.district_id = d.district_id
            LEFT JOIN member_positions mp ON m.member_id = mp.member_id
            LEFT JOIN positions p ON mp.position_id = p.position_id
            WHERE m.member_id = ?
            GROUP BY m.member_id
        `, [memberId]);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Get attendance stats
        const stats = await getOne(
            'SELECT COUNT(*) as total_attendance FROM attendance WHERE user_id = ?',
            [memberId]
        );

        // Get document count
        const docCount = await getOne(
            'SELECT COUNT(*) as total_documents FROM plans WHERE family_id = ?',
            [member.family_id]
        );

        res.json({
            success: true,
            data: {
                ...member,
                total_attendance: stats?.total_attendance || 0,
                total_documents: docCount?.total_documents || 0,
                photo_url: member.photo ? `/uploads/members/${member.photo}` : null
            }
        });
    } catch (error) {
        console.error('Get member profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update member profile
export const updateMemberProfile = async (req, res) => {
    try {
        const { memberId, isMember } = req.user;
        const {
            full_name,
            phone,
            email,
            address,
            gender,
            date_of_birth,
            nation,
            education_level,
            field_of_study,
            current_region,
            current_zone,
            current_woreda_kebele,
            social_link1,
            social_link2
        } = req.body;

        if (!isMember || !memberId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Member only.'
            });
        }

        let photo = null;
        if (req.file) {
            // Delete old photo if exists
            const oldMember = await getOne('SELECT photo FROM members WHERE member_id = ?', [memberId]);
            if (oldMember?.photo && fs.existsSync(path.join(UPLOAD_DIR, oldMember.photo))) {
                fs.unlinkSync(path.join(UPLOAD_DIR, oldMember.photo));
            }
            photo = req.file.filename;
        }

        const sql = `
            UPDATE members SET
                full_name = ?,
                phone = ?,
                email = ?,
                address = ?,
                gender = ?,
                date_of_birth = ?,
                nation = ?,
                education_level = ?,
                field_of_study = ?,
                current_region = ?,
                current_zone = ?,
                current_woreda_kebele = ?,
                social_link1 = ?,
                social_link2 = ?,
                photo = COALESCE(?, photo)
            WHERE member_id = ?
        `;

        await update(sql, [
            full_name,
            phone,
            email,
            address || null,
            gender || null,
            date_of_birth || null,
            nation || null,
            education_level || null,
            field_of_study || null,
            current_region || null,
            current_zone || null,
            current_woreda_kebele || null,
            social_link1 || null,
            social_link2 || null,
            photo,
            memberId
        ]);

        const updated = await getOne('SELECT * FROM members WHERE member_id = ?', [memberId]);

        res.json({
            success: true,
            data: updated,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update member profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Change member password
export const changeMemberPassword = async (req, res) => {
    try {
        const { memberId, isMember } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!isMember || !memberId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Member only.'
            });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const member = await getOne('SELECT * FROM members WHERE member_id = ?', [memberId]);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        const currentMemberPassword = member.password || 'TempIcspp@2026!';
        if (currentMemberPassword !== currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        await update('UPDATE members SET password = ? WHERE member_id = ?', [newPassword, memberId]);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change member password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Upload profile photo
export const uploadProfilePhoto = async (req, res) => {
    try {
        const { memberId, isMember } = req.user;

        if (!isMember || !memberId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Member only.'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Delete old photo
        const oldMember = await getOne('SELECT photo FROM members WHERE member_id = ?', [memberId]);
        if (oldMember?.photo && fs.existsSync(path.join(UPLOAD_DIR, oldMember.photo))) {
            fs.unlinkSync(path.join(UPLOAD_DIR, oldMember.photo));
        }

        await update('UPDATE members SET photo = ? WHERE member_id = ?', [req.file.filename, memberId]);

        res.json({
            success: true,
            data: { photo: req.file.filename, photo_url: `/uploads/members/${req.file.filename}` },
            message: 'Profile photo updated successfully'
        });
    } catch (error) {
        console.error('Upload profile photo error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get member stats
export const getMemberStats = async (req, res) => {
    try {
        const { memberId, isMember } = req.user;

        if (!isMember || !memberId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Member only.'
            });
        }

        const [attendance, documents, events] = await Promise.all([
            getOne('SELECT COUNT(*) as total FROM attendance WHERE user_id = ?', [memberId]),
            getOne('SELECT COUNT(*) as total FROM plans WHERE family_id = (SELECT family_id FROM members WHERE member_id = ?)', [memberId]),
            getOne('SELECT COUNT(*) as total FROM events WHERE FIND_IN_SET(?, attendees)', [memberId])
        ]);

        res.json({
            success: true,
            data: {
                attendance: attendance?.total || 0,
                documents: documents?.total || 0,
                events: events?.total || 0
            }
        });
    } catch (error) {
        console.error('Get member stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};