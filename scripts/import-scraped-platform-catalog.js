#!/usr/bin/env node

require('dotenv/config');

function ensureAtlasDirectUrls() {
  const hostList = [
    'succomongo-shard-00-00.b5r4o.mongodb.net:27017',
    'succomongo-shard-00-01.b5r4o.mongodb.net:27017',
    'succomongo-shard-00-02.b5r4o.mongodb.net:27017',
  ].join(',');

  const directAtlasUrl = `mongodb://adepojuololade2020:j0k2iy9xXcraCpHn@${hostList}/scraped?authSource=admin&retryWrites=true&w=majority&tls=true`;

  if (!process.env.PRICEPALLY_MONGODB_URL) {
    process.env.PRICEPALLY_MONGODB_URL = directAtlasUrl;
  }
  if (!process.env.MARKET2HOME_MONGODB_URL) {
    process.env.MARKET2HOME_MONGODB_URL = directAtlasUrl;
  }
}

ensureAtlasDirectUrls();

const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const { PrismaClient } = require('@prisma/client');
const { PrismaClient: PricepallyClient } = require('../generated/pricepally');
const { PrismaClient: Market2HomeClient } = require('../generated/market2home');

const prisma = new PrismaClient();
const pricepally = new PricepallyClient();
const market2home = new Market2HomeClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SOURCE_LABELS = {
  pricepally: 'Pricepally',
  market2home: 'Market2Home',
};

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function getOption(name) {
  const prefix = `--${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument ? argument.slice(prefix.length) : undefined;
}

function getNumberOption(name, fallback = 0) {
  const raw = getOption(name);
  if (raw == null) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function snapshotDirectory() {
  return path.resolve(getOption('snapshot-dir') || 'tmp/platform-catalog');
}

function writeSnapshot(filename, value) {
  const directory = snapshotDirectory();
  fs.mkdirSync(directory, { recursive: true });
  const filePath = path.join(directory, filename);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
  return filePath;
}

function asText(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function imageUrls(value) {
  if (!Array.isArray(value)) return [];
  return unique(value.map((image) => {
    if (typeof image === 'string') return image;
    return image?.url || image?.secure_url || image?.src || image?.thumbnail || '';
  }));
}

function pricepallyAmount(value) {
  const amount = asNumber(value);
  return amount > 100000 ? amount / 100 : amount;
}

function getPricepallyVariants(product) {
  return (Array.isArray(product.variants) ? product.variants : []).map((variant) => {
    const firstPrice = Array.isArray(variant.prices) ? variant.prices[0] : null;
    const snapshot = variant.pricing_snapshot && Object.values(variant.pricing_snapshot)[0];
    const amount = firstPrice?.amount ?? snapshot?.calculated_amount ?? 0;
    const originalAmount = firstPrice?.raw_amount?.value
      ? pricepallyAmount(firstPrice.raw_amount.value)
      : snapshot?.original_amount == null ? undefined : pricepallyAmount(snapshot.original_amount);

    return {
      title: asText(variant.title) || 'Standard option',
      weight: variant.weight == null ? undefined : asText(variant.weight),
      volume: undefined,
      metadata: variant.metadata || undefined,
      allowBackorder: Boolean(variant.allow_backorder ?? variant.fake_allow_backorder),
      manageInventory: variant.manage_inventory !== false,
      stockStatusByRegion: variant.stock_status_by_region || undefined,
      prices: [{
        amount: pricepallyAmount(amount),
        originalAmount,
        calculatedAmount: snapshot?.calculated_amount == null ? undefined : pricepallyAmount(snapshot.calculated_amount),
        currencyCode: asText(firstPrice?.currency_code || snapshot?.currency_code || 'ngn').toLowerCase(),
        isDiscounted: Boolean(snapshot?.is_discounted || firstPrice?.price_list_id),
        minQuantity: firstPrice?.min_quantity == null ? undefined : asNumber(firstPrice.min_quantity),
        maxQuantity: firstPrice?.max_quantity == null ? undefined : asNumber(firstPrice.max_quantity),
        metadata: firstPrice || undefined,
      }],
      inventoryItems: (variant.inventory_items || []).map((item) => ({
        sku: asText(item.sku) || undefined,
        requiredQuantity: item.required_quantity == null ? undefined : asNumber(item.required_quantity),
        availableQuantity: item.available_quantity == null ? undefined : asNumber(item.available_quantity),
        deliverableQuantity: item.deliverable_quantity == null ? undefined : asNumber(item.deliverable_quantity),
        reservedQuantity: item.reserved_quantity == null ? undefined : asNumber(item.reserved_quantity),
        stockedQuantity: item.stocked_quantity == null ? undefined : asNumber(item.stocked_quantity),
        minStockLevel: item.min_stock_level == null ? undefined : asNumber(item.min_stock_level),
        metadata: item,
      })),
    };
  });
}

function getMarket2HomeVariants(product) {
  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants
    : [{
        title: product.name,
        weight: product.weight,
        volume: product.volume,
        price: product.finalPrice ?? product.price,
        sku: product.sku,
        barcode: product.barcode,
      }];

  return variants.map((variant) => ({
    title: asText(variant.title || variant.name || product.name) || 'Standard option',
    weight: variant.weight == null ? asText(product.weight) || undefined : asText(variant.weight),
    volume: variant.volume == null ? asText(product.volume) || undefined : asText(variant.volume),
    metadata: variant.metadata || {
      attributes: product.attributes || undefined,
      barcode: variant.barcode || product.barcode || undefined,
    },
    allowBackorder: Boolean(variant.allowBackorder),
    manageInventory: variant.manageInventory !== false,
    stockStatusByRegion: variant.stockStatusByRegion || undefined,
    prices: [{
      amount: asNumber(variant.finalPrice ?? variant.price ?? product.finalPrice ?? product.price),
      originalAmount: variant.price == null ? undefined : asNumber(variant.price),
      calculatedAmount: variant.finalPrice == null ? undefined : asNumber(variant.finalPrice),
      currencyCode: 'ngn',
      isDiscounted: asNumber(variant.discount ?? product.discount) > 0,
      metadata: variant,
    }],
    inventoryItems: [{
      sku: asText(variant.sku || product.sku) || undefined,
      metadata: variant,
    }],
  }));
}

function categoryReferences(source, categories, product) {
  if (source === 'pricepally') {
    return Array.isArray(product.categories) ? product.categories : [];
  }

  if (product.category) return [product.category];
  return categories.filter((category) => category.productIds?.includes(product.id));
}

function categoryKey(category) {
  return asText(category.name || category.handle || category.slug || category.id).toLocaleLowerCase();
}

async function uploadImage(url, cache) {
  if (!url || url.startsWith('data:')) return null;
  if (url.includes('res.cloudinary.com/')) return url;
  if (cache.has(url)) return cache.get(url);

  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: `platform-catalog/${getOption('folder') || 'marketplaces'}`,
      resource_type: 'image',
      use_filename: false,
    });
    cache.set(url, result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.warn(`Image upload failed, retaining source URL: ${url} (${error.message})`);
    cache.set(url, url);
    return url;
  }
}

async function uploadImages(urls, cache) {
  const uploaded = [];
  for (const url of urls) {
    const uploadedUrl = await uploadImage(url, cache);
    if (uploadedUrl) uploaded.push(uploadedUrl);
  }
  return unique(uploaded);
}

async function createProductWithRelations(productData, categoryIds) {
  const uniqueCategoryIds = unique(categoryIds);
  const createdProduct = await prisma.product.create({
    data: {
      name: productData.name,
      description: productData.description,
      shortDescription: productData.shortDescription,
      barcode: productData.barcode,
      tags: productData.tags,
      price: Number(productData.price || 0),
      images: productData.images || [],
      weight: productData.weight,
      businessId: null,
      activeIngredients: [],
      for: [],
      categoryId: uniqueCategoryIds[0] || undefined,
    },
  });

  if (uniqueCategoryIds.length > 0) {
    await prisma.productCategory.createMany({
      data: uniqueCategoryIds.map((categoryId, position) => ({
        productId: createdProduct.id,
        categoryId,
        position,
      })),
    });
  }

  const variantsToCreate = Array.isArray(productData.variants) ? productData.variants.filter(v => v && v.title) : [];
  for (const variant of variantsToCreate) {
    if (!variant || !variant.title) continue;

    const createdVariant = await prisma.productVariant.create({
      data: {
        productId: createdProduct.id,
        title: variant.title,
        weight: variant.weight || null,
        volume: variant.volume || null,
        metadata: variant.metadata || undefined,
        allowBackorder: Boolean(variant.allowBackorder),
        manageInventory: variant.manageInventory !== false,
        stockStatusByRegion: variant.stockStatusByRegion || undefined,
      },
    });

    const prices = (variant.prices && Array.isArray(variant.prices)) ? variant.prices.filter(p => p) : [];
    if (prices.length > 0) {
      try {
        await prisma.productVariantPrice.createMany({
          data: prices.map((price) => ({
            variantId: createdVariant.id,
            amount: Number(price.amount ?? 0),
            originalAmount: price.originalAmount == null ? null : Number(price.originalAmount),
            calculatedAmount: price.calculatedAmount == null ? null : Number(price.calculatedAmount),
            currencyCode: asText(price.currencyCode || 'ngn').toLowerCase(),
            isDiscounted: Boolean(price.isDiscounted),
            minQuantity: price.minQuantity == null ? null : Number(price.minQuantity),
            maxQuantity: price.maxQuantity == null ? null : Number(price.maxQuantity),
            metadata: price.metadata || undefined,
          })),
        });
      } catch (priceErr) {
        console.warn(`Skipped variant prices: ${priceErr.message}`);
      }
    }

    const inventoryItems = (variant.inventoryItems && Array.isArray(variant.inventoryItems)) ? variant.inventoryItems.filter(i => i) : [];
    if (inventoryItems.length > 0) {
      try {
        await prisma.productVariantInventory.createMany({
          data: inventoryItems.map((item) => ({
            variantId: createdVariant.id,
            sku: item.sku || null,
            requiredQuantity: item.requiredQuantity == null ? null : Number(item.requiredQuantity),
            availableQuantity: item.availableQuantity == null ? null : Number(item.availableQuantity),
            deliverableQuantity: item.deliverableQuantity == null ? null : Number(item.deliverableQuantity),
            reservedQuantity: item.reservedQuantity == null ? null : Number(item.reservedQuantity),
            stockedQuantity: item.stockedQuantity == null ? null : Number(item.stockedQuantity),
            minStockLevel: item.minStockLevel == null ? null : Number(item.minStockLevel),
            metadata: item.metadata || undefined,
          })),
        });
      } catch (invErr) {
        console.warn(`Skipped variant inventory: ${invErr.message}`);
      }
    }
  }

  return createdProduct;
}

async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 2000) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

async function loadSourceCatalog() {
  console.log('Loading Pricepally products...');
  const pricepallyProducts = await retryWithBackoff(() => pricepally.pricepallyProduct.findMany());
  console.log(`Loaded ${pricepallyProducts.length} Pricepally products`);

  console.log('Loading Pricepally categories...');
  const pricepallyCategories = await retryWithBackoff(() => pricepally.pricepallyCategory.findMany());
  console.log(`Loaded ${pricepallyCategories.length} Pricepally categories`);

  console.log('Loading Market2Home products...');
  const market2homeProducts = await retryWithBackoff(() => market2home.market2homeProduct.findMany());
  console.log(`Loaded ${market2homeProducts.length} Market2Home products`);

  console.log('Loading Market2Home categories...');
  const market2homeCategories = await retryWithBackoff(() => market2home.market2homeCategory.findMany());
  console.log(`Loaded ${market2homeCategories.length} Market2Home categories`);

  return [
    { source: 'pricepally', products: pricepallyProducts.map((item) => item.rawProduct), categories: pricepallyCategories },
    { source: 'market2home', products: market2homeProducts.map((item) => item.rawProduct), categories: market2homeCategories },
  ];
}

async function loadAppCatalogSnapshot() {
  console.log('Loading app platform catalog snapshot...');
  return retryWithBackoff(async () => {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        where: { businessId: null },
        select: { id: true, name: true, description: true, image: true },
      }),
      prisma.product.findMany({
        where: { businessId: null },
        select: { id: true, name: true, categoryId: true, images: true },
      }),
    ]);
    console.log(`Loaded ${categories.length} app categories and ${products.length} app products`);
    return { categories, products };
  });
}

function buildLocalComparison(sources, appCatalog) {
  const appCategoryNames = new Set(appCatalog.categories.map((category) => asText(category.name).toLocaleLowerCase()));
  const appProductKeys = new Set(appCatalog.products.map((product) => (
    `${asText(product.name).toLocaleLowerCase()}::${product.categoryId || ''}`
  )));
  const sourceProducts = sources.flatMap((sourceData) => sourceData.products.map((product) => ({
    source: sourceData.source,
    sourceId: product.id,
    name: asText(product.title || product.name),
  })));
  const sourceCategories = [...new Map(sources.flatMap((sourceData) => sourceData.categories.map((category) => {
    const raw = category.rawCategory || category;
    const name = asText(raw.name || category.name) || 'Uncategorized';
    return [name.toLocaleLowerCase(), { source: sourceData.source, name }];
  }))).values()];

  return {
    generatedAt: new Date().toISOString(),
    app: { categories: appCatalog.categories.length, products: appCatalog.products.length },
    scraped: {
      categories: sourceCategories.length,
      products: sourceProducts.length,
    },
    missingCategories: sourceCategories.filter((category) => !appCategoryNames.has(category.name.toLocaleLowerCase())),
    unmatchedProducts: sourceProducts.filter((product) => ![...appProductKeys].some((key) => key.startsWith(`${product.name.toLocaleLowerCase()}::`))),
  };
}

async function createPlatformCatalog() {
  const dryRun = hasFlag('dry-run');
  const limit = getNumberOption('limit', 0);
  const sources = await loadSourceCatalog();
  const appCatalog = await loadAppCatalogSnapshot();
  const sourceSnapshotPath = writeSnapshot('scraped-catalog.json', sources);
  const appSnapshotPath = writeSnapshot('app-platform-catalog.json', appCatalog);
  const comparison = buildLocalComparison(sources, appCatalog);
  const comparisonPath = writeSnapshot('comparison.json', comparison);
  console.log(`Local snapshots written to ${snapshotDirectory()}`);
  console.log(`Comparison: ${comparison.missingCategories.length} missing categories, ${comparison.unmatchedProducts.length} unmatched products`);
  console.log(`Source snapshot: ${sourceSnapshotPath}`);
  console.log(`App snapshot: ${appSnapshotPath}`);
  console.log(`Comparison report: ${comparisonPath}`);
  if (limit > 0) {
    console.log(`Import limit enabled: first ${limit} missing products only`);
  }
  const imageCache = new Map();
  const categoriesByKey = new Map();
  const sourceCategoryLookups = new Map();

  for (const sourceData of sources) {
    for (const sourceCategory of sourceData.categories) {
      const raw = sourceCategory.rawCategory || sourceCategory;
      const originalName = asText(raw.name || sourceCategory.name) || 'Uncategorized';
      const key = originalName.toLocaleLowerCase();
      const category = { key, name: originalName, raw };
      const existingCategory = categoriesByKey.get(key);
      categoriesByKey.set(key, {
        key,
        name: originalName,
        raw: existingCategory?.raw || raw,
      });
      if (!sourceCategoryLookups.has(sourceData.source)) sourceCategoryLookups.set(sourceData.source, new Map());
      const lookup = sourceCategoryLookups.get(sourceData.source);
      for (const value of [raw.id, raw.handle, raw.slug, raw.name, originalName]) {
        if (asText(value)) lookup.set(asText(value).toLocaleLowerCase(), key);
      }
    }
  }

  let productCount = 0;
  let categoryCount = 0;
  let failedCount = 0;
  if (dryRun) {
    console.log(JSON.stringify({
      pricepallyProducts: sources[0].products.length,
      pricepallyCategories: sources[0].categories.length,
      market2homeProducts: sources[1].products.length,
      market2homeCategories: sources[1].categories.length,
    }, null, 2));
    return;
  }

  const appCategories = new Map();
  const existingCategories = await prisma.category.findMany({
    where: { businessId: null },
    select: { id: true, name: true },
  });
  for (const existing of existingCategories) {
    appCategories.set(asText(existing.name).toLocaleLowerCase(), existing.id);
  }

  console.log(`Creating missing categories... (${categoriesByKey.size} deduped categories in source set)`);
  for (const category of categoriesByKey.values()) {
    const normalizedName = asText(category.name).toLocaleLowerCase();
    let categoryId = appCategories.get(normalizedName);
    if (!categoryId) {
      const saved = await prisma.category.create({
        data: {
          name: category.name,
          description: asText(category.raw.description) || undefined,
          image: asText(category.raw.image) || undefined,
          businessId: null,
        },
      });
      categoryId = saved.id;
      appCategories.set(normalizedName, categoryId);
      categoryCount += 1;
      console.log(`Created category: ${category.name}`);
    }
    appCategories.set(category.key, categoryId);
  }

  const existingProducts = await prisma.product.findMany({
    where: { businessId: null },
    select: { id: true, name: true, categoryId: true },
  });
  const existingProductKeys = new Set(
    existingProducts.map((product) => `${asText(product.name).toLocaleLowerCase()}::${product.categoryId || ''}`)
  );

  let productIteration = 0;
  let reachedLimit = false;

  for (const sourceData of sources) {
    for (const product of sourceData.products) {
      if (limit > 0 && productIteration >= limit) {
        reachedLimit = true;
        break;
      }
      productIteration += 1;

      const sourceProductId = product.id;
      if (!sourceProductId) continue;

      const references = categoryReferences(sourceData.source, sourceData.categories, product);
      const lookup = sourceCategoryLookups.get(sourceData.source) || new Map();
      const categoryIds = unique(references.map((category) => {
        const resolvedKey = lookup.get(categoryKey(category)) || asText(category.name).toLocaleLowerCase();
        return appCategories.get(resolvedKey);
      }).filter(Boolean));
      const variants = sourceData.source === 'pricepally'
        ? getPricepallyVariants(product)
        : getMarket2HomeVariants(product);
      const firstPrice = variants[0]?.prices?.[0]?.amount || asNumber(product.finalPrice ?? product.price);
      const productName = asText(product.title || product.name) || `Imported ${SOURCE_LABELS[sourceData.source]} product`;
      const productKey = `${productName.toLocaleLowerCase()}::${categoryIds[0] || ''}`;
      if (existingProductKeys.has(productKey)) {
        continue;
      }

      const sourceImages = imageUrls(product.images);
      if (product.thumbnail) sourceImages.unshift(product.thumbnail);
      console.log(`Processing product ${productIteration}/${limit || 'all'}: ${productName}`);
      const images = await uploadImages(unique(sourceImages), imageCache);

      const productData = {
        name: productName,
        description: asText(product.description) || undefined,
        shortDescription: asText(product.shortDescription) || undefined,
        barcode: asText(product.barcode) || undefined,
        tags: Array.isArray(product.tags) ? product.tags.map(asText).filter(Boolean) : [],
        price: firstPrice,
        images,
        weight: asText(product.weight) || undefined,
        businessId: null,
        activeIngredients: [],
        for: [],
        variants: {
          create: variants.filter((variant) => variant.title).map((variant) => ({
            title: variant.title,
            weight: variant.weight,
            volume: variant.volume,
            metadata: variant.metadata,
            allowBackorder: variant.allowBackorder,
            manageInventory: variant.manageInventory,
            stockStatusByRegion: variant.stockStatusByRegion,
            prices: { create: variant.prices },
            inventoryItems: { create: variant.inventoryItems },
          })),
        },
        productCategories: {
          create: categoryIds.map((categoryId, position) => ({ categoryId, position })),
        },
      };

      try {
        await createProductWithRelations(productData, categoryIds);
        existingProductKeys.add(productKey);
        productCount += 1;
        if (productCount % 25 === 0) console.log(`Imported ${productCount} platform products`);
      } catch (error) {
        failedCount += 1;
        console.error(`Failed product ${sourceData.source}:${sourceProductId} (${productData.name}): ${error?.message || error}`);
        if (error?.stack) console.error(error.stack);
      }
    }
    if (reachedLimit) break;
  }

  console.log(`Imported ${productCount} products and prepared ${categoryCount} platform categories; failed ${failedCount}`);
  console.log('All imported records have businessId = null and app-generated IDs.');
}

createPlatformCatalog()
  .catch((error) => {
    console.error(`Platform catalog import failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all([
      prisma.$disconnect(),
      pricepally.$disconnect(),
      market2home.$disconnect(),
    ]);
  });
