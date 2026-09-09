import { query } from './src/config/database.js';

async function updateEvaluationsTable() {
  try {
    await query(`
      ALTER TABLE member_evaluations 
      ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'
    `);
    console.log("member_evaluations table updated with status column successfully.");
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
       console.log("status column already exists.");
    } else {
       console.error("Error updating member_evaluations table:", error);
    }
  } finally {
    process.exit();
  }
}

updateEvaluationsTable();
