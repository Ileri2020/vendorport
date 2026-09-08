#!/usr/bin/env node

const path = require("path");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const { v2: cloudinary } = require("cloudinary");
const sharp = require("sharp");

// This runner intentionally loads only its own env file.
dotenv.config({ path: path.join(__dirname, ".env.thumbnail-migration") });

const required = [
  "MONGODB_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
for (const name of required) {
  if (!process.env[name]?.trim()) throw new Error(`Missing ${name} in scripts/.env.thumbnail-migration`);
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME.trim();
const publicCloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || cloudName).trim();
if (publicCloudName !== cloudName) {
  throw new Error("CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME must match.");
}

const maxBytes = Number(process.env.THUMBNAIL_MAX_BYTES || 20 * 1024);
const limit = Number(process.argv.find((value) => value.startsWith("--limit="))?.split("=")[1] || 0);
const dryRun = process.argv.includes("--dry-run");
const client = new MongoClient(process.env.MONGODB_URL);

cloudinary.config({
  cloud_name: cloudName,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isTargetUrl(value) {
  try {
    const url = new URL(value);
    return url.hostname === "res.cloudinary.com" && url.pathname.includes(`/${cloudName}/`);
  } catch {
    return false;
  }
}

function productNeedsMigration(product) {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const thumbnails = Array.isArray(product.thumbnailUrls) ? product.thumbnailUrls : [];
  return images.length > 0 && (
    thumbnails.length < images.length ||
    thumbnails.slice(0, images.length).some((url) => !isTargetUrl(url))
  );
}

async function download(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers: { "User-Agent": "VendorPort-thumbnail-migration/1.0" },
  });
  if (!response.ok) throw new Error(`${response.status} from ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function downloadFirst(urls) {
  let lastError;
  for (const url of urls.filter(Boolean)) {
    try {
      return await download(url);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("No image source available");
}

async function makeThumbnail(input) {
  const attempts = [480, 360, 280, 220, 160];
  for (const width of attempts) {
    const output = await sharp(input)
      .rotate()
      .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 52, effort: 4 })
      .toBuffer();
    if (output.length <= maxBytes) return output;
  }
  throw new Error(`Could not compress below ${maxBytes} bytes`);
}

function upload(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "product-thumbnails",
        public_id: publicId,
        resource_type: "image",
        format: "webp",
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (error) return reject(error);
        const url = result?.secure_url || result?.url || "";
        if (!isTargetUrl(url)) return reject(new Error(`Unexpected upload cloud: ${url}`));
        resolve(url);
      },
    );
    stream.end(buffer);
  });
}

async function migrateProduct(collection, product) {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const current = Array.isArray(product.thumbnailUrls) ? product.thumbnailUrls : [];
  const thumbnails = [];

  if (dryRun) return images.length;

  for (let index = 0; index < images.length; index += 1) {
    const existing = current[index];
    if (isTargetUrl(existing)) {
      thumbnails.push(existing);
      continue;
    }

    const thumbnail = await makeThumbnail(await downloadFirst([images[index], existing]));
    thumbnails.push(await upload(thumbnail, `${product._id}-${index}`));
  }

  if (!dryRun) {
    await collection.updateOne(
      { _id: product._id },
      { $set: { thumbnailUrls: thumbnails } },
    );
  }
  return thumbnails.length;
}

async function main() {
  await client.connect();
  const database = client.db(process.env.MONGODB_DATABASE || undefined);
  const collection = database.collection(process.env.MONGODB_PRODUCTS_COLLECTION || "Product");
  const products = await collection.find({ images: { $exists: true, $type: "array", $ne: [] } }).toArray();
  const pending = products.filter(productNeedsMigration);
  const candidates = limit > 0 ? pending.slice(0, limit) : pending;

  console.log(`Destination cloud: ${cloudName}`);
  console.log(`Products requiring migration: ${candidates.length}${dryRun ? " (dry run)" : ""}`);

  let updated = 0;
  let failed = 0;
  for (const product of candidates) {
    try {
      const count = await migrateProduct(collection, product);
      updated += 1;
      console.log(`${dryRun ? "Would migrate" : "Migrated"} ${product.name} (${count} thumbnails)`);
    } catch (error) {
      failed += 1;
      console.error(`Failed ${product.name}: ${error.message}`);
    }
  }

  console.log(`Finished. Updated: ${updated}, failed: ${failed}.`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => client.close());
