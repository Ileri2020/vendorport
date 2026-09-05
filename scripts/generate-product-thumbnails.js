require('dotenv/config');

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaClient: PricepallyClient } = require('../generated/pricepally');
const { PrismaClient: Market2HomeClient } = require('../generated/market2home');
const { v2: cloudinary } = require('cloudinary');
const sharp = require('sharp');

ensureSourceDatabaseUrls();
const prisma = new PrismaClient();
const pricepally = new PricepallyClient();
const market2home = new Market2HomeClient();
const THUMBNAIL_MAX_BYTES = 20 * 1024;
const CONCURRENCY = 3;
const SOURCE_LOOKUP_TIMEOUT_MS = 10000;
const IMAGE_REQUEST_TIMEOUT_MS = 15000;
const requestedLimit = Number(process.argv.find((value) => value.startsWith('--limit='))?.split('=')[1] || 0);
const migrateExisting = process.argv.includes('--migrate-existing');
const targetCloudName = (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '').trim();
const publicTargetCloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '').trim();

if (!targetCloudName) throw new Error('A destination Cloudinary cloud name is required.');
if (publicTargetCloudName && publicTargetCloudName !== targetCloudName) {
  throw new Error(`Cloudinary cloud mismatch: CLOUDINARY_CLOUD_NAME=${targetCloudName}, NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${publicTargetCloudName}`);
}

cloudinary.config({
  cloud_name: targetCloudName,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isTargetCloudinaryUrl(value) {
  try {
    const url = new URL(value);
    return url.hostname === 'res.cloudinary.com' && url.pathname.includes(`/${targetCloudName}/`);
  } catch {
    return false;
  }
}

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

function ensureSourceDatabaseUrls() {
  const hostList = [
    'succomongo-shard-00-00.b5r4o.mongodb.net:27017',
    'succomongo-shard-00-01.b5r4o.mongodb.net:27017',
    'succomongo-shard-00-02.b5r4o.mongodb.net:27017',
  ].join(',');
  const directUrl = `mongodb://adepojuololade2020:j0k2iy9xXcraCpHn@${hostList}/scraped?authSource=admin&retryWrites=true&w=majority&tls=true`;
  if (!process.env.PRICEPALLY_MONGODB_URL) process.env.PRICEPALLY_MONGODB_URL = directUrl;
  if (!process.env.MARKET2HOME_MONGODB_URL) process.env.MARKET2HOME_MONGODB_URL = directUrl;
}

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function nameKeys(value) {
  const normalized = normalizeName(value);
  const tokens = normalized.split(/\s+/).filter(Boolean).sort();
  const significantTokens = normalized.split(/\s+/).filter((token) => token.length >= 4);
  return [...new Set([normalized, tokens.join(' '), ...significantTokens].filter(Boolean))];
}

function imageUrls(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((image) => {
    if (typeof image === 'string') return image;
    return image?.url || image?.secure_url || image?.src || image?.thumbnail || '';
  }).filter(Boolean))];
}

function sourceProductImages(product) {
  const raw = product.rawProduct && typeof product.rawProduct === 'object' ? product.rawProduct : {};
  return imageUrls([
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(raw.images) ? raw.images : []),
    raw.thumbnail,
    raw.image,
  ]);
}

function addSourceProduct(sourceMap, product) {
  const title = product.title || product.name;
  const raw = product.rawProduct && typeof product.rawProduct === 'object' ? product.rawProduct : product;
  const images = imageUrls([
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(raw.images) ? raw.images : []),
    product.thumbnail,
    raw.thumbnail,
    raw.image,
  ]);
  if (!images.length) return;
  const keys = nameKeys(title);
  const tokens = normalizeName(title).split(/\s+/).filter((token) => token.length >= 4);
  for (const key of [...keys, ...tokens]) {
    sourceMap.set(key, [...new Set([...(sourceMap.get(key) || []), ...images])]);
  }
}

function loadLocalSourceImageMap() {
  const snapshotPath = path.resolve('tmp/platform-catalog/scraped-catalog.json');
  try {
    const sources = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    const sourceMap = new Map();
    for (const source of Array.isArray(sources) ? sources : []) {
      for (const product of Array.isArray(source.products) ? source.products : []) {
        addSourceProduct(sourceMap, product);
      }
    }
    return sourceMap;
  } catch (error) {
    console.warn(`Local scraped catalog unavailable: ${error.message}`);
    return new Map();
  }
}

async function loadSourceImageMap(names = []) {
  ensureSourceDatabaseUrls();
  const productNames = [...new Set(names)].filter(Boolean);
  if (productNames.length === 0) return new Map();
  const sourceLookup = Promise.all([
    pricepally.pricepallyProduct.findMany({ where: { title: { in: productNames } }, select: { title: true, images: true, rawProduct: true } }),
    market2home.market2homeProduct.findMany({ where: { title: { in: productNames } }, select: { title: true, images: true, rawProduct: true } }),
  ]);
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Scraped source lookup timed out')), SOURCE_LOOKUP_TIMEOUT_MS));
  let pricepallyProducts;
  let market2homeProducts;
  try {
    [pricepallyProducts, market2homeProducts] = await Promise.race([sourceLookup, timeout]);
  } catch (error) {
    console.warn(`Scraped source fallbacks unavailable: ${error.message}`);
    return new Map();
  }
  const sourceMap = new Map();
  for (const product of [...pricepallyProducts, ...market2homeProducts]) {
    addSourceProduct(sourceMap, product);
  }
  return sourceMap;
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
  const response = await fetch(url, {
    signal: AbortSignal.timeout(IMAGE_REQUEST_TIMEOUT_MS),
    headers: { 'User-Agent': 'VendorPort-thumbnail-recovery/1.0' },
  });
  if (!response.ok) throw new Error(`Image download failed with ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function createThumbnailFromCandidates(candidates) {
  let lastError;
  for (const candidate of [...new Set(candidates.filter(Boolean))]) {
    try {
      const source = await downloadImage(candidate);
      return await createThumbnail(source);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('No usable image source found');
}

async function processProduct(product, sourceImageMap) {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const current = Array.isArray(product.thumbnailUrls) ? product.thumbnailUrls : [];
  const sourceImages = nameKeys(product.name)
    .flatMap((key) => sourceImageMap.get(key) || [])
    .filter((url, index, urls) => urls.indexOf(url) === index)
    .slice(0, 12);

  const hasCompleteTargetThumbnails = current.length >= images.length && current.slice(0, images.length).every(isTargetCloudinaryUrl);
  if (images.length === 0 || hasCompleteTargetThumbnails) {
    return { status: 'skipped', product };
  }

  const thumbnailUrls = [];
  for (let index = 0; index < images.length; index += 1) {
    const existing = !migrateExisting && isTargetCloudinaryUrl(current[index]) ? current[index] : null;
    if (existing) {
      thumbnailUrls.push(existing);
      continue;
    }

    const candidates = [images[index], current[index], sourceImages[index], ...sourceImages];
    if (sourceImages.length > 0) console.warn(`Trying scraped source image for ${product.name}`);
    const thumbnail = await createThumbnailFromCandidates(candidates);
    const uploaded = await uploadBuffer(thumbnail, `${product.id}-${index}`);
    const uploadedUrl = uploaded.secure_url || uploaded.url;
    if (!isTargetCloudinaryUrl(uploadedUrl)) {
      throw new Error(`Thumbnail upload returned a non-target Cloudinary URL: ${uploadedUrl}`);
    }
    thumbnailUrls.push(uploadedUrl);
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

  const needsThumbnailMigration = (product) => {
    const thumbnails = Array.isArray(product.thumbnailUrls) ? product.thumbnailUrls : [];
    return thumbnails.length < product.images.length || thumbnails.slice(0, product.images.length).some((url) => !isTargetCloudinaryUrl(url));
  };
  const processableProducts = requestedLimit > 0
    ? products.filter(needsThumbnailMigration).slice(0, requestedLimit)
    : products.filter(needsThumbnailMigration);

  const localSourceImageMap = processableProducts.length > 0 ? loadLocalSourceImageMap() : new Map();
  const remoteSourceImageMap = processableProducts.length > 0
    ? await loadSourceImageMap(processableProducts.map((product) => product.name))
    : new Map();
  const sourceImageMap = new Map(localSourceImageMap);
  for (const [key, urls] of remoteSourceImageMap) {
    sourceImageMap.set(key, [...new Set([...(sourceImageMap.get(key) || []), ...urls])]);
  }
  console.log(`Loaded ${localSourceImageMap.size} local and ${remoteSourceImageMap.size} remote scraped image fallbacks.`);

  console.log(`Destination Cloudinary cloud: ${targetCloudName}`);
  console.log(`Found ${products.length} products with images. Processing ${processableProducts.length}${migrateExisting ? ' for migration' : ''}.`);
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let index = 0; index < processableProducts.length; index += CONCURRENCY) {
    const batch = processableProducts.slice(index, index + CONCURRENCY);
    const results = await Promise.allSettled(batch.map((product) => processProduct(product, sourceImageMap)));

    results.forEach((result, batchIndex) => {
      const product = batch[batchIndex];
      if (result.status === 'fulfilled' && result.value.status === 'updated') {
        updated += 1;
        console.log(`[${index + batchIndex + 1}/${processableProducts.length}] Updated ${product.name}`);
      } else if (result.status === 'fulfilled') {
        skipped += 1;
      } else {
        failed += 1;
        console.error(`[${index + batchIndex + 1}/${processableProducts.length}] Failed ${product.name}: ${result.reason?.message || result.reason}`);
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
    const disconnect = (client) => Promise.race([
      client.$disconnect(),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
    await Promise.all([
      disconnect(prisma),
      disconnect(pricepally),
      disconnect(market2home),
    ]);
  })
  .then(() => {
    process.exit(process.exitCode || 0);
  });
