#!/usr/bin/env node

require('dotenv/config');

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

async function loadSourceCatalog() {
  const [pricepallyProducts, pricepallyCategories, market2homeProducts, market2homeCategories] = await Promise.all([
    pricepally.pricepallyProduct.findMany(),
    pricepally.pricepallyCategory.findMany(),
    market2home.market2homeProduct.findMany(),
    market2home.market2homeCategory.findMany(),
  ]);

  return [
    { source: 'pricepally', products: pricepallyProducts.map((item) => item.rawProduct), categories: pricepallyCategories },
    { source: 'market2home', products: market2homeProducts.map((item) => item.rawProduct), categories: market2homeCategories },
  ];
}

async function loadAppCatalogSnapshot() {
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

  return { categories, products };
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
  const imageCache = new Map();
  const categoriesByKey = new Map();
  const sourceCategoryLookups = new Map();

  for (const sourceData of sources) {
    for (const sourceCategory of sourceData.categories) {
      const raw = sourceCategory.rawCategory || sourceCategory;
      const originalName = asText(raw.name || sourceCategory.name) || 'Uncategorized';
      const key = categoryKey(raw);
      const category = { key, name: originalName, raw };
      categoriesByKey.set(key, category);
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

  for (const sourceData of sources) {
    for (const product of sourceData.products) {
      const sourceProductId = product.id;
      if (!sourceProductId) continue;

      const references = categoryReferences(sourceData.source, sourceData.categories, product);
      const lookup = sourceCategoryLookups.get(sourceData.source) || new Map();
      const categoryIds = unique(references.map((category) => {
        const resolvedKey = lookup.get(categoryKey(category)) || categoryKey(category);
        return appCategories.get(resolvedKey);
      }).filter(Boolean));
      const variants = sourceData.source === 'pricepally'
        ? getPricepallyVariants(product)
        : getMarket2HomeVariants(product);
      const firstPrice = variants[0]?.prices?.[0]?.amount || asNumber(product.finalPrice ?? product.price);
      const sourceImages = imageUrls(product.images);
      if (product.thumbnail) sourceImages.unshift(product.thumbnail);
      const images = await uploadImages(unique(sourceImages), imageCache);

      const productData = {
        name: asText(product.title || product.name) || `Imported ${SOURCE_LABELS[sourceData.source]} product`,
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

      const productKey = `${productData.name.toLocaleLowerCase()}::${categoryIds[0] || ''}`;
      if (existingProductKeys.has(productKey)) {
        console.log(`Skipping existing platform product: ${productData.name}`);
        continue;
      }

      try {
        await prisma.product.create({ data: { ...productData, categoryId: categoryIds[0] || undefined } });
        existingProductKeys.add(productKey);
        productCount += 1;
        if (productCount % 25 === 0) console.log(`Imported ${productCount} platform products`);
      } catch (error) {
        failedCount += 1;
        console.error(`Failed product ${sourceData.source}:${sourceProductId} (${productData.name}): ${error?.message || error}`);
      }
    }
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
