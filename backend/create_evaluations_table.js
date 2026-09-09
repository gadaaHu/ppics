import { query } from './src/config/database.js';

async function createEvaluationsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS member_evaluations (
        evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
        member_id INT NOT NULL,
        evaluator_id INT NOT NULL,
        evaluation_period VARCHAR(100) NOT NULL,
        total_score DECIMAL(5, 2) NOT NULL,
        criteria_scores JSON,
        remarks TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
        FOREIGN KEY (evaluator_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log("member_evaluations table created successfully.");
  } catch (error) {
    console.error("Error creating member_evaluations table:", error);
  } finally {
    process.exit();
  }
}

createEvaluationsTable();
