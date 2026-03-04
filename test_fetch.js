
const https = require('https');
const fs = require('fs');

const url = 'https://www.jumia.com.ng/electronics/';
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync('temp_page.html', data);
    console.log('Status Code:', res.statusCode);
    console.log('Written to temp_page.html');
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
