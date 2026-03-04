
const https = require('https');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const businessId = "69a586cba749e310825bb354"; // itech3

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
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

function parseDetails(html) {
  const brandMatch = html.match(/div class="-pvxs">Brand:\s*<a[^>]*>([^<]+)<\/a>/i);
  const brand = brandMatch ? brandMatch[1].trim() : null;

  // Description / Product Details
  const descMatch = html.match(/<div class="markup -pvl">([\s\S]*?)<\/div>/i);
  const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, ' ').trim() : "";

  // Key Features / Specifications
  const specMatch = html.match(/<div class="markup -pts">([\s\S]*?)<\/div>/i);
  const specifications = specMatch ? specMatch[1].replace(/<[^>]+>/g, ' ').trim() : "";

  return { brand, description: description + "\n\nSpecifications:\n" + specifications };
}

async function main() {
  console.log('Fetching products to update details...');
  const products = await prisma.product.findMany({
    where: { 
      businessId, 
      description: { startsWith: 'Scraped from Jumia:' } // Filter those already scraped from catalog
    },
    take: 50 // process in batches
  });

  console.log(`Found ${products.length} products to deep scrape.`);

  for (const p of products) {
    const detailUrlMatch = p.description.match(/https:\/\/www\.jumia\.com\.ng\/[^\s]+/);
    if (!detailUrlMatch) continue;
    const url = detailUrlMatch[0];

    console.log(`Deep scraping: ${p.name} at ${url}...`);
    try {
      const html = await fetchPage(url);
      const details = parseDetails(html);

      await prisma.product.update({
        where: { id: p.id },
        data: {
          brand: details.brand || p.brand,
          description: details.description.trim()
        }
      });
      console.log(`Updated details for: ${p.name}`);
      
      // Small cooldown to avoid getting blocked
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Error deep scraping ${p.name}:`, err.message);
    }
  }

  await prisma.$disconnect();
  console.log('Finished deep scraping session!');
}

main();
