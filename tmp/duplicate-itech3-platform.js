const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function normalizeName(value) {
  return String(value ?? '').trim().toLowerCase();
}

async function main() {
  const business = await prisma.business.findFirst({
    where: { name: { equals: 'itech3', mode: 'insensitive' } },
    select: { id: true, name: true },
  });

  if (!business) {
    throw new Error('Business "itech3" not found');
  }

  const existingPlatformCategories = await prisma.category.findMany({
    where: { businessId: null },
    select: { id: true, name: true },
  });
  const platformCategoryMap = new Map(
    existingPlatformCategories.map((category) => [normalizeName(category.name), category.id])
  );

  const sourceCategories = await prisma.category.findMany({
    where: { businessId: business.id },
    orderBy: { name: 'asc' },
  });

  const sourceToPlatformCategory = new Map();
  let createdCategories = 0;

  for (const category of sourceCategories) {
    const key = normalizeName(category.name);
    let platformId = platformCategoryMap.get(key);

    if (!platformId) {
      const created = await prisma.category.create({
        data: {
          name: category.name,
          description: category.description,
          image: category.image,
          businessId: null,
        },
      });
      platformId = created.id;
      platformCategoryMap.set(key, platformId);
      createdCategories += 1;
    }

    sourceToPlatformCategory.set(category.id, platformId);
  }

  const existingPlatformProducts = await prisma.product.findMany({
    where: { businessId: null },
    select: { id: true, name: true, categoryId: true },
  });

  const platformProductKeys = new Set(
    existingPlatformProducts.map((product) => `${normalizeName(product.name)}::${String(product.categoryId || '')}`)
  );

  const sourceProducts = await prisma.product.findMany({
    where: { businessId: business.id },
    include: {
      stock: true,
      variants: { include: { prices: true, inventoryItems: true } },
      productCategories: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  let createdProducts = 0;
  let skippedProducts = 0;

  for (const product of sourceProducts) {
    const preferredCategoryId = product.categoryId
      ? sourceToPlatformCategory.get(product.categoryId)
      : null;

    const alternateCategoryId = product.productCategories?.[0]
      ? sourceToPlatformCategory.get(product.productCategories[0].categoryId)
      : null;

    const targetCategoryId = preferredCategoryId || alternateCategoryId;
    const productKey = `${normalizeName(product.name)}::${String(targetCategoryId || '')}`;

    if (platformProductKeys.has(productKey)) {
      skippedProducts += 1;
      continue;
    }

    const additionalCategories = [...new Set(
      (product.productCategories || [])
        .map((pc) => sourceToPlatformCategory.get(pc.categoryId))
        .filter(Boolean)
        .filter((categoryId) => categoryId !== targetCategoryId)
    )];

    const created = await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        barcode: product.barcode,
        tags: product.tags || [],
        categoryId: targetCategoryId || undefined,
        activeIngredients: product.activeIngredients || [],
        scarce: product.scarce,
        for: product.for || [],
        brand: product.brand,
        price: Number(product.price || 0),
        stock: product.stock?.length
          ? {
              create: product.stock.map((stockItem) => ({
                addedQuantity: stockItem.addedQuantity,
                costPerProduct: stockItem.costPerProduct,
              })),
            }
          : undefined,
        images: product.images || [],
        costPrice: product.costPrice,
        businessId: null,
        creatorId: product.creatorId || null,
        brandId: product.brandId || null,
        activeIngredientIds: product.activeIngredientIds || [],
        healthConcernIds: product.healthConcernIds || [],
        regulatoryClassification: product.regulatoryClassification,
        requiresPrescription: product.requiresPrescription,
        weight: product.weight,
        variants: product.variants?.length
          ? {
              create: product.variants.map((variant) => ({
                title: variant.title,
                weight: variant.weight,
                volume: variant.volume,
                metadata: variant.metadata,
                allowBackorder: variant.allowBackorder,
                manageInventory: variant.manageInventory,
                stockStatusByRegion: variant.stockStatusByRegion,
                prices: {
                  create: (variant.prices || []).map((price) => ({
                    amount: Number(price.amount ?? 0),
                    originalAmount: price.originalAmount == null ? null : Number(price.originalAmount),
                    calculatedAmount: price.calculatedAmount == null ? null : Number(price.calculatedAmount),
                    currencyCode: price.currencyCode || 'ngn',
                    isDiscounted: Boolean(price.isDiscounted),
                    minQuantity: price.minQuantity == null ? null : Number(price.minQuantity),
                    maxQuantity: price.maxQuantity == null ? null : Number(price.maxQuantity),
                    metadata: price.metadata,
                  })),
                },
                inventoryItems: {
                  create: (variant.inventoryItems || []).map((item) => ({
                    sku: item.sku,
                    requiredQuantity: item.requiredQuantity == null ? null : Number(item.requiredQuantity),
                    availableQuantity: item.availableQuantity == null ? null : Number(item.availableQuantity),
                    deliverableQuantity: item.deliverableQuantity == null ? null : Number(item.deliverableQuantity),
                    reservedQuantity: item.reservedQuantity == null ? null : Number(item.reservedQuantity),
                    stockedQuantity: item.stockedQuantity == null ? null : Number(item.stockedQuantity),
                    minStockLevel: item.minStockLevel == null ? null : Number(item.minStockLevel),
                    metadata: item.metadata,
                  })),
                },
              })),
            }
          : undefined,
        productCategories: additionalCategories.length
          ? {
              create: additionalCategories.map((categoryId, position) => ({
                categoryId,
                position,
              })),
            }
          : undefined,
      },
    });

    if (created && created.id) {
      createdProducts += 1;
      platformProductKeys.add(productKey);
    }
  }

  const finalCounts = await Promise.all([
    prisma.category.count({ where: { businessId: null } }),
    prisma.product.count({ where: { businessId: null } }),
  ]);

  console.log(JSON.stringify({
    business: business.name,
    businessId: business.id,
    sourceCategories: sourceCategories.length,
    sourceProducts: sourceProducts.length,
    createdCategories,
    createdProducts,
    skippedProducts,
    finalPlatformCategories: finalCounts[0],
    finalPlatformProducts: finalCounts[1],
  }, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('DUPLICATION_ERROR=' + (error && error.message ? error.message : String(error)));
    if (error && error.stack) {
      console.error(error.stack);
    }
    await prisma.$disconnect();
    process.exit(1);
  });
