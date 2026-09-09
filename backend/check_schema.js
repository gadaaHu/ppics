import { query } from './src/config/database.js';

async function checkSchema() {
    try {
        const columns = await query("SHOW COLUMNS FROM users");
        console.log("Users table columns:");
        console.table(columns);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

checkSchema();
