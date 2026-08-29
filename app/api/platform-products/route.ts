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
      OR: [
        { businessId: null },
        { businessId: { isSet: false } },
      ],
    },
    include: {
      variants: { include: { prices: true, inventoryItems: true } },
    },
  });

  let attached = 0;
  for (const product of sourceProducts) {
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
          create: product.variants.map((variant) => ({
            title: variant.title,
            weight: variant.weight,
            volume: variant.volume,
            metadata: variant.metadata,
            allowBackorder: variant.allowBackorder,
            manageInventory: variant.manageInventory,
            stockStatusByRegion: variant.stockStatusByRegion,
            prices: {
              create: variant.prices.map((price) => ({
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
              create: variant.inventoryItems.map((item) => ({
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
  }

  return { attached };
}

export async function GET(request: NextRequest) {
  const { userId } = await getSessionUser();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const searchParams = new URL(request.url).searchParams;
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
  });
}

export async function POST(request: NextRequest) {
  const { session, userId } = await getSessionUser();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const action = body.action || "create";

  if (action === "attach") {
    const businessId = String(body.businessId || "");
    const categoryId = String(body.categoryId || "");
    const productIds = Array.isArray(body.productIds) ? body.productIds.map(String) : [];
    if (!businessId || productIds.length === 0) {
      return NextResponse.json({ error: "Business and products are required" }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || (String(business.ownerId) !== String(userId) && (session as any)?.user?.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (categoryId) {
      const category = await prisma.category.findFirst({ where: { id: categoryId, businessId } });
      if (!category) return NextResponse.json({ error: "Category does not belong to this business" }, { status: 400 });
      const result = await cloneProductsToBusiness({ businessId, categoryId: category.id, productIds, userId });
      return NextResponse.json({ attached: result.attached });
    }

    const sourceProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        OR: [
          { businessId: null },
          { businessId: { isSet: false } },
        ],
      },
      include: { category: true },
    });
    if (sourceProducts.some((product) => !product.category)) {
      return NextResponse.json({ error: "Every selected product must have a platform category" }, { status: 400 });
    }

    const productsByCategory = new Map<string, typeof sourceProducts>();
    for (const product of sourceProducts) {
      const sourceCategory = product.category!;
      const group = productsByCategory.get(sourceCategory.id) || [];
      group.push(product);
      productsByCategory.set(sourceCategory.id, group);
    }

    let attached = 0;
    for (const productsInCategory of productsByCategory.values()) {
      const sourceCategory = productsInCategory[0].category!;
      const targetCategory = await prisma.category.findFirst({
        where: { businessId, name: { equals: sourceCategory.name, mode: "insensitive" } },
      }) || await prisma.category.create({
        data: { businessId, name: sourceCategory.name, description: sourceCategory.description },
      });
      const result = await prisma.product.updateMany({
        where: {
          id: { in: productsInCategory.map((product) => product.id) },
          OR: [
            { businessId: null },
            { businessId: { isSet: false } },
          ],
        },
        data: { businessId, categoryId: targetCategory.id },
      });
      attached += result.count;
    }
    return NextResponse.json({ attached });
  }

  if (action === "attach-category") {
    const businessId = String(body.businessId || "");
    const categoryId = String(body.categoryId || "");
    const sourceCategoryId = String(body.sourceCategoryId || "");
    console.log("[platform-products][attach-category] start", {
      businessId,
      categoryId,
      sourceCategoryId,
      userId,
    });

    if (!businessId || !sourceCategoryId) {
      return NextResponse.json({ error: "Business and source category are required" }, { status: 400 });
    }
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || (String(business.ownerId) !== String(userId) && (session as any)?.user?.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const sourceCategory = await prisma.category.findUnique({
      where: { id: sourceCategoryId },
      include: {
        products: {
          where: {
            OR: [
              { businessId: null },
              { businessId: { isSet: false } },
            ],
          },
          select: { id: true },
        },
        productCategories: { where: { categoryId: sourceCategoryId }, select: { productId: true } },
      },
    });
    if (!sourceCategory || sourceCategory.businessId === businessId) {
      return NextResponse.json({ error: "Source category was not found or already belongs to this business" }, { status: 400 });
    }

    const sourceProductIds = [
      ...new Set([
        ...sourceCategory.products.map((product) => product.id),
        ...sourceCategory.productCategories.map((item) => item.productId),
      ]),
    ];

    console.log("[platform-products][attach-category] source category", {
      sourceCategoryId,
      sourceCategoryName: sourceCategory.name,
      platformProductCount: sourceProductIds.length,
    });

    const targetCategory = categoryId
      ? await prisma.category.findFirst({ where: { id: categoryId, businessId } })
      : await prisma.category.findFirst({ where: { businessId, name: { equals: sourceCategory.name, mode: "insensitive" } } })
        || await prisma.category.create({ data: { businessId, name: sourceCategory.name, description: sourceCategory.description, image: sourceCategory.image || null } });
    if (!targetCategory) return NextResponse.json({ error: "Store category was not found" }, { status: 400 });

    console.log("[platform-products][attach-category] target category", {
      targetCategoryId: targetCategory.id,
      targetCategoryName: targetCategory.name,
      businessId,
    });

    const result = await cloneProductsToBusiness({
      businessId,
      categoryId: targetCategory.id,
      productIds: sourceProductIds,
      userId,
    });

    console.log("[platform-products][attach-category] clone result", {
      count: result.attached,
      businessId,
      sourceCategoryId,
      targetCategoryId: targetCategory.id,
    });

    if (result.attached === 0 && sourceProductIds.length > 0) {
      console.error("[platform-products][attach-category] source products could not be cloned", {
        sourceCategoryId,
        sourceProductCount: sourceProductIds.length,
        businessId,
        targetCategoryId: targetCategory.id,
      });
      return NextResponse.json({ error: "The platform products could not be copied to this business" }, { status: 500 });
    }

    if (result.attached === 0) {
      const existingBusinessCategory = await prisma.category.findFirst({
        where: { businessId, name: { equals: sourceCategory.name, mode: "insensitive" } },
      });

      console.log("[platform-products][attach-category] no products cloned; verifying business category", {
        sourceCategoryName: sourceCategory.name,
        existingBusinessCategoryId: existingBusinessCategory?.id ?? null,
      });

      if (!existingBusinessCategory) {
        const createdCategory = await prisma.category.create({
          data: { businessId, name: sourceCategory.name, description: sourceCategory.description, image: sourceCategory.image || null },
        });
        console.log("[platform-products][attach-category] created fallback business category", {
          createdCategoryId: createdCategory.id,
        });
        return NextResponse.json({ attached: 0, categoryId: createdCategory.id, categoryCreated: true });
      }

      return NextResponse.json({ attached: 0, categoryId: existingBusinessCategory.id, categoryCreated: false });
    }

    return NextResponse.json({ attached: result.attached, categoryId: targetCategory.id, categoryCreated: false });
  }

  const name = String(body.name || "").trim();
  const price = Number(body.price);
  if (!name || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Name and valid price are required" }, { status: 400 });
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
      creatorId: userId,
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
      ...(body.categoryId ? { categoryId: String(body.categoryId) } : {}),
    },
  });
  return NextResponse.json(product, { status: 201 });
}