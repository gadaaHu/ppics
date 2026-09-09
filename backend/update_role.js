import { query } from './src/config/database.js';

async function updateDB() {
  try {
    await query("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'leader', 'family_leader', 'member') NOT NULL");
    console.log("Role updated");
  } catch (e) {
    console.log(e);
  }
  
  try {
    await query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER email");
    console.log("Phone added");
  } catch (e) {
    console.log("Phone probably already exists:", e.message);
  }
  process.exit();
}

updateDB();
