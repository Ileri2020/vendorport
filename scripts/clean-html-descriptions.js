#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function stripHtmlTags(html) {
  if (!html || typeof html !== 'string') return html;
  // Remove all HTML tags but preserve text content
  return html
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim(); // Remove leading/trailing whitespace
}

function removeMarketplacePrefix(text) {
  if (!text || typeof text !== 'string') return text;

  const cleaned = text
    .replace(/^\s*Buy\s+.+?\s+(?:online\s+)?on\s+(?:Price[Pp]ally|Market2Home)\.?\s*/i, '')
    .replace(/\b(?:Price[Pp]ally|Market2Home)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

function hasHtmlTags(text) {
  if (!text || typeof text !== 'string') return false;
  return /<[^>]*>/.test(text);
}

function hasMarketplacePrefix(text) {
  if (!text || typeof text !== 'string') return false;
  return (
    /^\s*Buy\s+.+?\s+(?:online\s+)?on\s+(?:Price[Pp]ally|Market2Home)\.?\s*/i.test(text) ||
    /\b(?:Price[Pp]ally|Market2Home)\b/i.test(text)
  );
}

async function cleanDescriptions() {
  console.log('Scanning for products with HTML tags in descriptions...\n');

  const products = await prisma.product.findMany({
    where: { businessId: null },
    select: { id: true, name: true, description: true, shortDescription: true },
    take: 10000,
  });

  const productsWithHtml = products.filter(
    (p) =>
      hasHtmlTags(p.description) ||
      hasHtmlTags(p.shortDescription) ||
      hasMarketplacePrefix(p.description) ||
      hasMarketplacePrefix(p.shortDescription)
  );

  console.log(`Found ${productsWithHtml.length} products with HTML or PricePally promo text\n`);

  let updated = 0;
  for (const product of productsWithHtml) {
    const cleanDescription = removeMarketplacePrefix(stripHtmlTags(product.description));
    const cleanShortDescription = removeMarketplacePrefix(stripHtmlTags(product.shortDescription));

    if (cleanDescription !== product.description || cleanShortDescription !== product.shortDescription) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          description: cleanDescription || undefined,
          shortDescription: cleanShortDescription || undefined,
        },
      });
      updated += 1;

      if (updated % 50 === 0) {
        console.log(`Cleaned ${updated} products...`);
      }

      // Show sample of what was changed
      if (updated <= 5) {
        console.log(`\nProduct: ${product.name}`);
        const beforeDescription = product.description || '';
        const afterDescription = cleanDescription || '';
        if (hasHtmlTags(product.description) || hasMarketplacePrefix(product.description)) {
          console.log(`  Before: ${beforeDescription.substring(0, 100)}...`);
          console.log(`  After:  ${afterDescription.substring(0, 100)}...`);
        }
      }
    }
  }

  console.log(`\n✓ Cleaned ${updated} products with HTML or PricePally promo text in descriptions\n`);
  await prisma.$disconnect();
}

cleanDescriptions().catch((error) => {
  console.error('Error cleaning descriptions:', error.message);
  process.exitCode = 1;
});
