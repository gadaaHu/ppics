// hash-passwords.js
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function hashPasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database:'icspp'
  });

  try {
    // Get users with plain text passwords (shorter than 60 chars means not hashed)
    const [users] = await connection.execute(
      'SELECT user_id, username, password FROM users WHERE LENGTH(password) < 60'
    );

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await connection.execute(
        'UPDATE users SET password = ? WHERE user_id = ?',
        [hashedPassword, user.user_id]
      );
      console.log(`✅ Hashed password for: ${user.username}`);
    }

    console.log('✅ All passwords hashed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

hashPasswords();