import { testConnection, query } from './src/config/database.js';

async function test() {
  console.log('🔄 Testing database connection...');
  
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Failed to connect to database');
    process.exit(1);
  }

  try {
    const tables = await query('SHOW TABLES');
    console.log('📊 Tables in database:', tables);
    console.log('✅ Database test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  process.exit(0);
}

test();