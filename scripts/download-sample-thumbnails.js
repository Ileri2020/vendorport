const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function downloadSampleThumbnails() {
  const products = await prisma.product.findMany({
    where: { thumbnailUrls: { isEmpty: false } },
    take: 3,
    select: { id: true, name: true, thumbnailUrls: true },
  });

  const tmpDir = path.resolve('tmp/downloaded_thumbnails');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  console.log('Downloading 3 sample product thumbnails to:', tmpDir, '\n');

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const url = p.thumbnailUrls[0];
    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());
    
    const safeName = p.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `thumb_${i + 1}_${safeName}.webp`;
    const filePath = path.join(tmpDir, filename);
    fs.writeFileSync(filePath, buffer);

    console.log(`Thumbnail ${i + 1}:`);
    console.log(`  Product Name: "${p.name}"`);
    console.log(`  URL: ${url}`);
    console.log(`  Saved to: ${filePath}`);
    console.log(`  HTTP Status: ${res.status}`);
    console.log(`  Content-Type: ${res.headers.get('content-type')}`);
    console.log(`  File Size: ${buffer.length} bytes\n`);
  }
}

downloadSampleThumbnails()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
