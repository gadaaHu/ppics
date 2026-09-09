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
    const hash = await bcrypt.hash('1234', 10);
    await connection.execute('UPDATE users SET password = ? WHERE username = "admin"', [hash]);
    console.log('✅ Password set to hashed "1234"');
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
run();
