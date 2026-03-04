
const https = require('https');
const fs = require('fs');

const url = 'https://www.konga.com/category/accessories-computing-5227';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
};

const req = https.get(url, { headers }, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const match = data.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (match) {
      try {
        const json = JSON.parse(match[1]);
        const result = {
          keys: Object.keys(json),
          propsKeys: json.props ? Object.keys(json.props) : null,
          initialStateKeys: (json.props && json.props.initialState) ? Object.keys(json.props.initialState) : null,
          searchKeys: (json.props && json.props.initialState && json.props.initialState.search) ? Object.keys(json.props.initialState.search) : null,
        };
        fs.writeFileSync('konga_keys.json', JSON.stringify(result, null, 2));
        console.log('Konga keys saved to konga_keys.json');
      } catch (e) {
        console.error('JSON Error:', e.message);
      }
    } else {
      console.log('NO NEXT DATA FOUND');
    }
  });
});

req.on('error', (err) => {
  console.error('Request Error:', err.message);
});

req.setTimeout(30000, () => {
  console.error('Request timed out');
  req.destroy();
});
