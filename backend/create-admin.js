import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'icspp',
    port: 3306
  });

  try {
    const hash = await bcrypt.hash('admin123', 10);
    await connection.execute(
      'INSERT IGNORE INTO users (user_id, username, password, role) VALUES (1, "admin", ?, "admin")',
      [hash]
    );
    console.log('✅ Admin user created (username: admin, password: admin123)');
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
  } finally {
    await connection.end();
  }
}
run();
