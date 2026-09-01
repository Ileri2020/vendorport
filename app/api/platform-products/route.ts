import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getSessionUser() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  return { session, userId };
}

function normalizeCatalogValue(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function dedupeCatalogProducts(products: any[]) {
  const seen = new Map<string, any>();

  for (const product of products) {
    const name = normalizeCatalogValue(product.name);
    const brand = normalizeCatalogValue(product.brand || product.brandData?.name || "");
    const categoryName = normalizeCatalogValue(product.category?.name || "");
    const price = Number(product.price ?? 0).toFixed(2);
    const key = `${name}|${brand}|${categoryName}|${price}`;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, product);
      continue;
    }

    const currentIsPlatform = !existing.businessId;
    const incomingIsPlatform = !product.businessId;

    if (currentIsPlatform === incomingIsPlatform) {
      const existingImageCount = Array.isArray(existing.images) ? existing.images.filter(Boolean).length : 0;
      const incomingImageCount = Array.isArray(product.images) ? product.images.filter(Boolean).length : 0;
      if (incomingImageCount > existingImageCount) seen.set(key, product);
      continue;
    }

    if (incomingIsPlatform) {
      seen.set(key, product);
    }
  }

  return [...seen.values()];
}

function dedupeCatalogCategories(categories: any[]) {
  const seen = new Map<string, any>();

  for (const category of categories) {
    const key = normalizeCatalogValue(category.name);
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, category);
      continue;
    }

    const currentIsPlatform = !existing.businessId;
    const incomingIsPlatform = !category.businessId;

    if (currentIsPlatform === incomingIsPlatform) {
      const currentImageCount = Array.isArray(existing.products) ? existing.products.filter((product: any) => product?.images?.length).length : 0;
      const incomingImageCount = Array.isArray(category.products) ? category.products.filter((product: any) => product?.images?.length).length : 0;
      if (incomingImageCount > currentImageCount) seen.set(key, category);
      continue;
    }

    if (incomingIsPlatform) {
      seen.set(key, category);
    }
  }

  return [...seen.values()];
}

async function cloneProductsToBusiness({
  businessId,
  categoryId,
  productIds,
  userId,
}: {
  businessId: string;
  categoryId: string;
  productIds: string[];
  userId?: string | null;
}) {
  const uniqueProductIds = [...new Set(productIds.filter(Boolean).map(String))];
  if (uniqueProductIds.length === 0) {
    return { attached: 0 };
  }

  const sourceProducts = await prisma.product.findMany({
    where: {
      id: { in: uniqueProductIds },
    },
    include: {
      variants: { include: { prices: true, inventoryItems: true } },
    },
  });

  const existingProducts = await prisma.product.findMany({
    where: { businessId, categoryId },
    select: { name: true },
  });
  const existingNames = new Set(existingProducts.map((p) => p.name.trim().toLowerCase()));

  const productsToClone = sourceProducts.filter((p) => !existingNames.has(p.name.trim().toLowerCase()));
  if (productsToClone.length === 0) {
    return { attached: 0 };
  }

  let attached = 0;
  await Promise.all(
    productsToClone.map(async (product) => {
      try {
        const created = await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            shortDescription: product.shortDescription,
            barcode: product.barcode,
            tags: product.tags,
            activeIngredients: product.activeIngredients,
            scarce: product.scarce,
            for: product.for,
            brand: product.brand,
            price: product.price,
            stock: product.stock?.length ? { create: product.stock.map((stock) => ({
              addedQuantity: stock.addedQuantity,
              costPerProduct: stock.costPerProduct,
            })) } : undefined,
            images: product.images,
            costPrice: product.costPrice,
            businessId,
            categoryId,
            creatorId: userId || product.creatorId || null,
            brandId: product.brandId || null,
            activeIngredientIds: product.activeIngredientIds,
            healthConcernIds: product.healthConcernIds,
            regulatoryClassification: product.regulatoryClassification,
            requiresPrescription: product.requiresPrescription,
            weight: product.weight,
            variants: {
              create: (product.variants || []).map((variant) => ({
                title: variant.title,
                weight: variant.weight,
                volume: variant.volume,
                metadata: variant.metadata,
                allowBackorder: variant.allowBackorder,
                manageInventory: variant.manageInventory,
                stockStatusByRegion: variant.stockStatusByRegion,
                prices: {
                  create: (variant.prices || []).map((price) => ({
                    amount: price.amount,
                    originalAmount: price.originalAmount,
                    calculatedAmount: price.calculatedAmount,
                    currencyCode: price.currencyCode,
                    isDiscounted: price.isDiscounted,
                    minQuantity: price.minQuantity,
                    maxQuantity: price.maxQuantity,
                    metadata: price.metadata,
                  })),
                },
                inventoryItems: {
                  create: (variant.inventoryItems || []).map((item) => ({
                    sku: item.sku,
                    requiredQuantity: item.requiredQuantity,
                    availableQuantity: item.availableQuantity,
                    deliverableQuantity: item.deliverableQuantity,
                    reservedQuantity: item.reservedQuantity,
                    stockedQuantity: item.stockedQuantity,
                    minStockLevel: item.minStockLevel,
                    metadata: item.metadata,
                  })),
                },
              })),
            },
            productCategories: {
              create: [{ categoryId, position: 0 }],
            },
          },
        });

        if (created?.id) {
          attached += 1;
        }
      } catch (err) {
        console.error(`[cloneProductsToBusiness] Failed to clone product ${product.id}:`, err);
      }
    })
  );

  return { attached };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const searchParams = new URL(request.url).searchParams;
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id;
  const requestUserId = searchParams.get("userId") || null;
  const effectiveUserId = sessionUserId || requestUserId;

  if (!effectiveUserId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const businessId = searchParams.get("businessId");
  const action = searchParams.get("action");

  let todayAddedCount = 0;
  if (businessId) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    todayAddedCount = await prisma.product.count({
      where: {
        businessId,
        createdAt: { gte: startOfDay },
      },
    });
  }

  if (action === "unadded-category-products" && businessId) {
    const sourceCategoryId = searchParams.get("sourceCategoryId");
    if (!sourceCategoryId) return NextResponse.json({ error: "Source category is required" }, { status: 400 });

    const sourceCategory = await prisma.category.findUnique({
      where: { id: sourceCategoryId },
      include: {
        products: {
          include: {
            variants: { include: { prices: true } },
          },
        },
        productCategories: {
          include: {
            product: {
              include: {
                variants: { include: { prices: true } },
              },
            },
          },
        },
      },
    });

    if (!sourceCategory) return NextResponse.json({ error: "Category not found" }, { status: 400 });

    const allSourceProducts = dedupeCatalogProducts([
      ...sourceCategory.products,
      ...sourceCategory.productCategories.map((pc) => pc.product).filter(Boolean),
    ]);

    const existingBusinessProducts = await prisma.product.findMany({
      where: { businessId },
      select: { name: true },
    });

    const existingNames = new Set(existingBusinessProducts.map((p) => p.name.trim().toLowerCase()));

    const unaddedProducts = allSourceProducts.filter(
      (p) => !existingNames.has(p.name.trim().toLowerCase())
    );

    return NextResponse.json({
      unaddedProducts,
      todayAddedCount,
      remainingLimit: Math.max(0, 300 - todayAddedCount),
      dailyLimit: 300,
    });
  }

  const query = searchParams.get("query")?.trim() || "";
  const categoryIds = searchParams.getAll("categoryId").map((value) => value.trim()).filter(Boolean);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 100)));
  const searchFilters = query ? [
    { name: { contains: query, mode: "insensitive" as const } },
    { description: { contains: query, mode: "insensitive" as const } },
  ] : [];
  const where = {
      ...(categoryIds.length ? { categoryId: { in: categoryIds } } : {}),
      ...(searchFilters.length ? { OR: searchFilters } : {}),
  };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
    include: {
      category: true,
      variants: { include: { prices: true, inventoryItems: true } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const dedupedProducts = dedupeCatalogProducts(products);
  return NextResponse.json({
    products: dedupedProducts,
    page,
    pageSize,
    total,
    hasMore: page * pageSize < total,
    todayAddedCount,
    remainingLimit: Math.max(0, 300 - todayAddedCount),
    dailyLimit: 300,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const body = await request.json().catch(() => ({}));
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id;
  const requestUserId = body.userId || body.ownerId || searchParams.get("userId") || searchParams.get("ownerId") || null;
  const effectiveUserId = sessionUserId || requestUserId;

  if (!effectiveUserId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const action = body.action || "create";

  if (action === "attach") {
    const businessId = String(body.businessId || "");
    const categoryId = String(body.categoryId || "");
    const productIds = Array.isArray(body.productIds) ? body.productIds.map(String) : [];
    if (!businessId || productIds.length === 0) {
      return NextResponse.json({ error: "Business and products are required" }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || (String(business.ownerId) !== String(effectiveUserId) && (session as any)?.user?.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayAddedCount = await prisma.product.count({
      where: { businessId, createdAt: { gte: startOfDay } },
    });
    const remainingLimit = Math.max(0, 300 - todayAddedCount);
    if (remainingLimit <= 0) {
      return NextResponse.json({ error: "Daily limit of 300 products per day reached. Please try again tomorrow." }, { status: 400 });
    }

    const allowedProductIds = productIds.slice(0, remainingLimit);

    if (categoryId) {
      const category = await prisma.category.findFirst({ where: { id: categoryId, businessId } });
      if (!category) return NextResponse.json({ error: "Category does not belong to this business" }, { status: 400 });
      const result = await cloneProductsToBusiness({ businessId, categoryId: category.id, productIds: allowedProductIds, userId: effectiveUserId });
      return NextResponse.json({ attached: result.attached, todayAddedCount: todayAddedCount + result.attached });
    }

    const sourceProducts = await prisma.product.findMany({
      where: {
        id: { in: allowedProductIds },
      },
      include: { category: true },
    });

    let attached = 0;
    for (const product of sourceProducts) {
      const catName = product.category?.name || "General";
      let targetCategory = await prisma.category.findFirst({
        where: { businessId, name: { equals: catName, mode: "insensitive" } },
      });
      if (!targetCategory) {
        targetCategory = await prisma.category.create({
          data: { businessId, name: catName, description: product.category?.description || null },
        });
      }
      const result = await cloneProductsToBusiness({
        businessId,
        categoryId: targetCategory.id,
        productIds: [product.id],
        userId: effectiveUserId,
      });
      attached += result.attached;
    }
    return NextResponse.json({ attached, todayAddedCount: todayAddedCount + attached });
  }

  if (action === "attach-category") {
    const businessId = String(body.businessId || "");
    const categoryId = String(body.categoryId || "");
    const sourceCategoryId = String(body.sourceCategoryId || "");

    if (!businessId || !sourceCategoryId) {
      return NextResponse.json({ error: "Business and source category are required" }, { status: 400 });
    }
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || (String(business.ownerId) !== String(effectiveUserId) && (session as any)?.user?.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayAddedCount = await prisma.product.count({
      where: { businessId, createdAt: { gte: startOfDay } },
    });
    const remainingLimit = Math.max(0, 300 - todayAddedCount);
    if (remainingLimit <= 0) {
      return NextResponse.json({ error: "Daily limit of 300 products per day reached. Please try again tomorrow." }, { status: 400 });
    }

    const sourceCategory = await prisma.category.findUnique({
      where: { id: sourceCategoryId },
      include: {
        products: {
          select: { id: true },
        },
        productCategories: { where: { categoryId: sourceCategoryId }, select: { productId: true } },
      },
    });
    if (!sourceCategory) {
      return NextResponse.json({ error: "Source category was not found" }, { status: 400 });
    }

    const targetCategory = categoryId
      ? await prisma.category.findFirst({ where: { id: categoryId, businessId } })
      : await prisma.category.findFirst({ where: { businessId, name: { equals: sourceCategory.name, mode: "insensitive" } } })
        || await prisma.category.create({ data: { businessId, name: sourceCategory.name, description: sourceCategory.description, image: sourceCategory.image || null } });
    if (!targetCategory) return NextResponse.json({ error: "Store category could not be created" }, { status: 500 });

    const sourceProductIds = [
      ...new Set([
        ...sourceCategory.products.map((product) => product.id),
        ...sourceCategory.productCategories.map((item) => item.productId),
      ]),
    ];

    const allowedProductIds = sourceProductIds.slice(0, remainingLimit);

    // Asynchronously clone products in background so user can navigate away immediately
    cloneProductsToBusiness({
      businessId,
      categoryId: targetCategory.id,
      productIds: allowedProductIds,
      userId: effectiveUserId,
    }).catch((err) => console.error("[attach-category] Background clone error:", err));

    return NextResponse.json({
      attached: allowedProductIds.length,
      categoryId: targetCategory.id,
      categoryName: targetCategory.name,
      todayAddedCount: todayAddedCount + allowedProductIds.length,
      async: true,
    });
  }

  const name = String(body.name || "").trim();
  const price = Number(body.price);
  if (!name || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Name and valid price are required" }, { status: 400 });
  }

  if (!body.categoryId) {
    return NextResponse.json({ error: "Category is required. Every product must belong to a category." }, { status: 400 });
  }

  if (body.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: String(body.categoryId) } });
    if (!category) return NextResponse.json({ error: "Selected category was not found" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: body.description ? String(body.description) : null,
      price,
      costPrice: body.costPrice === "" || body.costPrice == null ? null : Number(body.costPrice),
      images: Array.isArray(body.images) ? body.images.map(String) : [],
      activeIngredients: [],
      for: [],
      creatorId: effectiveUserId,
      ...(Array.isArray(body.variants) && body.variants.length > 0 ? {
        variants: {
          create: body.variants.filter((variant: any) => String(variant?.title || "").trim()).map((variant: any) => ({
            title: String(variant.title).trim(),
            weight: variant.weight ? String(variant.weight) : undefined,
            volume: variant.volume ? String(variant.volume) : undefined,
            prices: {
              create: [{
                amount: Number(variant.price) || 0,
                currencyCode: "ngn",
              }],
            },
          })),
        },
      } : {}),
      categoryId: String(body.categoryId),
    },
  });
  return NextResponse.json(product, { status: 201 });
}