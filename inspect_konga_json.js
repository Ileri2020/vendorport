
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
        // Recursively look for "products" key or array with many objects
        function findProducts(obj, depth = 0) {
          if (depth > 10 || !obj) return null;
          if (Array.isArray(obj) && obj.length > 5 && obj[0].sku) return obj;
          if (typeof obj === 'object') {
            for (let key in obj) {
              const res = findProducts(obj[key], depth + 1);
              if (res) return res;
            }
          }
          return null;
        }
        
        const products = findProducts(json);
        if (products) {
          console.log('SUCCESS: Found products array with length:', products.length);
          console.log('Sample product:', JSON.stringify(products[0], null, 2));
          fs.writeFileSync('konga_structure.json', JSON.stringify(products[0], null, 2));
        } else {
          console.log('FAILED: Could not find products array in JSON structure.');
          fs.writeFileSync('konga_full_data.json', JSON.stringify(json, null, 2));
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
