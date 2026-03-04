
const https = require('https');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const businessId = "69a586cba749e310825bb354"; // itech3

const categories = [
  { name: "Electronics", url: "https://www.jumia.com.ng/electronics/", id: "69a7eef5e542f549b33d518f" },
  { name: "Appliances", url: "https://www.jumia.com.ng/mlp-appliances/", id: "69a7eef6e542f549b33d5190" },
  { name: "Computing", url: "https://www.jumia.com.ng/computing/", id: "69a7eef6e542f549b33d5191" },
  { name: "Drugs", url: "https://www.jumia.com.ng/health-care/", id: "69a7eef7e542f549b33d5192" },
  { name: "Skincare", url: "https://www.jumia.com.ng/mlp-skin-care-cream/", id: "69a7eef7e542f549b33d5193" },
  { name: "Phones and Tablets", url: "https://www.jumia.com.ng/phones-tablets/", id: "69a7eef8e542f549b33d5194" }
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
};

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
      res.on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  });
}

function parseCatalog(html) {
  const products = [];
  const prdRegex = /<article class="prd[^"]*">([\s\S]*?)<\/article>/g;
  let match;
  while ((match = prdRegex.exec(html)) !== null) {
    const content = match[1];
    
    const nameMatch = content.match(/<div class="name">([^<]+)<\/div>/);
    const priceMatch = content.match(/<div class="prc"[^>]*>([^<]+)<\/div>/);
    const urlMatch = content.match(/href="([^"]+)"/);
    const imgMatch = content.match(/data-src="([^"]+)"/) || content.match(/src="([^"]+)"/);
    
    if (nameMatch && priceMatch && urlMatch) {
      const name = nameMatch[1].trim();
      const priceStr = priceMatch[1].replace(/[^0-9.]/g, '');
      const price = parseFloat(priceStr) || 0;
      let url = urlMatch[1];
      if (!url.startsWith('http')) url = 'https://www.jumia.com.ng' + url;
      const img = imgMatch ? imgMatch[1] : '';
      
      products.push({
        name,
        price,
        url,
        image: img,
        brand: name.split(' ')[0]
      });
    }
  }
  return products;
}

async function scrapeCategory(cat, maxPages = 3) {
  console.log(`Scraping category: ${cat.name}...`);
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? cat.url : `${cat.url}?page=${page}`;
    console.log(`  Page ${page}: ${url}`);
    try {
      const html = await fetchPage(url);
      const products = parseCatalog(html);
      console.log(`    Found ${products.length} products on page ${page}`);
      
      for (const p of products) {
        try {
          // Check if exists
          const existing = await prisma.product.findFirst({
            where: { name: p.name, businessId: businessId }
          });
          if (existing) continue;

          await prisma.product.create({
            data: {
              name: p.name,
              price: p.price,
              description: `Scraped from Jumia: ${p.url}`,
              categoryId: cat.id,
              businessId: businessId,
              brand: p.brand,
              images: [p.image]
            }
          });
        } catch (err) {
          console.error(`    Error saving ${p.name}:`, err.message);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Delay between pages
    } catch (err) {
      console.error(`    Error scraping ${cat.name} page ${page}:`, err.message);
    }
  }
}

async function main() {
  for (const cat of categories) {
    await scrapeCategory(cat, 3);
  }
  await prisma.$disconnect();
  console.log('Finished scraping catalogs!');
}

main();
