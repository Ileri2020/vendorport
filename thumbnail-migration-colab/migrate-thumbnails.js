#!/usr/bin/env node

const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const { v2: cloudinary } = require("cloudinary");
const sharp = require("sharp");

const envFile = process.env.MIGRATION_ENV_FILE || path.join(__dirname, ".env");
dotenv.config({ path: envFile, override: true });

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

const required = [
  "MONGODB_URL",
  "CLOUDINARY_URL",
];
for (const name of required) {
  if (!process.env[name]?.trim()) throw new Error(`Missing ${name} in .env`);
}

const cloudinaryUrl = process.env.CLOUDINARY_URL.trim();
const cloudName = new URL(cloudinaryUrl).hostname;
if (!cloudName) throw new Error("CLOUDINARY_URL must contain a cloud name.");
const maxBytes = Number(process.env.THUMBNAIL_MAX_BYTES || 20 * 1024);
const limit = Number(process.argv.find((value) => value.startsWith("--limit="))?.split("=")[1] || 0);
const dryRun = process.argv.includes("--dry-run");
const prisma = new PrismaClient();

function describeMongoUrl(value) {
  try {
    const url = new URL(value);
    const appName = url.searchParams.get("appName");
    return `${url.hostname}${url.pathname}${appName ? ` (appName=${appName})` : ""}`;
  } catch {
    return "invalid MongoDB URL";
  }
}

cloudinary.config({
  cloudinary_url: cloudinaryUrl,
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
  for (const width of [480, 360, 280, 220, 160]) {
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

async function migrateProduct(product) {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const current = Array.isArray(product.thumbnailUrls) ? product.thumbnailUrls : [];
  if (dryRun) return images.length;

  const thumbnails = [];
  for (let index = 0; index < images.length; index += 1) {
    log(`${product.name}: processing image ${index + 1}/${images.length}`);
    const existing = current[index];
    if (isTargetUrl(existing)) {
      thumbnails.push(existing);
      continue;
    }
    log(`${product.name}: downloading source image ${index + 1}/${images.length}`);
    const input = await downloadFirst([images[index], existing]);
    log(`${product.name}: compressing thumbnail ${index + 1}/${images.length}`);
    const thumbnail = await makeThumbnail(input);
    log(`${product.name}: uploading thumbnail ${index + 1}/${images.length} to ${cloudName}`);
    thumbnails.push(await upload(thumbnail, `${product._id}-${index}`));
  }

  log(`${product.name}: saving ${thumbnails.length} thumbnail URL(s) to MongoDB`);
  await prisma.product.update({
    where: { id: product.id },
    data: { thumbnailUrls: thumbnails },
  });
  return thumbnails.length;
}

async function main() {
  log(`Loaded env file: ${envFile}`);
  log(`MongoDB target: ${describeMongoUrl(process.env.MONGODB_URL)}`);
  log(`Cloudinary target: ${cloudName}`);
  log("Testing Prisma MongoDB connection...");
  await prisma.$runCommandRaw({ ping: 1 });
  log("Prisma MongoDB connection succeeded.");
  log("Loading products...");
  const products = await prisma.product.findMany({
    where: { images: { isEmpty: false } },
    orderBy: { id: "asc" },
  });
  const pending = products.filter(productNeedsMigration);
  const candidates = limit > 0 ? pending.slice(0, limit) : pending;

  log(`Products requiring migration: ${candidates.length}${dryRun ? " (dry run)" : ""}`);

  let updated = 0;
  let failed = 0;
  for (const product of candidates) {
    log(`Starting product ${updated + failed + 1}/${candidates.length}: ${product.name}`);
    try {
      const count = await migrateProduct(product);
      updated += 1;
      log(`${dryRun ? "Would migrate" : "Migrated"} ${product.name} (${count} thumbnails)`);
    } catch (error) {
      failed += 1;
      console.error(`[${new Date().toISOString()}] Failed ${product.name}: ${error.message}`);
    }
  }

  log(`Finished. Updated: ${updated}, failed: ${failed}.`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
