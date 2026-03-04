
const https = require('https');

const url = 'https://www.konga.com/category/accessories-computing-5227';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
};

https.get(url, { headers }, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Got data length:', data.length);
    if (data.includes('__NEXT_DATA__')) {
      console.log('Found __NEXT_DATA__');
    } else {
      console.log('Did NOT find __NEXT_DATA__');
      // console.log(data.slice(0, 1000));
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
