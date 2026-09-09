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
    console.log('Fixing users table...');
    await connection.execute("ALTER TABLE users ADD COLUMN full_name VARCHAR(255) DEFAULT NULL;").catch(e => console.log('users.full_name might already exist'));
    await connection.execute("ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT NULL;").catch(e => {});
    await connection.execute("ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'active';").catch(e => {});

    console.log('Creating missing tables...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        content TEXT,
        newsdate DATE,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        event_date DATE,
        image VARCHAR(255),
        type VARCHAR(50),
        url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS document_type (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        document_type_id INT,
        family_id INT,
        file_path VARCHAR(255),
        description TEXT,
        year INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database schema updated successfully.');
  } catch (err) {
    console.error('❌ Error updating database schema:', err);
  } finally {
    await connection.end();
  }
}

run();
