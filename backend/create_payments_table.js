import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const createPaymentsTable = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'icspp'
        });

        console.log('Connected to MySQL database.');

        const createTableSql = `
            CREATE TABLE IF NOT EXISTS member_payments (
                payment_id INT PRIMARY KEY AUTO_INCREMENT,
                member_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                payment_month VARCHAR(20) NOT NULL,
                payment_year INT NOT NULL,
                status ENUM('Pending', 'Approved') DEFAULT 'Pending',
                approved_by INT,
                receipt_number VARCHAR(50) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
                FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.query(createTableSql);
        console.log('member_payments table created successfully.');
        
        await connection.end();
    } catch (error) {
        console.error('Error creating member_payments table:', error);
    }
};

createPaymentsTable();
