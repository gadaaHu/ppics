import fs from 'fs';
import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'icspp',
    port: 3306,
    multipleStatements: true
  });

  try {
    const sql = fs.readFileSync('C:\\inetpub\\wwwroot\\icspp\\icspp.sql', 'utf8');
    await connection.query(sql);
    console.log('✅ Database imported successfully!');
  } catch (err) {
    console.error('❌ Error importing database:', err.message);
  } finally {
    await connection.end();
  }
}

run();
