import { query } from './src/config/database.js';

async function seed() {
  try {
    const criteria = [
      { id: "attendance", name: "Event Attendance", max_score: 25 },
      { id: "participation", name: "Active Participation", max_score: 25 },
      { id: "contribution", name: "Financial Contributions", max_score: 25 },
      { id: "recruitment", "name": "New Member Recruitment", max_score: 25 }
    ];

    await query(
      `INSERT IGNORE INTO settings (setting_key, setting_value, setting_group) VALUES (?, ?, ?)`,
      ['evaluation_criteria', JSON.stringify(criteria), 'general']
    );

    console.log("Evaluation criteria seeded.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

seed();
