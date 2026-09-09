#!/usr/bin/env node

const path = require("path");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");

dotenv.config({ path: process.env.MIGRATION_ENV_FILE || path.join(__dirname, ".env"), override: true });

for (const name of ["MONGODB_URL", "HEALTHCLIQUE_MONGODB_URL"]) {
  if (!process.env[name]?.trim()) throw new Error(`Missing ${name} in .env`);
}

const sourceClient = new MongoClient(process.env.HEALTHCLIQUE_MONGODB_URL);
const destinationClient = new MongoClient(process.env.MONGODB_URL);
const dryRun = process.argv.includes("--dry-run");
const limit = Number(process.argv.find((value) => value.startsWith("--limit="))?.split("=")[1] || 0);
const sourceDatabaseName = process.env.HEALTHCLIQUE_DATABASE || "healthclique";
const destinationDatabaseName = process.env.MONGODB_DATABASE || "succo";
const sourceCollectionPrefix = process.env.HEALTHCLIQUE_COLLECTION_PREFIX || "";
const destinationCollectionPrefix = process.env.MONGODB_COLLECTION_PREFIX || "";

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function collectionName(prefix, name) {
  return `${prefix}${name}`;
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function asText(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function asDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function imageList(value) {
  return [...new Set(asArray(value).map((item) => {
    if (typeof item === "string") return item.trim();
    return asText(item?.secure_url || item?.url || item?.src);
  }).filter(Boolean))];
}

function sourceId(value) {
  return value && typeof value === "object" && value.toString ? value.toString() : String(value || "");
}

function productDocument(source, categoryId) {
  const brand = typeof source.brand === "string" ? source.brand : asText(source.brand?.name);
  return {
    name: asText(source.name) || "Unnamed imported drug",
    description: source.description || null,
    shortDescription: source.shortDescription || null,
    barcode: source.barcode || null,
    tags: asArray(source.tags).map(String),
    categoryId,
    activeIngredients: asArray(source.activeIngredients).map((item) => asText(item?.name || item)).filter(Boolean),
    scarce: source.scarce ?? null,
    for: asArray(source.for).map(String),
    brand: brand || null,
    price: Number(source.price) || 0,
    images: imageList(source.images),
    thumbnailUrls: [],
    catalogType: "drug",
    regulatoryClassification: source.regulatoryClassification || "OTC",
    requiresPrescription: Boolean(source.requiresPrescription),
    weight: source.weight || null,
    businessId: null,
    createdAt: asDate(source.createdAt),
    updatedAt: new Date(),
  };
}

async function main() {
  log("Connecting to HealthClique source database...");
  await sourceClient.connect();
  log("Connecting to platform destination database...");
  await destinationClient.connect();

  const sourceDb = sourceClient.db(sourceDatabaseName);
  const destinationDb = destinationClient.db(destinationDatabaseName);
  const sourceCategories = sourceDb.collection(collectionName(sourceCollectionPrefix, "Category"));
  const sourceProducts = sourceDb.collection(collectionName(sourceCollectionPrefix, "Product"));
  const destinationCategories = destinationDb.collection(collectionName(destinationCollectionPrefix, "Category"));
  const destinationProducts = destinationDb.collection(collectionName(destinationCollectionPrefix, "Product"));

  log("Loading HealthClique categories...");
  const categories = await sourceCategories.find({}).toArray();
  log(`Loaded ${categories.length} source categories.`);

  const categoryMap = new Map();
  let categoryCount = 0;
  for (const sourceCategory of categories) {
    const name = asText(sourceCategory.name);
    if (!name) continue;
    const filter = { name, businessId: null };
    const update = {
      $set: {
        description: sourceCategory.description || null,
        image: sourceCategory.image || null,
        catalogType: "drug",
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: asDate(sourceCategory.createdAt) },
    };
    let destinationCategory;
    if (dryRun) {
      destinationCategory = await destinationCategories.findOne(filter) || { _id: `dry-${name}` };
    } else {
      const result = await destinationCategories.findOneAndUpdate(filter, update, { upsert: true, returnDocument: "after" });
      destinationCategory = result;
    }
    categoryMap.set(sourceId(sourceCategory._id), destinationCategory._id);
    categoryCount += 1;
    log(`${dryRun ? "Would import" : "Imported"} category ${categoryCount}/${categories.length}: ${name}`);
  }

  log("Loading HealthClique products...");
  const sourceProductCursor = sourceProducts.find({}).sort({ createdAt: 1 });
  const sourceProductList = limit > 0 ? await sourceProductCursor.limit(limit).toArray() : await sourceProductCursor.toArray();
  log(`Loaded ${sourceProductList.length} source products.`);

  let imported = 0;
  let skipped = 0;
  for (const sourceProduct of sourceProductList) {
    const sourceCategoryId = sourceId(sourceProduct.categoryId);
    const categoryId = categoryMap.get(sourceCategoryId);
    if (!categoryId) {
      skipped += 1;
      log(`Skipped ${asText(sourceProduct.name) || sourceId(sourceProduct._id)}: source category was not found.`);
      continue;
    }

    const document = productDocument(sourceProduct, categoryId);
    const filter = { name: document.name, categoryId, businessId: null };
    if (!dryRun) {
      const { createdAt, ...mutableDocument } = document;
      await destinationProducts.updateOne(
        filter,
        { $set: mutableDocument, $setOnInsert: { createdAt } },
        { upsert: true },
      );
    }
    imported += 1;
    log(`${dryRun ? "Would import" : "Imported"} product ${imported}/${sourceProductList.length}: ${document.name}`);
  }

  log(`Finished. Categories: ${categoryCount}; products: ${imported}; skipped: ${skipped}; mode: ${dryRun ? "dry-run" : "write"}.`);
}

main()
  .catch((error) => {
    console.error(`[${new Date().toISOString()}] Migration failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([sourceClient.close(), destinationClient.close()]);
  });
