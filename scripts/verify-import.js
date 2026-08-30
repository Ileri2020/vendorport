#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');

async function verifyImport() {
  const prisma = new PrismaClient();
  try {
    const prodCount = await prisma.product.count({ where: { businessId: null } });
    const catCount = await prisma.category.count({ where: { businessId: null } });
    const varCount = await prisma.productVariant.count();
    const priceCount = await prisma.productVariantPrice.count();
    const invCount = await prisma.productVariantInventory.count();
    const pcatCount = await prisma.productCategory.count();

    console.log('\n=== Platform Catalog Import Verification ===\n');
    console.log(`Products (businessId = null):     ${prodCount}`);
    console.log(`Categories (businessId = null):   ${catCount}`);
    console.log(`Product-Category Links:           ${pcatCount}`);
    console.log(`Variants (all):                   ${varCount}`);
    console.log(`Variant Prices (all):             ${priceCount}`);
    console.log(`Variant Inventory Items (all):    ${invCount}`);
    console.log('\n✓ Import verification complete\n');
  } finally {
    await prisma.$disconnect();
  }
}

verifyImport().catch(err => {
  console.error('Verification failed:', err.message);
  process.exitCode = 1;
});
