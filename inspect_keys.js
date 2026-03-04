
const https = require('https');
const fs = require('fs');

const url = 'https://www.konga.com/category/accessories-computing-5227';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
};

https.get(url, { headers }, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const match = data.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (match) {
      try {
        const json = JSON.parse(match[1]);
        if (json.props && json.props.initialState) {
            console.log('Keys in initialState:', Object.keys(json.props.initialState));
            // Check 'search' or 'product'
            if (json.props.initialState.search) {
                console.log('Keys in search:', Object.keys(json.props.initialState.search));
                if (json.props.initialState.search.results) {
                    console.log('Found search results! Length:', json.props.initialState.search.results.length);
                    // fs.writeFileSync('konga_sample.json', JSON.stringify(json.props.initialState.search.results[0], null, 2));
                }
            }
        }
        if (json.props && json.props.initialProps) {
            console.log('Keys in initialProps:', Object.keys(json.props.initialProps));
            if (json.props.initialProps.pageProps) {
                console.log('Keys in initialProps.pageProps:', Object.keys(json.props.initialProps.pageProps));
                if (json.props.initialProps.pageProps.data) {
                    console.log('Keys in data:', Object.keys(json.props.initialProps.pageProps.data));
                }
            }
        }
      } catch (e) {
        console.error('JSON Error:', e.message);
      }
    } else {
      console.log('NO NEXT DATA FOUND');
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
