
const https = require('https');
const url = 'https://www.konga.com/category/accessories-computing-5227';
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' };

https.get(url, { headers }, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const match = data.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (match) {
      const json = JSON.parse(match[1]);
      console.log('Search Results:', json.props?.initialState?.search?.results?.length);
      if (json.props?.initialState?.search?.results) {
        console.log('First Product Name:', json.props.initialState.search.results[0].name);
      }
    } else {
      console.log('NO DATA');
    }
  });
});
