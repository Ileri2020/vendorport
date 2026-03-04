
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();
const businessId = "69a586cba749e310825bb354"; // itech3

async function main() {
  console.log('Fetching products with external images...');
  const products = await prisma.product.findMany({
    where: {
      businessId
    }
  });

  const toProcess = products.filter(p => p.images.some(img => img.includes('jumia')));
  console.log(`Found ${toProcess.length} products to update images.`);

  for (const p of toProcess) {
    const externalUrl = p.images[0];
    if (!externalUrl) continue;

    console.log(`Uploading image for: ${p.name}`);
    try {
      const uploadRes = await cloudinary.uploader.upload(externalUrl, {
        folder: `itech3/products/${p.categoryId}`,
        public_id: p.id,
        overwrite: true,
        resource_type: "auto"
      });

      const cloudinaryUrl = uploadRes.secure_url;

      await prisma.product.update({
        where: { id: p.id },
        data: {
          images: [cloudinaryUrl]
        }
      });
      console.log(`  Success! Image updated to: ${cloudinaryUrl}`);
    } catch (err) {
      console.error(`  Failed for ${p.name}:`, err.message);
    }
    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await prisma.$disconnect();
  console.log('Finished uploading all images to Cloudinary!');
}

main();
