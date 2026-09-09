import { query, getOne, insert, update } from '../config/database.js';

// Get all news (with pagination)
export const getNews = async (req, res) => {
  try {
    const { search, limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE news_title LIKE ? OR news_des LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }

    const sql = `
      SELECT * FROM news 
      ${whereClause}
      ORDER BY newsdate DESC, id DESC
      LIMIT ? OFFSET ?
    `;
    
    const countSql = `
      SELECT COUNT(*) as total FROM news 
      ${whereClause}
    `;

    const [news, countResult] = await Promise.all([
      query(sql, [...params, parseInt(limit), parseInt(offset)]),
      query(countSql, params)
    ]);

    // Format dates
    const formattedNews = news.map(item => ({
      ...item,
      formatted_date: item.newsdate ? new Date(item.newsdate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : null
    }));

    res.json({
      success: true,
      data: formattedNews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0]?.total || 0,
        pages: Math.ceil((countResult[0]?.total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ Get latest news (for hero slider and home page)
export const getLatestNews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const sql = `
      SELECT * FROM news 
      ORDER BY newsdate DESC, id DESC 
      LIMIT ?
    `;

    const news = await query(sql, [limit]);

    // Format dates
    const formattedNews = news.map(item => ({
      ...item,
      formatted_date: item.newsdate ? new Date(item.newsdate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : null
    }));

    res.json({
      success: true,
      data: formattedNews
    });
  } catch (error) {
    console.error('Get latest news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single news by ID
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await getOne('SELECT * FROM news WHERE id = ?', [id]);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    // Increment view count
    await update('UPDATE news SET views = views + 1 WHERE id = ?', [id]);

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get news by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new news
export const createNews = async (req, res) => {
  try {
    const { news_title, news_des, newsdate } = req.body;
    const news_image = req.file ? req.file.filename : null;

    if (!news_title || !news_des || !newsdate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description and date are required'
      });
    }

    const sql = `
      INSERT INTO news (news_title, news_des, newsdate, news_image, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `;

    const id = await insert(sql, [
      news_title,
      news_des,
      newsdate,
      news_image || null
    ]);

    const news = await getOne('SELECT * FROM news WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      data: news,
      message: 'News created successfully'
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update news
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { news_title, news_des, newsdate } = req.body;
    const news_image = req.file ? req.file.filename : undefined;

    const existing = await getOne('SELECT * FROM news WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    const finalImage = news_image !== undefined ? news_image : existing.news_image;

    const sql = `
      UPDATE news 
      SET news_title = ?, news_des = ?, newsdate = ?, news_image = ?
      WHERE id = ?
    `;

    await update(sql, [
      news_title || existing.news_title,
      news_des || existing.news_des,
      newsdate || existing.newsdate,
      finalImage,
      id
    ]);

    const news = await getOne('SELECT * FROM news WHERE id = ?', [id]);

    res.json({
      success: true,
      data: news,
      message: 'News updated successfully'
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete news
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await getOne('SELECT * FROM news WHERE id = ?', [id]);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    await update('DELETE FROM news WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};