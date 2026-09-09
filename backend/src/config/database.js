import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'icspp',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

export const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Query error:', error);
    console.error('❌ SQL:', sql);
    console.error('❌ Params:', params);
    throw error;
  }
};

export const getOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0] || null;
};

export const insert = async (sql, params = []) => {
  const [result] = await pool.query(sql, params);
  return result.insertId;
};

export const update = async (sql, params = []) => {
  const [result] = await pool.query(sql, params);
  return result.affectedRows;
};

export default pool;