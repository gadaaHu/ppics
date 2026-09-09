import fs from 'fs';

const file = 'C:\\inetpub\\wwwroot\\icspp\\icspp.sql';
let sql = fs.readFileSync(file, 'utf8');

sql = sql.replace(/DEFAULT curdate\(\)/g, 'DEFAULT (CURRENT_DATE)');

fs.writeFileSync(file, sql, 'utf8');
console.log('Fixed curdate() in SQL file');
