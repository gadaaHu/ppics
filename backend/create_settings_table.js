import { query } from './src/config/database.js';

async function initSettings() {
  try {
    // Create settings table
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_group VARCHAR(50) DEFAULT 'general',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Settings table created.");

    // Seed default settings
    const defaultSettings = [
      ['site_name', 'ICS PP Unity', 'general'],
      ['contact_email', 'info@icspp.gov.et', 'contact'],
      ['contact_phone', '+251 11 123 4567', 'contact'],
      ['address', 'Addis Ababa, Ethiopia', 'contact'],
      ['facebook_url', 'https://facebook.com/icspp', 'social'],
      ['twitter_url', 'https://twitter.com/icspp', 'social']
    ];

    for (const [key, value, group] of defaultSettings) {
      await query(
        `INSERT IGNORE INTO settings (setting_key, setting_value, setting_group) VALUES (?, ?, ?)`,
        [key, value, group]
      );
    }
    console.log("Settings seeded successfully.");
    
  } catch (error) {
    console.error("Error setting up settings table:", error);
  } finally {
    process.exit();
  }
}

initSettings();
