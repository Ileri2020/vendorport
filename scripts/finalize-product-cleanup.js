#!/usr/bin/env node

require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function stripHtmlTags(html) {
  if (!html || typeof html !== 'string') return html;
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function removeMarketplaceText(text) {
  if (!text || typeof text !== 'string') return text;

  return text
    .replace(/\bBuy\s+[^.]*?\s+(?:online\s+)?on\s+(?:Price[Pp]ally|Market2Home)\.?\s*/gi, '')
    .replace(/\b(?:Price[Pp]ally|Market2Home)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasHtml(text) {
  return Boolean(text && typeof text === 'string' && /<[^>]*>/.test(text));
}

function hasMarketplaceText(text) {
  return Boolean(
    text &&
      typeof text === 'string' &&
      (/\bBuy\s+[^.]*?\s+(?:online\s+)?on\s+(?:Price[Pp]ally|Market2Home)\.?\s*/i.test(text) ||
        /\b(?:Price[Pp]ally|Market2Home)\b/i.test(text))
  );
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeUrl(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed;
}

async function uploadToCloudinary(imageUrl) {
  const url = normalizeUrl(imageUrl);
  if (!url) return null;
  if (url.includes('res.cloudinary.com/') || url.includes('cloudinary.com/')) return url;

  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: 'platform-catalog/final-cleanup',
      resource_type: 'image',
      use_filename: false,
    });
    return result.secure_url || result.url || url;
  } catch (error) {
    console.warn(`Cloudinary upload failed for ${url}: ${error.message}`);
    return url;
  }
}

async function normalizeProductImages(images) {
  if (!Array.isArray(images) || images.length === 0) return images;

  const normalized = [];
  for (const item of images) {
    if (!item) continue;
    const url = typeof item === 'string' ? item : item.url || item.secure_url || item.src || item.thumbnail || '';
    const cleaned = normalizeUrl(url);
    if (!cleaned) continue;

    const uploadedUrl = await uploadToCloudinary(cleaned);
    normalized.push(uploadedUrl || cleaned);
  }

  return unique(normalized);
}

async function cleanDescriptions() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, description: true, shortDescription: true },
  });

  let updated = 0;
  for (const product of products) {
    const nextDescription = removeMarketplaceText(stripHtmlTags(product.description));
    const nextShortDescription = removeMarketplaceText(stripHtmlTags(product.shortDescription));

    if (
      hasHtml(product.description) ||
      hasHtml(product.shortDescription) ||
      hasMarketplaceText(product.description) ||
      hasMarketplaceText(product.shortDescription) ||
      nextDescription !== (product.description || '') ||
      nextShortDescription !== (product.shortDescription || '')
    ) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          description: nextDescription || undefined,
          shortDescription: nextShortDescription || undefined,
        },
      });
      updated += 1;
    }
  }

  console.log(`Updated ${updated} products with sanitized descriptions.`);
}

async function cleanImages() {
  const products = await prisma.product.findMany({
    select: { id: true, images: true },
  });

  let updated = 0;
  for (const product of products) {
    const original = Array.isArray(product.images) ? product.images : [];
    if (original.length === 0) continue;

    const normalized = await normalizeProductImages(original);
    const changed = JSON.stringify(original) !== JSON.stringify(normalized);

    if (changed) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: normalized },
      });
      updated += 1;
    }
  }

  console.log(`Updated ${updated} products with normalized Cloudinary image URLs.`);
}

async function main() {
  await cleanDescriptions();
  await cleanImages();
  console.log('Product cleanup complete.');
}

main()
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
