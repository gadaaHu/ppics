import jwt from 'jsonwebtoken';

const secret = 'your-super-secret-key-change-this'; // From .env
const token = jwt.sign({ userId: 1, role: 'admin' }, secret, { expiresIn: '1h' });

async function test() {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  let body = '';
  
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="news_title"\r\n\r\n`;
  body += `Test News\r\n`;
  
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="news_des"\r\n\r\n`;
  body += `Test Description\r\n`;
  
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="newsdate"\r\n\r\n`;
  body += `2026-08-22\r\n`;
  
  body += `--${boundary}--\r\n`;

  try {
    const res = await fetch('http://localhost:5001/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': `Bearer ${token}`
      },
      body: body
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
