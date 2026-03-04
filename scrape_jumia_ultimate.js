
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
  { name: "Phones and Tablets", url: "https://www.jumia.com.ng/phones-tablets/", id: "69a7eef8e542f549b33d5194" },
  { name: "Mobile Accessories", url: "https://www.jumia.com.ng/mobile-accessories/", id: "69a8030abce68ad73ba6c300" },
  { name: "Health & Beauty", url: "https://www.jumia.com.ng/health-beauty/", id: "69a8030bbce68ad73ba6c301" },
  { name: "Groceries", url: "https://www.jumia.com.ng/groceries/", id: "69a8030cbce68ad73ba6c302" },
  { name: "Video Games", url: "https://www.jumia.com.ng/video-games/", id: "69a8030cbce68ad73ba6c303" },
  { name: "Home & Office", url: "https://www.jumia.com.ng/home-office/", id: "69a8030dbce68ad73ba6c304" }
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
      
      products.push({ name, price, url, image: img });
    }
  }
  return products;
}

function parseDetails(html) {
  const brandMatch = html.match(/div class="-pvxs">Brand:\s*<a[^>]*>([^<]+)<\/a>/i);
  const brand = brandMatch ? brandMatch[1].trim() : null;

  const descMatch = html.match(/<div class="markup -pvl">([\s\S]*?)<\/div>/i);
  const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, ' ').trim() : "";

  const specMatch = html.match(/<div class="markup -pts">([\s\S]*?)<\/div>/i);
  const specifications = specMatch ? specMatch[1].replace(/<[^>]+>/g, ' ').trim() : "";

  let uses = "";
  const usesMatch = description.match(/(?:How to use|Directions|Usage|Uses):?\s*([\s\S]+?)(?:\n\n|$)/i);
  if (usesMatch) uses = usesMatch[1].trim();

  return { brand, description, specifications, uses };
}

async function scrapeCategory(cat, maxPages = 2) {
  console.log(`\n### Scraping category: ${cat.name} ###`);
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? cat.url : `${cat.url}?page=${page}`;
    console.log(`  Page ${page}: ${url}...`);
    try {
      const html = await fetchPage(url);
      const products = parseCatalog(html);
      console.log(`    Found ${products.length} products on catalog.`);
      
      for (const p of products) {
        try {
          const existing = await prisma.product.findFirst({
            where: { name: p.name, businessId: businessId }
          });
          
          if (existing && !existing.description.startsWith('Scraped from Jumia')) {
            continue;
          }

          console.log(`    Deep scraping: ${p.name}...`);
          const detailHtml = await fetchPage(p.url);
          const details = parseDetails(detailHtml);
          
          const fullDesc = `${details.description}\n\nKey Features:\n${details.specifications}${details.uses ? '\n\nUsage:\n' + details.uses : ''}`;

          if (existing) {
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                brand: details.brand || p.name.split(' ')[0],
                description: fullDesc.trim()
              }
            });
            console.log(`      Updated details.`);
          } else {
            await prisma.product.create({
              data: {
                name: p.name,
                price: p.price,
                description: fullDesc.trim(),
                categoryId: cat.id,
                businessId: businessId,
                brand: details.brand || p.name.split(' ')[0],
                images: [p.image]
              }
            });
            console.log(`      Saved new product.`);
          }
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (err) {
          console.error(`      Error with ${p.name}:`, err.message);
        }
      }
      console.log(`  Done with Page ${page}`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (err) {
      console.error(`    Error with ${cat.name} page ${page}:`, err.message);
    }
  }
}

async function main() {
  for (const cat of categories) {
    await scrapeCategory(cat, 2); // 2 pages per category to cover ground
  }
  await prisma.$disconnect();
  console.log('\n!!! FINISHED ALL SCRAPING !!!');
}

main();
