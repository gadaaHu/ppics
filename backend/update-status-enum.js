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
    console.log('Updating members status enum...');
    await connection.execute("ALTER TABLE members MODIFY COLUMN status ENUM('Active', 'Inactive', 'Pending') DEFAULT 'Active';");
    console.log('✅ Database schema updated successfully.');
  } catch (err) {
    console.error('❌ Error updating database schema:', err);
  } finally {
    await connection.end();
  }
}

run();
