const http = require('http');

const runTests = async () => {
  console.log('--- API Health Check ---');

  // 1. Login to get token
  const token = await new Promise((resolve, reject) => {
    const data = JSON.stringify({ username: 'admin', password: '1234' });
    const options = {
      hostname: 'ppics.mecrvs.gov.et',
      port: 80,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.success && json.token) {
            console.log('✅ Login successful');
            resolve(json.token);
          } else {
            reject('Login failed: ' + body);
          }
        } catch (e) {
          reject('Parse error: ' + e.message);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });

  // 2. Test endpoints
  const endpoints = [
    '/api/users',
    '/api/members',
    '/api/cooperatives',
    '/api/districts',
    '/api/families',
    '/api/events'
  ];

  for (const endpoint of endpoints) {
    await new Promise((resolve, reject) => {
      const options = {
        hostname: 'ppics.mecrvs.gov.et',
        port: 80,
        path: endpoint,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ [${res.statusCode}] GET ${endpoint} - Success (${body.length} bytes)`);
          } else {
            console.log(`❌ [${res.statusCode}] GET ${endpoint} - Failed`);
            console.log(body);
          }
          resolve();
        });
      });
      req.on('error', (err) => {
        console.log(`❌ GET ${endpoint} - Error: ${err.message}`);
        resolve();
      });
      req.end();
    });
  }
};

runTests().catch(console.error);
