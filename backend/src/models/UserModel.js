import { query, getOne, insert, update } from '../config/database.js';
import bcrypt from 'bcryptjs';

class UserModel {
  static async findByUsername(username) {
    return await getOne('SELECT * FROM users WHERE username = ?', [username]);
  }

  static async findByEmail(email) {
    return await getOne('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findById(id) {
    return await getOne('SELECT * FROM users WHERE id = ?', [id]);
  }

  static async create(userData) {
    const { username, password, email, full_name, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO users (username, password, email, full_name, role, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const id = await insert(sql, [username, hashedPassword, email, full_name, role || 'member']);
    return await this.findById(id);
  }

  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }
}

export default UserModel;