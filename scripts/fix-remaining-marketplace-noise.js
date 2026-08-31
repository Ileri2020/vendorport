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

function hasMarketplaceText(text) {
  return Boolean(
    text &&
      typeof text === 'string' &&
      (/\bBuy\s+[^.]*?\s+(?:online\s+)?on\s+(?:Price[Pp]ally|Market2Home)\.?\s*/i.test(text) ||
        /\b(?:Price[Pp]ally|Market2Home)\b/i.test(text))
  );
}

async function uploadIfNeeded(url) {
  if (!url || typeof url !== 'string') return url;
  if (/cloudinary\.com|res\.cloudinary\.com/i.test(url)) return url;

  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: 'platform-catalog/final-fix',
      resource_type: 'image',
      use_filename: false,
    });
    return result.secure_url || result.url || url;
  } catch (error) {
    console.warn(`Upload failed for ${url}: ${error.message}`);
    return url;
  }
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, description: true, shortDescription: true, images: true },
  });

  let descriptionUpdates = 0;
  let imageUpdates = 0;

  for (const product of products) {
    const nextDescription = removeMarketplaceText(stripHtmlTags(product.description));
    const nextShortDescription = removeMarketplaceText(stripHtmlTags(product.shortDescription));

    const descriptionChanged =
      hasMarketplaceText(product.description) ||
      hasMarketplaceText(product.shortDescription) ||
      nextDescription !== (product.description || '') ||
      nextShortDescription !== (product.shortDescription || '');

    if (descriptionChanged) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          description: nextDescription || undefined,
          shortDescription: nextShortDescription || undefined,
        },
      });
      descriptionUpdates += 1;
    }

    const currentImages = Array.isArray(product.images) ? product.images : [];
    if (currentImages.length > 0) {
      const normalized = [];
      let changed = false;
      for (const img of currentImages) {
        const source = typeof img === 'string' ? img : img?.url || img?.secure_url || img?.src || img?.thumbnail || '';
        if (!source) continue;
        const output = await uploadIfNeeded(source);
        normalized.push(output);
        if (output !== source) changed = true;
      }

      if (changed) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: normalized },
        });
        imageUpdates += 1;
      }
    }
  }

  console.log(JSON.stringify({
    descriptionUpdates,
    imageUpdates,
    status: 'final cleanup pass completed',
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
