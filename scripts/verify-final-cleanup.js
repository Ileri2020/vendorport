#!/usr/bin/env node

require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, description: true, images: true },
  });

  const withMarketText = products.filter((p) => typeof p.description === 'string' && /(market2home|pricepally)/i.test(p.description));
  const withNonCloudinary = products.filter((p) => Array.isArray(p.images) && p.images.length > 0 && p.images.some((img) => typeof img !== 'string' || !/cloudinary\.com|res\.cloudinary\.com/i.test(img)));

  console.log(JSON.stringify({
    totalProducts: products.length,
    withMarketTextCount: withMarketText.length,
    withNonCloudinaryCount: withNonCloudinary.length,
    sampleMarketText: withMarketText.slice(0, 5).map((p) => ({ id: p.id, name: p.name, description: p.description?.slice(0, 180) })),
    sampleNonCloudinary: withNonCloudinary.slice(0, 5).map((p) => ({ id: p.id, name: p.name, images: p.images })),
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
