#!/usr/bin/env node

require('dotenv/config');

const { PrismaClient } = require('../generated/pricepally');

const prisma = new PrismaClient();

const SOURCE_URL = 'https://www.pricepally.com';
const SEARCH_URL = 'https://meilisearch.pricepally.com/indexes/products/search';
const SEARCH_API_KEY = '202d7405c6f6b776bc898a496b12badba4ce86d3a5c5af9b6d2fb37711992ade';
const DEFAULT_PAGE_SIZE = 500;
const REQUEST_DELAY_MS = 150;

function getOption(name) {
  const prefix = `--${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument ? argument.slice(prefix.length) : undefined;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function searchProducts(offset, limit) {
  const response = await fetch(SEARCH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SEARCH_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: '',
      offset,
      limit,
    }),
  });

  if (!response.ok) {
    throw new Error(`Pricepally search failed (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

function getMongoUrl() {
  const cliUrl = getOption('mongo-url');
  const mongoUrl = cliUrl || process.env.PRICEPALLY_MONGODB_URL;

  if (!mongoUrl) {
    throw new Error(
      'Missing PRICEPALLY_MONGODB_URL. Set it to the scraped database URI or pass --mongo-url=<uri>.'
    );
  }

  let databaseName;
  try {
    databaseName = decodeURIComponent(new URL(mongoUrl).pathname.replace(/^\//, ''));
  } catch {
    throw new Error('Invalid MongoDB URI supplied for the Pricepally importer.');
  }

  if (databaseName !== 'scraped') {
    throw new Error(
      `Refusing to import outside the isolated "scraped" database (received "${databaseName || '(none)'}").`
    );
  }

  return mongoUrl;
}

function categoryKey(category) {
  return category.handle || category.id || category.name;
}

async function importCatalog() {
  const dryRun = hasFlag('dry-run');
  const requestedLimit = Number(getOption('limit') || 0);
  const requestedPageSize = Math.min(
    Math.max(Number(getOption('page-size') || DEFAULT_PAGE_SIZE), 1),
    1000
  );
  const pageSize = requestedLimit
    ? Math.min(requestedPageSize, requestedLimit)
    : requestedPageSize;

  const products = [];
  let offset = 0;
  let estimatedTotal = 0;

  do {
    const page = await searchProducts(offset, pageSize);
    const hits = Array.isArray(page.hits) ? page.hits : [];
    estimatedTotal = page.estimatedTotalHits || page.totalHits || 0;
    products.push(...hits);
    offset += hits.length;

    console.log(`Fetched ${offset}${estimatedTotal ? ` of about ${estimatedTotal}` : ''} products`);

    if (requestedLimit && products.length >= requestedLimit) {
      products.length = requestedLimit;
      break;
    }

    if (
      hits.length === 0 ||
      hits.length < pageSize ||
      (estimatedTotal > 0 && offset >= estimatedTotal)
    ) {
      break;
    }

    await sleep(REQUEST_DELAY_MS);
  } while (true);

  const categories = new Map();
  for (const product of products) {
    for (const category of Array.isArray(product.categories) ? product.categories : []) {
      if (!category || !categoryKey(category)) continue;
      const key = categoryKey(category);
      const existing = categories.get(key);
      categories.set(key, {
        ...(existing || {}),
        ...category,
        productIds: [...(existing?.productIds || []), product.id].filter(Boolean),
      });
    }
  }

  if (dryRun) {
    console.log(`Dry run complete: ${products.length} products, ${categories.size} categories`);
    if (products[0]) {
      console.log(JSON.stringify({
        id: products[0].id,
        title: products[0].title,
        categories: products[0].categories,
        sourceKeys: Object.keys(products[0]),
      }, null, 2));
    }
    return;
  }

  getMongoUrl();
  const importedAt = new Date();

  for (const product of products) {
    if (!product.id) continue;

    await prisma.pricepallyProduct.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        source: 'pricepally',
        sourceUrl: `${SOURCE_URL}/products/${product.handle}`,
        sourceId: product.id,
        handle: product.handle || null,
        title: product.title || null,
        description: product.description || null,
        images: product.images || [],
        categoryRefs: product.categories || [],
        rawProduct: product,
        importedAt,
      },
      update: {
        sourceUrl: `${SOURCE_URL}/products/${product.handle}`,
        handle: product.handle || null,
        title: product.title || null,
        description: product.description || null,
        images: product.images || [],
        categoryRefs: product.categories || [],
        rawProduct: product,
        importedAt,
      },
    });
  }

  for (const category of categories.values()) {
    const key = categoryKey(category);
    await prisma.pricepallyCategory.upsert({
      where: { id: key },
      create: {
        id: key,
        source: 'pricepally',
        sourceId: category.id || null,
        name: category.name || key,
        handle: category.handle || key,
        productIds: [...new Set(category.productIds)],
        rawCategory: Object.fromEntries(
          Object.entries(category).filter(([field]) => field !== 'productIds')
        ),
        importedAt,
      },
      update: {
          source: 'pricepally',
          sourceId: category.id || null,
          name: category.name || key,
          handle: category.handle || key,
          productIds: [...new Set(category.productIds)],
          rawCategory: Object.fromEntries(
            Object.entries(category).filter(([field]) => field !== 'productIds')
          ),
          importedAt,
      },
    });
  }

  console.log(`Imported ${products.length} products and ${categories.size} categories`);
  console.log('Collections: pricepally_products, pricepally_categories');
}

importCatalog()
  .catch((error) => {
    console.error(`Import failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
