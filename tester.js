const https = require('https');
const fs = require('fs');

const url = 'https://tailwindcss.com/plus/ui-blocks/ecommerce/components/incentives';

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('scrape_result.html', data);
    console.log('Saved to scrape_result.html');
  });
}).on('error', (err) => {
  console.error('Error: ' + err.message);
});
