import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const sourceDir = 'C:\\inetpub\\wwwroot\\icspp\\pages\\Gallary';
const destDir = 'C:\\inetpub\\wwwroot\\icspp-migration\\backend\\uploads\\gallery';

async function run() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir);
  console.log(`Found ${files.length} files to migrate.`);

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'icspp',
    port: 3306
  });

  try {
    let count = 0;
    for (const file of files) {
      const srcFile = path.join(sourceDir, file);
      const destFile = path.join(destDir, file);

      // Copy file
      if (!fs.existsSync(destFile)) {
        fs.copyFileSync(srcFile, destFile);
      }

      // Extract timestamp from filename (e.g. 1774249179_3516.jpeg)
      let eventDate = new Date();
      const match = file.match(/^(\d{10})_/);
      if (match) {
        eventDate = new Date(parseInt(match[1]) * 1000);
      }

      const dateStr = eventDate.toISOString().split('T')[0];

      // Insert into DB
      await connection.execute(
        'INSERT INTO gallery (title, image, event_date) VALUES (?, ?, ?)',
        ['Archived Photo', file, dateStr]
      );
      count++;
    }
    console.log(`✅ Successfully migrated ${count} photos to the gallery!`);
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await connection.end();
  }
}

run();
