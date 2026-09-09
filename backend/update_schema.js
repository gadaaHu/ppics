import { query } from './src/config/database.js';

async function updateSchema() {
    try {
        console.log("Updating users table role enum...");
        await query("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'leader', 'family_leader') NOT NULL");
        console.log("Role enum updated.");

        console.log("Adding family_id to users...");
        await query("ALTER TABLE users ADD COLUMN family_id INT NULL");
        console.log("family_id added.");

        // Optionally, add a foreign key if families table exists
        try {
            await query("ALTER TABLE users ADD CONSTRAINT fk_user_family FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE SET NULL");
            console.log("Foreign key added.");
        } catch (e) {
            console.log("Could not add foreign key (maybe already exists or families table differs):", e.message);
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

updateSchema();
