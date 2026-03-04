
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();
const businessId = "69a586cba749e310825bb354";

async function main() {
  const categories = await prisma.category.findMany({
    where: { businessId }
  });
  console.log('Categories for itech3:');
  categories.forEach(c => console.log(`${c.name}: ${c.id}`));

  const productCount = await prisma.product.count({
    where: { businessId }
  });
  console.log('\nTotal products for itech3:', productCount);

  const sampleProducts = await prisma.product.findMany({
    where: { businessId },
    take: 10
  });
  console.log('\nSample products:', sampleProducts.map(p => ({ 
    name: p.name, 
    images: p.images.length > 0 ? p.images[0].substring(0, 50) + '...' : 'NONE' 
  })));

  await prisma.$disconnect();
}

main();
