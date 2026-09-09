import bcrypt from 'bcryptjs';
import pool, { query } from '../src/config/database.js';

const seedUsers = async () => {
  try {
    const users = [
      {
        user_id: 1,
        username: 'admin',
        password: await bcrypt.hash('IcsPP@admin1', 10),
        role: 'admin',
        cooperative_id: null
      },
      {
        user_id: 2,
        username: 'leader1',
        password: await bcrypt.hash('ICSL@001', 10),
        role: 'leader',
        cooperative_id: 1
      },
      {
        user_id: 3,
        username: 'leader2',
        password: await bcrypt.hash('ICSL@002', 10),
        role: 'leader',
        cooperative_id: 2
      }
    ];

    console.log('Seeding users...');

    for (const user of users) {
      await query(
        `INSERT INTO users (user_id, username, password, role, cooperative_id) 
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
            password = VALUES(password),
            role = VALUES(role),
            cooperative_id = VALUES(cooperative_id)`,
        [user.user_id, user.username, user.password, user.role, user.cooperative_id]
      );
      console.log(`✅ User ${user.username} seeded.`);
    }
    
    console.log('✅ All users seeded successfully.');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await pool.end();
  }
};

seedUsers();