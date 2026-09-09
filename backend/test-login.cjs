const https = require('https');

const data = JSON.stringify({
  username: 'admin',
  password: '1234'
});

const options = {
  hostname: 'ppics.mecrvs.gov.et',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  rejectUnauthorized: false // Bypass SSL cert error for testing
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
