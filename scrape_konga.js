
require('dotenv').config({ path: '.env.local' });
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();
const businessId = "69a586cba749e310825bb354";

const categories = [
  { name: "Computers and Accessories", url: "https://www.konga.com/category/accessories-computing-5227", id: "69a8174ec9b71d38a7d75bfd" },
  { name: "Phones and Tablets", url: "https://www.konga.com/category/phones-tablets-5143", id: "69a7eef8e542f549b33d5194" },
  { name: "Electronics", url: "https://www.konga.com/category/electronics-5261", id: "69a7eef5e542f549b33d518f" },
  { name: "Home and Kitchen", url: "https://www.konga.com/category/home-kitchen-602", id: "69a8174fc9b71d38a7d75bfe" },
  { name: "Beauty, Health & Personal Care", url: "https://www.konga.com/category/beauty-health-personal-care-5991", id: "69a8174fc9b71d38a7d75bff" },
  { name: "Drinks & Groceries", url: "https://www.konga.com/category/groceries-5892", id: "69a81750c9b71d38a7d75c00" },
  { name: "Generators & Power Solutions", url: "https://www.konga.com/category/generators-power-solutions-5287", id: "69a81750c9b71d38a7d75c01" }
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
};

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
      res.on('error', (err) => reject(err));
    });
    req.on('error', (err) => reject(err));
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request Timeout'));
    });
  });
}

function extractNextData(html) {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error('Failed to parse NEXT_DATA JSON');
    }
  }
  return null;
}

async function uploadToCloudinary(url, productId, categoryId) {
  try {
    const res = await cloudinary.uploader.upload(url, {
      folder: `itech3/konga/${categoryId}`,
      public_id: productId,
      overwrite: true
    });
    return res.secure_url;
  } catch (err) {
    console.error('Cloudinary upload error:', err.message);
    return null;
  }
}

async function scrapeKongaCategory(cat) {
  console.log(`\n--- Scraping Konga: ${cat.name} ---`);
  try {
    const html = await fetchPage(cat.url);
    const nextData = extractNextData(html);
    if (!nextData) {
      console.log('No NEXT_DATA found for', cat.name);
      return;
    }

    // Fixed path based on inspection
    const products = nextData.props?.initialState?.search?.results || [];
    
    console.log(`Found ${products.length} products in JSON.`);

    for (const p of products) {
      try {
        const name = p.name;
        const price = p.special_price || p.price;
        const imagePath = p.image_full || p.image_thumbnail || null;
        const brand = p.brand || name.split(' ')[0];
        const description = (p.description || p.short_description || `Scraped from Konga: ${p.url_key}`).replace(/<[^>]+>/g, ' ').trim();
        
        const existing = await prisma.product.findFirst({
          where: { name, businessId }
        });
        if (existing) {
          console.log(`  Skipping existing: ${name}`);
          continue;
        }

        console.log(`  Processing: ${name}`);
        
        let cloudinaryUrl = null;
        if (imagePath) {
          const fullImgUrl = imagePath.startsWith('http') ? imagePath : `https://www-konga-com-res.cloudinary.com/w_auto,f_auto,fl_lossy,dpr_auto,q_auto/media/catalog/product${imagePath}`;
          cloudinaryUrl = await uploadToCloudinary(fullImgUrl, `konga_${p.sku}`, cat.id);
        }

        await prisma.product.create({
          data: {
            name,
            price: parseFloat(price) || 0,
            description,
            brand,
            categoryId: cat.id,
            businessId: businessId,
            images: cloudinaryUrl ? [cloudinaryUrl] : []
          }
        });
        console.log(`    Saved!`);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`    Error processing ${p.name}:`, err.message);
      }
    }
  } catch (err) {
    console.error(`Error scraping ${cat.name}:`, err.message);
  }
}

async function main() {
  for (const cat of categories) {
    await scrapeKongaCategory(cat);
  }
  await prisma.$disconnect();
  console.log('\n!!! FINISHED KONGA SCRAPING !!!');
}

main();
