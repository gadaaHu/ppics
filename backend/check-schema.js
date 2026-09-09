import { query } from './src/config/database.js';

async function test() {
  try {
    const newsSchema = await query('DESCRIBE news');
    console.log('News schema:', newsSchema);
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}
test();
