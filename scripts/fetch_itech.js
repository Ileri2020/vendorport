const https = require('http');
const fs = require('fs');

const url = 'http://localhost:3000/itech';

https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  const file = fs.createWriteStream('VendorPort/temp_itech_response.html');
  res.pipe(file);
  file.on('finish', () => file.close(() => console.log('Saved response to VendorPort/temp_itech_response.html')));
}).on('error', (e) => {
  console.error('Error fetching:', e.message);
});
