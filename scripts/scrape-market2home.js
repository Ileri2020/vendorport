#!/usr/bin/env node

require('dotenv/config');

const { PrismaClient } = require('../generated/market2home');

const prisma = new PrismaClient();
const SOURCE_URL = 'https://market2home.ng';
const API_URL = 'https://apis.ahioma.com';
const TENANT_DOMAIN = 'market2home.ng';
const DEFAULT_PAGE_SIZE = 50;
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

async function getJson(path) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      'X-Tenant-Domain': TENANT_DOMAIN,
      Origin: SOURCE_URL,
      Referer: `${SOURCE_URL}/`,
    },
  });

  if (!response.ok) {
    throw new Error(`Market2Home request failed (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

function getMongoUrl() {
  const cliUrl = getOption('mongo-url');
  const mongoUrl = cliUrl || process.env.MARKET2HOME_MONGODB_URL;

  if (!mongoUrl) {
    throw new Error(
      'Missing MARKET2HOME_MONGODB_URL. Set it to the scraped database URI or pass --mongo-url=<uri>.'
    );
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(mongoUrl);
  } catch {
    throw new Error('Invalid MongoDB URI supplied for the Market2Home importer.');
  }

  const databaseName = decodeURIComponent(parsedUrl.pathname.replace(/^\//, ''));
  if (databaseName !== 'scraped') {
    throw new Error(
      `Refusing to import outside the isolated "scraped" database (received "${databaseName || '(none)'}").`
    );
  }

  return mongoUrl;
}

function unwrapData(response, key) {
  return response?.data?.[key] || response?.[key] || [];
}

function categoryKey(category) {
  return category?.id || category?.slug || category?.name;
}

async function fetchCatalog() {
  const categoryResponse = await getJson('/storefront/categories');
  const categories = unwrapData(categoryResponse, 'categories');
  const requestedLimit = Number(getOption('limit') || 0);
  const pageSize = Math.min(Math.max(Number(getOption('page-size') || DEFAULT_PAGE_SIZE), 1), 100);
  const products = [];
  let page = 1;

  while (true) {
    const response = await getJson(`/storefront/products?page=${page}&limit=${pageSize}`);
    const pageProducts = unwrapData(response, 'products');
    products.push(...pageProducts);

    const pagination = response?.data?.pagination || response?.pagination || {};
    const totalPages = Number(pagination.totalPages || 0);
    console.log(`Fetched ${products.length}${pagination.total ? ` of ${pagination.total}` : ''} products`);

    if (requestedLimit && products.length >= requestedLimit) {
      products.length = requestedLimit;
      break;
    }

    if (pageProducts.length === 0 || pageProducts.length < pageSize || (totalPages && page >= totalPages)) {
      break;
    }

    page += 1;
    await sleep(REQUEST_DELAY_MS);
  }

  return { categories, products };
}

function buildCategories(categories, products) {
  const categoryMap = new Map();

  for (const category of categories) {
    if (category && categoryKey(category)) {
      categoryMap.set(categoryKey(category), { ...category, productIds: [] });
    }
  }

  for (const product of products) {
    const category = product?.category;
    if (!category || !categoryKey(category)) continue;

    const key = categoryKey(category);
    const existing = categoryMap.get(key);
    categoryMap.set(key, {
      ...(existing || {}),
      ...category,
      productIds: [...new Set([...(existing?.productIds || []), product.id].filter(Boolean))],
    });
  }

  return categoryMap;
}

async function importCatalog() {
  const { categories: sourceCategories, products } = await fetchCatalog();
  const categories = buildCategories(sourceCategories, products);

  if (hasFlag('dry-run')) {
    console.log(`Dry run complete: ${products.length} products, ${categories.size} categories`);
    if (products[0]) {
      console.log(JSON.stringify({
        id: products[0].id,
        name: products[0].name,
        category: products[0].category,
        sourceKeys: Object.keys(products[0]),
      }, null, 2));
    }
    return;
  }

  getMongoUrl();
  const importedAt = new Date();

  if (!hasFlag('categories-only')) {
    for (const product of products) {
      if (!product?.id) continue;

      await prisma.market2homeProduct.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        source: 'market2home',
        sourceUrl: `${SOURCE_URL}/product/${product.slug || product.id}`,
        sourceId: product.id,
        handle: product.slug || null,
        title: product.name || null,
        description: product.description || null,
        images: product.images || [],
        categoryRefs: product.category || {},
        rawProduct: product,
        importedAt,
      },
      update: {
        sourceUrl: `${SOURCE_URL}/product/${product.slug || product.id}`,
        handle: product.slug || null,
        title: product.name || null,
        description: product.description || null,
        images: product.images || [],
        categoryRefs: product.category || {},
        rawProduct: product,
        importedAt,
      },
      });
    }
  }

  let categoryCount = 0;
  for (const category of categories.values()) {
    const key = categoryKey(category);
    await prisma.market2homeCategory.upsert({
      where: { id: key },
      create: {
        id: key,
        source: 'market2home',
        sourceId: category.id || null,
        name: category.name || key,
        handle: category.slug || key,
        productIds: [...new Set(category.productIds)],
        rawCategory: Object.fromEntries(
          Object.entries(category).filter(([field]) => field !== 'productIds')
        ),
        importedAt,
      },
      update: {
        source: 'market2home',
        sourceId: category.id || null,
        name: category.name || key,
        handle: category.slug || key,
        productIds: [...new Set(category.productIds)],
        rawCategory: Object.fromEntries(
          Object.entries(category).filter(([field]) => field !== 'productIds')
        ),
        importedAt,
      },
    });
    categoryCount += 1;
    console.log(`Stored category ${categoryCount} of ${categories.size}`);
  }

  console.log(`Imported ${products.length} products and ${categories.size} categories`);
  console.log('Collections: market2home_products, market2home_categories');
}

importCatalog()
  .catch((error) => {
    console.error(`Import failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });