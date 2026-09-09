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
    await connection.execute('DROP TABLE IF EXISTS events');
    await connection.execute('DROP TABLE IF EXISTS families');
    await connection.execute('DROP TABLE IF EXISTS cooperatives');
    await connection.execute('DROP TABLE IF EXISTS districts');
    console.log('Tables dropped.');
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

run();
