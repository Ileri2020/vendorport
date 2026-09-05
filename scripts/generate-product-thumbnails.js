require('dotenv/config');

const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');
const sharp = require('sharp');

const prisma = new PrismaClient();
const THUMBNAIL_MAX_BYTES = 20 * 1024;
const CONCURRENCY = 3;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadBuffer(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: 'product-thumbnails',
        public_id: publicId,
        resource_type: 'image',
        format: 'webp',
        overwrite: true,
        invalidate: true,
      },
      (error, result) => error ? reject(error) : resolve(result),
    );
    upload.end(buffer);
  });
}

async function createThumbnail(inputBuffer) {
  const attempts = [
    { width: 480, quality: 62 },
    { width: 360, quality: 52 },
    { width: 280, quality: 42 },
    { width: 220, quality: 34 },
    { width: 160, quality: 26 },
  ];

  for (const attempt of attempts) {
    const output = await sharp(inputBuffer)
      .rotate()
      .resize({ width: attempt.width, height: attempt.width, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: attempt.quality, effort: 4 })
      .toBuffer();

    if (output.length < THUMBNAIL_MAX_BYTES) return output;
  }

  throw new Error('Could not compress thumbnail below 20 KB');
}

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image download failed with ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function processProduct(product) {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const current = Array.isArray(product.thumbnailUrls) ? product.thumbnailUrls : [];

  if (images.length === 0 || current.length >= images.length) {
    return { status: 'skipped', product };
  }

  const thumbnailUrls = [];
  for (let index = 0; index < images.length; index += 1) {
    const existing = current[index];
    if (existing) {
      thumbnailUrls.push(existing);
      continue;
    }

    const source = await downloadImage(images[index]);
    const thumbnail = await createThumbnail(source);
    const uploaded = await uploadBuffer(thumbnail, `${product.id}-${index}`);
    thumbnailUrls.push(uploaded.secure_url || uploaded.url);
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { thumbnailUrls },
  });

  return { status: 'updated', product, thumbnailBytes: thumbnailUrls.length };
}

async function run() {
  const products = await prisma.product.findMany({
    where: { images: { isEmpty: false } },
    select: { id: true, name: true, images: true, thumbnailUrls: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${products.length} products with images.`);
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let index = 0; index < products.length; index += CONCURRENCY) {
    const batch = products.slice(index, index + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(processProduct));

    results.forEach((result, batchIndex) => {
      const product = batch[batchIndex];
      if (result.status === 'fulfilled' && result.value.status === 'updated') {
        updated += 1;
        console.log(`[${index + batchIndex + 1}/${products.length}] Updated ${product.name}`);
      } else if (result.status === 'fulfilled') {
        skipped += 1;
      } else {
        failed += 1;
        console.error(`[${index + batchIndex + 1}/${products.length}] Failed ${product.name}: ${result.reason?.message || result.reason}`);
      }
    });
  }

  console.log(`Finished. Updated: ${updated}, skipped: ${skipped}, failed: ${failed}.`);
  if (failed > 0) process.exitCode = 1;
}

run()
  .catch((error) => {
    console.error('Thumbnail backfill failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
