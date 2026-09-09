 import { query, getOne, insert, update } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all gallery images with filters
export const getGallery = async (req, res) => {
  try {
    const { search, date } = req.query;
    
    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE title LIKE ?';
      params.push(`%${search}%`);
    }

    if (date) {
      whereClause = whereClause ? `${whereClause} AND event_date = ?` : 'WHERE event_date = ?';
      params.push(date);
    }

    const sql = `
      SELECT * FROM gallery 
      ${whereClause}
      ORDER BY event_date DESC, created_at DESC
    `;

    const images = await query(sql, params);

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single gallery image by ID
export const getGalleryById = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await getOne('SELECT * FROM gallery WHERE id = ?', [id]);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Get gallery by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Upload gallery images
export const uploadGallery = async (req, res) => {
  try {
    const { title, event_date } = req.body;
    const files = req.files;

    if (!title || !event_date) {
      return res.status(400).json({
        success: false,
        message: 'Title and event date are required'
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    const uploadedImages = [];

    for (const file of files) {
      const sql = `
        INSERT INTO gallery (title, image, event_date, created_at) 
        VALUES (?, ?, ?, NOW())
      `;

      const id = await insert(sql, [
        title,
        file.filename,
        event_date
      ]);

      uploadedImages.push({
        id,
        filename: file.filename,
        originalName: file.originalname
      });
    }

    res.status(201).json({
      success: true,
      data: uploadedImages,
      message: `${uploadedImages.length} image(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Upload gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete gallery image
export const deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await getOne('SELECT * FROM gallery WHERE id = ?', [id]);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete file from server
    const filePath = path.join(__dirname, '../../uploads/gallery/', image.image);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await update('DELETE FROM gallery WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete multiple gallery images by date
export const deleteGalleryByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const images = await query('SELECT * FROM gallery WHERE event_date = ?', [date]);

    // Delete all files
    for (const image of images) {
      const filePath = path.join(__dirname, '../../uploads/gallery/', image.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await update('DELETE FROM gallery WHERE event_date = ?', [date]);

    res.json({
      success: true,
      data: images,
      message: `${images.length} image(s) deleted successfully`
    });
  } catch (error) {
    console.error('Delete gallery by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update gallery image (title, date)
export const updateGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, event_date } = req.body;

    const existing = await getOne('SELECT * FROM gallery WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    await update(
      'UPDATE gallery SET title = ?, event_date = ? WHERE id = ?',
      [title || existing.title, event_date || existing.event_date, id]
    );

    const updated = await getOne('SELECT * FROM gallery WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updated,
      message: 'Image updated successfully'
    });
  } catch (error) {
    console.error('Update gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
