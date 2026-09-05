"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import cloudinary from "cloudinary";
import { auth } from "@/auth";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PRICE_MARKUPS: Record<string, number> = {
  customer: 1.0,
  professional: 1.0,
  wholesaler: 1.0,
  admin: 1.0,
  supreme: 1.0,
  staff: 1.0,
  visitor: 1.0,
  user: 1.0,
};

const isPlatformManagerRole = (role?: string | null) => role === "admin" || role === "supreme";

// Centralized model mapping
const modelMap: Record<string, any> = {
  business: prisma.business,
  cart: prisma.cart,
  cartItem: prisma.cartItem,
  category: prisma.category,
  coupon: prisma.coupon,
  featuredProduct: prisma.featuredProduct,
  notification: prisma.notification,
  payment: prisma.payment,
  post: prisma.post,
  product: prisma.product,
  refund: prisma.refund,
  review: prisma.review,
  shippingAddress: prisma.shippingAddress,
  stock: prisma.stock,
  user: prisma.user,
  message: prisma.message,
  brand: prisma.brand,
  activeIngredient: prisma.activeIngredient,
  healthConcern: prisma.healthConcern,
  bulkPrice: prisma.bulkPrice,
  // @ts-ignore
  priceFeedback: prisma.priceFeedback,
  deliveryFee: prisma.deliveryFee,
  portfolio: prisma.portfolio,
};

/** Returns sensible SiteSettings defaults based on the chosen store template */
function getSiteSettingsDefaults(businessName: string, template: string) {
  const isPharmacy = template === "pharmacy";

  if (isPharmacy) {
    return {
      aboutText: `${businessName} is a licensed pharmacy dedicated to providing safe, effective, and affordable medicines. We operate in full compliance with NAFDAC regulations.`,
      heroTitle: "Welcome to our Pharmacy",
      heroSubtitle: "Order authentic medications, pharmaceutical products, and medical equipment at the lowest prices, delivered to your doorstep.",
      heroCTA: "Shop Medications",
      heroCTALink: "/store",
      headerCTA: "Order Now",
      footerText: `${businessName} — Your trusted pharmacy partner.`,
      badgeText: "NAFDAC Approved Pharmacy",
      preHeroText: "With a click, get your",
      heroHighlight: "Premium Medical Supplies",
      promoTitle: "Order authentic medications, pharmaceutical products, and medical equipment at the lowest prices, delivered to your doorstep.",
      promoBannerText: "Authentic medical supplies at clearance prices. Limited quantities available — move fast!",
      helpText: "How can we assist you today?",
      newsletterTitle: "Join our Health Newsletter",
      newsletterText: "Be the first to know about new medications, health tips, and exclusive pharmacy offers.",
      animatedTexts: [
        "Order authentic medications online",
        "Consult with expert pharmacists",
        "NAFDAC Approved Pharmacy Products",
        "Track your medical supplies delivery",
        "24/7 Professional Health Support",
        "Manage your prescriptions easily",
      ],
      aboutSub: `We believe that access to safe, effective, and affordable medicines should never be a privilege. ${businessName} is a forward-thinking pharmacy dedicated to solving the complex challenges surrounding medicine access.`,
      whoWeAreText: `${businessName} is owned and managed by licensed Pharmacists with deep expertise in pharmaceutical care, supply chain management, and patient-centered service delivery.`,
      visionText: "To become a trusted digital pharmacy, transforming how medicines are accessed and delivered—one community at a time.",
      promiseText: "From the moment you place an order to the time it arrives at your doorstep, we are committed to delivering a smooth, secure, and memorable experience.",
      whatWeDoText: "We leverage technology to bridge the gap between patients, healthcare professionals, and essential medicines.",
      aiSystemText: "With our AI-powered system, accessing medications has never been easier. Simply upload your prescription and our platform handles verification, sourcing, and fulfillment.",
      integrityText: "Integrity is the foundation of everything we do. Our mission aligns closely with the Nigerian National Drug Policy.",
    };
  }

  // E-store (general) defaults
  return {
    aboutText: `${businessName} is an online store dedicated to bringing you the best products at competitive prices. We are committed to quality, value, and excellent customer service.`,
    heroTitle: `Welcome to ${businessName}`,
    heroSubtitle: "Browse our products and enjoy great deals — delivered right to your door.",
    heroCTA: "Start Shopping",
    heroCTALink: "/store",
    headerCTA: "Shop Now",
    footerText: `${businessName} — Your trusted online store.`,
    badgeText: "Verified Online Store",
    preHeroText: "Discover",
    heroHighlight: "Premium Products",
    promoTitle: "Shop the best products at the best prices, with fast delivery directly to your doorstep.",
    promoBannerText: "Amazing deals on top products. Limited time offer — don't miss out!",
    helpText: "How can we help you today?",
    newsletterTitle: "Join our Newsletter",
    newsletterText: "Be the first to know about new arrivals, restocks, and exclusive offers.",
    animatedTexts: [
      "Shop premium products online",
      "Fast delivery to your doorstep",
      "Exclusive deals every day",
      "Verified quality products",
      "Easy returns and exchanges",
      "24/7 customer support",
    ],
    aboutSub: `At ${businessName}, we are passionate about connecting you with quality products that fit your lifestyle and budget. Every item we stock is carefully selected for quality and value.`,
    whoWeAreText: `${businessName} is a team of passionate individuals dedicated to building the best online shopping experience. We put our customers first in everything we do.`,
    visionText: "To be the most trusted and loved online store in our community, making quality products accessible to everyone.",
    promiseText: "We promise a smooth, secure, and enjoyable shopping experience from the moment you browse to the moment your order arrives.",
    whatWeDoText: "We curate and deliver quality products across a wide range of categories, making it easy for you to find exactly what you need.",
    aiSystemText: "Our smart shopping platform learns your preferences and helps you discover products you'll love, with lightning-fast checkout and delivery tracking.",
    integrityText: "We operate with full transparency and integrity, ensuring every product we sell meets strict quality standards.",
  };
}

function normalizeBusinessRelation(model: string, data: any) {
  if (!data || typeof data !== "object") return data;

  const businessScopedModels = new Set([
    "category",
    "product",
    "coupon",
    "featuredProduct",
    "notification",
    "payment",
    "post",
    "refund",
    "shippingAddress",
    "deliveryFee",
    "cart",
    "review",
    "message",
  ]);

  if (businessScopedModels.has(model) && data.businessId) {
    data.business = { connect: { id: String(data.businessId) } };
    delete data.businessId;
  } else if (businessScopedModels.has(model) && data.businessId === undefined) {
    delete data.businessId;
  }

  if (model === "category") {
    delete data.userId;
    delete data.ownerId;
  }

  return data;
}

function parseJsonValue(value: any, fallback: any = null) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function buildVariantCreates(variants: any[]) {
  return variants.filter((variant) => variant?.title).map((variant) => ({
    title: String(variant.title),
    weight: variant.weight || undefined,
    volume: variant.volume || undefined,
    metadata: variant.metadata || undefined,
    allowBackorder: Boolean(variant.allowBackorder),
    manageInventory: variant.manageInventory !== false,
    stockStatusByRegion: variant.stockStatusByRegion || undefined,
    prices: { create: (variant.prices || []).filter((price: any) => price?.amount !== undefined).map((price: any) => ({
      amount: Number(price.amount) || 0,
      originalAmount: price.originalAmount == null ? undefined : Number(price.originalAmount),
      calculatedAmount: price.calculatedAmount == null ? undefined : Number(price.calculatedAmount),
      currencyCode: price.currencyCode || "ngn",
      isDiscounted: Boolean(price.isDiscounted),
      minQuantity: price.minQuantity == null ? undefined : Number(price.minQuantity),
      maxQuantity: price.maxQuantity == null ? undefined : Number(price.maxQuantity),
      metadata: price.metadata || undefined,
    })) },
    inventoryItems: { create: (variant.inventoryItems || []).map((item: any) => ({
      sku: item.sku || undefined,
      requiredQuantity: item.requiredQuantity == null ? undefined : Number(item.requiredQuantity),
      availableQuantity: item.availableQuantity == null ? undefined : Number(item.availableQuantity),
      deliverableQuantity: item.deliverableQuantity == null ? undefined : Number(item.deliverableQuantity),
      reservedQuantity: item.reservedQuantity == null ? undefined : Number(item.reservedQuantity),
      stockedQuantity: item.stockedQuantity == null ? undefined : Number(item.stockedQuantity),
      minStockLevel: item.minStockLevel == null ? undefined : Number(item.minStockLevel),
      metadata: item.metadata || undefined,
    })) },
  }));
}

function normalizeCatalogValue(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function dedupeCatalogProducts(products: any[]) {
  const seen = new Map<string, any>();

  for (const product of products) {
    const key = `${normalizeCatalogValue(product?.name)}|${normalizeCatalogValue(product?.brand || product?.brandData?.name || "")}|${normalizeCatalogValue(product?.category?.name || "")}|${Number(product?.price ?? 0).toFixed(2)}`;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, product);
      continue;
    }

    const currentIsPlatform = !existing.businessId;
    const incomingIsPlatform = !product.businessId;

    if (currentIsPlatform === incomingIsPlatform) {
      const currentImageCount = Array.isArray(existing.images) ? existing.images.filter(Boolean).length : 0;
      const incomingImageCount = Array.isArray(product.images) ? product.images.filter(Boolean).length : 0;
      if (incomingImageCount > currentImageCount) seen.set(key, product);
      continue;
    }

    if (incomingIsPlatform) seen.set(key, product);
  }

  return [...seen.values()];
}

function dedupeCatalogCategories(categories: any[]) {
  const seen = new Map<string, any>();

  for (const category of categories) {
    const businessKey = category?.businessId ? String(category.businessId) : "platform";
    const key = `${businessKey}|${normalizeCatalogValue(category?.name)}`;
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

    if (incomingIsPlatform) seen.set(key, category);
  }

  return [...seen.values()];
}

// =====================
// Utilities
// =====================
function parseId(id: string | null, model: string) {
  if (!id) return null;
  return ["user", "category", "product", "brand"].includes(model) ? id : Number(id);
}

async function canManageBusinessResource(session: any, model: string | null, businessId?: string | null, userId?: string | null) {
  const role = (session?.user as any)?.role || "visitor";
  const sessionUserId = (session?.user as any)?.id;
  const isPlatformManager = isPlatformManagerRole(role);

  if (isPlatformManager) return true;
  if (role === "staff") {
    const effectiveUserId = sessionUserId ?? userId ?? null;
    if (!businessId || !effectiveUserId) return false;
    const staffMembership = await prisma.staff.findFirst({
      where: { userId: String(effectiveUserId), businessId: String(businessId), status: "accepted" },
    });
    return Boolean(staffMembership);
  }

  const businessScopedModels = new Set([
    "category",
    "product",
    "coupon",
    "featuredProduct",
    "notification",
    "payment",
    "post",
    "refund",
    "shippingAddress",
    "deliveryFee",
    "cart",
    "review",
    "message",
  ]);

  if (!businessScopedModels.has(model || "") || !businessId) return false;

  const business = await prisma.business.findUnique({
    where: { id: String(businessId) },
    select: { ownerId: true },
  });

  if (!business) return false;

  const ownerIdStr = String(business.ownerId);
  if (sessionUserId && String(sessionUserId) === ownerIdStr) return true;
  if (userId && String(userId) === ownerIdStr) return true;

  return false;
}

async function handleUpload(file: File | string) {
  let dataURI = typeof file === "string" ? file : "";
  if (typeof file !== "string") {
    const buffer = await file.arrayBuffer();
    const b64 = Buffer.from(buffer).toString("base64");
    dataURI = `data:${file.type};base64,${b64}`;
  }
  return await cloudinary.v2.uploader.upload(dataURI, { resource_type: "auto" });
}

// ==================== GET ====================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const model = searchParams.get("model");
  const id = parseId(searchParams.get("id"), model || "");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");
  const minimal = searchParams.get("minimal") === "true";
  const session = await auth();

  if (!model || !modelMap[model]) return NextResponse.json({ error: "Invalid model" }, { status: 400 });

  const prismaModel = modelMap[model];
  const businessId = searchParams.get("businessId");

  // Storefront reads for a business's catalog are intentionally public.
  // Ownership/authorization checks remain enforced on mutation endpoints and on
  // single-item admin access paths; this prevents logged-in shoppers or store
  // visitors from being blocked when the home/store pages fetch categories and
  // products for a business.

  try {
    if (!id) {
      if (model === "business") {
        const includeArchived = searchParams.get("includeArchived") === "true";
        const where: any = {};
        if (!includeArchived) where.isArchived = false;

        const businesses = await prisma.business.findMany({
          where,
          take: Math.min(limit, 12),
          skip: offset,
          orderBy: [{ ratings: 'desc' as const }, { createdAt: 'desc' as const }],
          include: { siteSettings: { select: { storefrontImageUrl: true, address: true, physicalLocation: true, operatingStates: true, maxOrdersPerDay: true } } },
        });

        const ownerIds = businesses.map(b => b.ownerId).filter(Boolean);
        const owners = await prisma.user.findMany({
          where: { id: { in: ownerIds } },
          select: { id: true, name: true, image: true, email: true }
        });

        const ownerMap = new Map(owners.map(o => [o.id, o]));
        const result = businesses.map(b => ({
          ...b,
          owner: ownerMap.get(b.ownerId) || { name: "Anonymous User", image: null, email: null }
        }));

        return NextResponse.json(result);
      }

      if (model === "featuredProduct") {
        const where: any = {};
        if (businessId) where.businessId = businessId;
        return NextResponse.json(await prisma.featuredProduct.findMany({
          take: limit,
          skip: offset,
          where,
          include: { 
            product: { 
              include: { 
                category: true, 
                stock: !minimal, 
                business: true,
                reviews: false // Never load reviews for lists
              } 
            } 
          },
        }));
      }

      if (model === "review" || model === "post") {
        const where: any = {};
        if (businessId) where.businessId = businessId;
        const rows = await prismaModel.findMany({
          where,
          take: limit,
          skip: offset,
          include: { user: { select: { id: true, email: true, name: true, image: true } } },
          orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(rows.map((row: any) => ({
          ...row,
          user: row.user ? { ...row.user, avatarUrl: row.user.image || null } : null,
        })));
      }

      if (model === "category") {
        const where: any = {};
        if (businessId) where.businessId = businessId;
        if (searchParams.get("platform") === "true") where.businessId = null;

        if (minimal) {
          const categories = await prisma.category.findMany({
            take: limit,
            skip: offset,
            where,
            select: {
              id: true,
              name: true,
              description: true,
              businessId: true,
              _count: { select: { products: true } },
              business: { select: { id: true, name: true } },
            }
          });
          return NextResponse.json(dedupeCatalogCategories(categories));
        }

        const categories = await prisma.category.findMany({
          take: limit,
          skip: offset,
          where,
          include: { 
            products: { take: 3, select: { images: true } },
            productCategories: { take: 3, include: { product: { select: { id: true, name: true, images: true } } } },
            _count: { select: { products: true } },
            business: { include: { siteSettings: { select: { address: true, physicalLocation: true, operatingStates: true } } } },
          }
        });
        return NextResponse.json(dedupeCatalogCategories(categories));
      }

      if (model === "product") {
        const brand = searchParams.get("brand");
        const categoryId = searchParams.get("categoryId");
        const categoryName = searchParams.get("categoryName");
        const concern = searchParams.get("concern");
        const minPriceValue = searchParams.get("minPrice");
        const maxPriceValue = searchParams.get("maxPrice");
        const minPrice = minPriceValue === null ? Number.NaN : Number(minPriceValue);
        const maxPrice = maxPriceValue === null ? Number.NaN : Number(maxPriceValue);
        const location = searchParams.get("location");
        const businessId = searchParams.get("businessId");
        const includeParams = searchParams.get("include")?.split(",");
        
        const where: any = {};
        if (businessId) where.businessId = businessId;
        if (brand) {
          where.OR = [
            { brand: { equals: brand.trim(), mode: 'insensitive' } },
            { brandData: { name: { equals: brand.trim(), mode: 'insensitive' } } },
          ];
        }
        if (categoryId) where.categoryId = categoryId;
        if (categoryName && categoryName.trim().toLowerCase() !== "all") {
          const categoryNames = categoryName.split(",").map((name) => name.trim()).filter(Boolean);
          if (categoryNames.length > 0) {
            where.category = categoryNames.length > 1
              ? { name: { in: categoryNames, mode: 'insensitive' } }
              : { name: { equals: categoryNames[0], mode: 'insensitive' } };
          }
        }
        if (Number.isFinite(minPrice)) where.price = { ...(where.price || {}), gte: Math.max(0, minPrice) };
        if (Number.isFinite(maxPrice)) where.price = { ...(where.price || {}), lte: Math.max(0, maxPrice) };
        if (location) {
          const locations = location.split("|").map((item) => item.trim()).filter(Boolean);
          if (locations.length) {
            where.business = {
              siteSettings: {
                is: { operatingStates: locations.length > 1 ? { hasSome: locations } : { has: locations[0] } },
              },
            };
          }
        }
        if (concern) where.category = { name: { equals: concern.trim(), mode: 'insensitive' } };

        const searchQuery = searchParams.get("query")?.trim();
        if (searchQuery) {
          where.OR = [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { brand: { contains: searchQuery, mode: 'insensitive' } },
            { brandData: { name: { contains: searchQuery, mode: 'insensitive' } } },
            { category: { name: { contains: searchQuery, mode: 'insensitive' } } },
            { activeIngredients: { has: searchQuery } },
          ];
        }

        if (searchParams.get("requireImages") === "true") {
          where.images = { isEmpty: false };
        }
        if (searchParams.get("requirePrice") === "true") {
          where.price = { gt: 0 };
        }

        const include: any = {};
        const includeMap: Record<string, any> = {
          category: { category: true },
          categories: { productCategories: { include: { category: true } } },
          variants: { variants: { include: { prices: true, inventoryItems: true } } },
          brand: { brandData: true },
          stock: { stock: true },
          activeIngredients: { activeIngredientRefs: true },
          healthConcerns: { healthConcerns: true },
        };

        if (includeParams) {
          includeParams.forEach((inc) => {
            const mapped = includeMap[inc];
            if (mapped) {
              Object.assign(include, mapped);
            }
          });
        } else if (!minimal) {
          include.category = true;
          include.productCategories = { include: { category: true } };
          include.stock = true;
          include.variants = { include: { prices: true, inventoryItems: true } };
          include.brandData = true;
          include.activeIngredientRefs = true;
          include.healthConcerns = true;
        } else {
          include.category = true;
        }

        // Lightweight business include for store-scoped product queries to reduce JSON payload footprint
        if (businessId) {
          include.business = { select: { id: true, name: true } };
        } else {
          include.business = { include: { siteSettings: { select: { address: true, physicalLocation: true, operatingStates: true } } } };
        }

        // For category diversity across pages, perform category-interleaved fetching when listing storefront products
        const isFilteredSingleCategory = Boolean(categoryId || categoryName || concern);
        
        if (!isFilteredSingleCategory) {
          const allLightProducts = await prisma.product.findMany({
            where,
            select: { id: true, categoryId: true, createdAt: true },
            orderBy: { createdAt: 'desc' as const },
          });

          const categoryGroups = new Map<string, typeof allLightProducts>();
          for (const p of allLightProducts) {
            const catKey = p.categoryId || "uncategorized";
            if (!categoryGroups.has(catKey)) categoryGroups.set(catKey, []);
            categoryGroups.get(catKey)!.push(p);
          }

          const groupArrays = Array.from(categoryGroups.values());
          let maxLen = 0;
          for (const arr of groupArrays) {
            if (arr.length > maxLen) maxLen = arr.length;
          }

          const interleavedIds: string[] = [];
          for (let i = 0; i < maxLen; i++) {
            for (const arr of groupArrays) {
              if (i < arr.length) {
                interleavedIds.push(arr[i].id);
              }
            }
          }

          const total = interleavedIds.length;
          const pageIds = interleavedIds.slice(offset, offset + Math.min(limit, 100));

          if (pageIds.length === 0) {
            if (searchParams.get("pagination") === "true") {
              return NextResponse.json({ data: [], total: 0 });
            }
            return NextResponse.json([]);
          }

          const pageProducts = await prisma.product.findMany({
            where: { id: { in: pageIds } },
            include: Object.keys(include).length > 0 ? include : undefined,
          });

          const productMap = new Map(pageProducts.map((p) => [p.id, p]));
          const orderedProducts = pageIds.map((id) => productMap.get(id)).filter(Boolean);
          const finalProducts = dedupeCatalogProducts(orderedProducts);

          if (searchParams.get("pagination") === "true") {
            return NextResponse.json({ data: finalProducts, total });
          }

          return NextResponse.json(finalProducts);
        }

        const query = {
          where,
          include: Object.keys(include).length > 0 ? include : undefined,
          take: Math.min(limit, 5000),
          skip: offset,
          orderBy: { createdAt: 'desc' as const }
        };

        if (searchParams.get("pagination") === "true") {
          const [data, total] = await Promise.all([
            prisma.product.findMany(query),
            prisma.product.count({ where })
          ]);
          return NextResponse.json({ data: dedupeCatalogProducts(data), total });
        }

        return NextResponse.json(dedupeCatalogProducts(await prisma.product.findMany(query)));
      }

      if (model === "portfolio") {
        const query = searchParams.get("query")?.trim();
        const jobType = searchParams.get("jobType");
        const requestedUserId = searchParams.get("userId");
        const where: any = {};

        if (requestedUserId) {
          where.userId = requestedUserId;
        }

        const defaultFilter = searchParams.get("isDefault");
        if (!requestedUserId || defaultFilter !== null) {
          where.isDefault = defaultFilter === "true";
        }

        if (jobType === "accepting" || jobType === "giving") {
          where.jobType = jobType;
        }
        if (query) {
          where.OR = [
            { job: { contains: query, mode: "insensitive" } },
            { jobDescription: { contains: query, mode: "insensitive" } },
            { user: { name: { contains: query, mode: "insensitive" } } },
          ];
        }

        const take = Math.min(Math.max(limit, 1), 20);
        const [data, total] = await Promise.all([
          prisma.portfolio.findMany({
            where,
            take,
            skip: Math.max(offset, 0),
            orderBy: { createdAt: "desc" },
            include: { user: { select: { id: true, name: true, image: true } } },
          }),
          prisma.portfolio.count({ where }),
        ]);

        return searchParams.get("pagination") === "true"
          ? NextResponse.json({ data, total })
          : NextResponse.json(data);
      }

      if (model === "category") {
        return NextResponse.json(await prisma.category.findMany({
          take: limit,
          include: { _count: { select: { products: true } } },
          orderBy: { name: 'asc' }
        }));
      }

      if (model === "brand") {
        return NextResponse.json(await prisma.brand.findMany({
          take: limit,
          include: { _count: { select: { products: true } } },
          orderBy: { order: 'asc' }
        }));
      }

      if (model === "activeIngredient") {
        return NextResponse.json(await prisma.activeIngredient.findMany({
          take: limit,
          include: { _count: { select: { products: true } } },
          orderBy: { name: 'asc' }
        }));
      }

      if (model === "healthConcern") {
        return NextResponse.json(await prisma.healthConcern.findMany({
          take: limit,
          include: { _count: { select: { products: true } } },
          orderBy: { name: 'asc' }
        }));
      }

      if (model === "bulkPrice") {
        return NextResponse.json(await prisma.bulkPrice.findMany({
          take: limit,
          include: { product: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }));
      }

      const userId = searchParams.get("userId");
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const status = searchParams.get("status"); // CSV support
      const where: any = {};

      if (businessId && ["coupon", "deliveryFee", "featuredProduct", "notification", "payment", "post", "refund", "shippingAddress", "cart", "review", "message", "product", "category"].includes(model)) {
        where.businessId = businessId;
      }
      if (userId) where.userId = userId;
      if (model === "coupon" && code) where.code = code;
      if (model === "deliveryFee" && state) where.state = state;
      
      if (model === "cart" && status) {
          where.status = { in: status.split(",").map(s => s.trim()) };
      }

      if (model === "cart") {
          return NextResponse.json(await prisma.cart.findMany({
              where,
              include: {
                  user: { select: { id: true, email: true, name: true, contact: true } },
                  products: { include: { product: true } },
                  payment: true,
                  refund: true,
              },
              take: limit,
              skip: offset,
              orderBy: { createdAt: 'desc' }
          }));
      }

      return NextResponse.json(await prismaModel.findMany({ 
        where, 
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      }));
    } else {
      // Single item fetch
      const include: any = {};
      if (model === "product") {
        include.category = true;
        include.productCategories = { include: { category: true } };
        include.stock = true;
        include.variants = { include: { prices: true, inventoryItems: true } };
        include.brandData = true;
        include.activeIngredientRefs = true;
        include.healthConcerns = true;
        include.reviews = { include: { user: { select: { name: true, image: true } } } };
        include.business = true;
      }

      if (model === "category") {
        include.business = true;
      }

      if (model === "cart") {
          include.user = { select: { id: true, email: true, name: true, contact: true, addresses: true } };
          include.products = { include: { product: true } };
          include.payment = true;
          include.refund = true;
      }
      
      const item = await prismaModel.findUnique({ 
        where: { id },
        include: Object.keys(include).length > 0 ? include : undefined
      });
      if (!item) return NextResponse.json({ error: "Document not found" }, { status: 404 });

      if ((model === "product" || model === "category") && item?.businessId) {
        const requestedBusinessId = searchParams.get("businessId");
        if (requestedBusinessId && String(item.businessId) !== String(requestedBusinessId)) {
          return NextResponse.json({ error: "This record does not belong to the current business" }, { status: 403 });
        }

        if (session?.user?.id && !isPlatformManagerRole((session.user as any)?.role)) {
          const canAccessBusiness = await canManageBusinessResource(session, model, item.businessId, null);
          if (!canAccessBusiness) {
            return NextResponse.json({ error: "Unauthorized access to this business" }, { status: 403 });
          }
        }
      }

      if (model === "product" && item.reviews) {
        item.reviews = item.reviews.map((review: any) => ({
          ...review,
          user: review.user ? {
            ...review.user,
            avatarUrl: review.user.image || null,
          } : null,
        }));
      }

      return NextResponse.json(item);
    }
  } catch (error) {
    console.error("Database GET error:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

// ==================== POST ====================
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const model = searchParams.get("model");
  const session = await auth();

  if (!model || !modelMap[model]) return NextResponse.json({ error: "Invalid model" }, { status: 400 });

  const prismaModel = modelMap[model];
  const contentType = req.headers.get("content-type") || "";
  let body: any = {};

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const filesByField: Record<string, File[]> = {};

    ["file", "images", "cvDocuments", "certificationDocuments", "documents", "portfolioImages"]
      .forEach((field) => {
        const values = formData.getAll(field) as File[];
        const validFiles = values.filter((file) => file && typeof (file as File).size === "number" && (file as File).size > 0);
        if (validFiles.length > 0) filesByField[field] = validFiles;
      });

    for (const [field, files] of Object.entries(filesByField)) {
      const urls: string[] = [];
      for (const file of files) {
        const uploadRes = await handleUpload(file);
        urls.push(uploadRes.url);
      }
      if (field === "file" || field === "images" || field === "portfolioImages") {
        body.images = [...(body.images || []), ...urls];
      }
      if (field === "cvDocuments") {
        body.cvDocuments = [...(body.cvDocuments || []), ...urls];
      }
      if (field === "certificationDocuments" || field === "documents") {
        body.certificationDocuments = [...(body.certificationDocuments || []), ...urls];
      }
      if (model === "product") body.images = urls;
      if (model === "user") { body.image = urls[0]; delete body.images; }
      if (model === "category") { body.image = urls[0]; delete body.images; }
      if (model === "post") { body.contentUrl = urls[0]; delete body.images; }
    }

    formData.forEach((value, key) => {
      if (["file", "images", "cvDocuments", "certificationDocuments", "documents", "portfolioImages"].includes(key)) return;
      body[key] = value;
    });
  } else {
    body = await req.json();
  }

  const protectedModels = ["product", "category", "featuredProduct", "stock", "coupon", "brand", "post"];

  if (model === "portfolio") {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in before creating a job profile." }, { status: 401 });
    }
    body.userId = String((session.user as any).id);
  }

  const businessId = body?.businessId || body?.business?.id || body?.business?.connect?.id || null;
  const requestUserId = body?.userId || body?.ownerId || searchParams.get("userId") || searchParams.get("ownerId") || null;
  body = normalizeBusinessRelation(model, body);
  const canManage = protectedModels.includes(model || "")
    ? await canManageBusinessResource(session, model, businessId, requestUserId)
    : true;

  if (protectedModels.includes(model || "") && !canManage) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  if (model === "product" && (session?.user as any)?.role === "staff") {
    const membership = await prisma.staff.findFirst({
      where: { userId: String((session?.user as any)?.id), businessId: String(businessId || ""), status: "accepted" },
    });
    if (!membership) return NextResponse.json({ error: "Staff access is not approved for this business" }, { status: 403 });
  }

  try {
    if (model === "business") {
      const businessName = (body.name || "").toString().trim();
      if (!businessName) {
        return NextResponse.json({ error: "Business name is required" }, { status: 400 });
      }

      const normalizedTemplate = (body.template || "estore").toString().toLowerCase() === "pharmacy" ? "pharmacy" : "estore";

      const business = await prisma.business.create({
        data: {
          name: businessName,
          description: (body.description || `Welcome to ${businessName}`).toString(),
          ownerId: body.ownerId,
          template: normalizedTemplate,
        },
      });

      await Promise.all([
        prisma.projectSettings.create({
          data: { businessId: business.id, currency: "NGN", exchangeRate: 1.0 },
        }),
        prisma.siteSettings.create({
          data: {
            businessId: business.id,
            ...getSiteSettingsDefaults(businessName, normalizedTemplate),
          },
        }),
      ]);

      return NextResponse.json(business);
    }

    if (model === "cart") {
      const { userId, products, status } = body;
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: products.map((p: any) => p.productId).filter(Boolean) } },
        select: { id: true, price: true, bulkPrices: true },
      });

      let total = 0;
      let userRole = "customer";
      if (userId && userId !== "nil") {
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (dbUser) userRole = dbUser.role;
      }
      const markup = PRICE_MARKUPS[userRole] || 1.0;

      products.forEach((item: any) => {
        if (item.productId?.startsWith("special-")) {
            total += (item.customPrice || 0) * item.quantity;
            return;
        }
        
        const found = dbProducts.find((p) => p.id === item.productId);
        if (found) {
            let itemPrice = found.price;
            if (item.bulkPriceId) {
                const bulk = found.bulkPrices.find(b => b.id === item.bulkPriceId);
                if (bulk) itemPrice = bulk.price;
            }
            total += (itemPrice * markup) * item.quantity;
        }
      });

      return NextResponse.json(await prisma.cart.create({
        data: {
          userId,
          total,
          status: status || "pending",
          products: { 
            create: products.map((p: any) => ({ 
              productId: p.productId && !p.productId.startsWith('special-') ? p.productId : null, 
              quantity: p.quantity,
              customName: p.customName || (p.productId?.startsWith('special-') ? p.name : null),
              customPrice: p.customPrice,
              bulkPriceId: p.bulkPriceId,
              isSpecial: !!p.isSpecial || p.productId?.startsWith('special-')
            })) 
          },
        },
        include: { products: true },
      }));
    }

    if (model === "user" && body.password) {
      body.password = await bcrypt.hash(body.password, await bcrypt.genSalt());
    }

    if (model === "portfolio") {
      const jobType = body.jobType === "giving" ? "giving" : "accepting";
      const limit = jobType === "giving" ? 10 : 3;
      const portfolioCount = await prisma.portfolio.count({
        where: {
          userId: String(body.userId),
          isDefault: false,
          ...(jobType === "accepting"
            ? { OR: [{ jobType: "accepting" }, { jobType: null }] }
            : { jobType }),
        },
      });
      if (portfolioCount >= limit) {
        return NextResponse.json({
          error: `You can create up to ${limit} ${jobType} job profiles per account.`,
        }, { status: 400 });
      }
      body.jobType = jobType;
      if (body.isDefault === "true") body.isDefault = true;
      if (body.isDefault === "false") body.isDefault = false;

      if (body.contactCount !== undefined) {
        body.contactCount = Number(body.contactCount) || 0;
      }

      if (body.activatedAt) {
        body.activatedAt = new Date(body.activatedAt);
      }
      if (body.activationExpiresAt) {
        body.activationExpiresAt = new Date(body.activationExpiresAt);
      }
    }

    // Parsing
    if (body.price) body.price = parseFloat(body.price);
    ['requiresPrescription', 'scarce', 'isRead'].forEach(field => {
       if (body[field] === "true") body[field] = true;
       if (body[field] === "false") body[field] = false;
    });

    if (model === "product") {
      const parsedCatIds = parseJsonValue(body.categoryIds, []);
      const hasCatId = body.categoryId && String(body.categoryId).trim() !== "" && String(body.categoryId) !== "null";
      const hasCatIds = Array.isArray(parsedCatIds) && parsedCatIds.filter(Boolean).length > 0;

      if (!hasCatId && !hasCatIds) {
        return NextResponse.json({ error: "Category is required. Every product must belong to a category." }, { status: 400 });
      }

      if (typeof body.brand === "string") {
        body.brand = body.brand.trim();
        if (!body.brand) delete body.brand;
      } else if (body.brand !== undefined) {
        delete body.brand;
      }

      if (Array.isArray(body.activeIngredients)) {
        body.activeIngredients = body.activeIngredients.map((name: any) => String(name).trim()).filter(Boolean);
      } else if (typeof body.activeIngredients === "string") {
        body.activeIngredients = body.activeIngredients.split(",").map((name: string) => name.trim()).filter(Boolean);
      } else {
        delete body.activeIngredients;
      }

      if (Array.isArray(body.healthConcerns)) {
        const concerns = body.healthConcerns.map((name: any) => String(name).trim()).filter(Boolean);
        body.healthConcerns = concerns.length > 0
          ? { connectOrCreate: concerns.map((name: string) => ({ where: { name }, create: { name } })) }
          : undefined;
      } else if (typeof body.healthConcerns === "string") {
        const concerns = body.healthConcerns.split(",").map((name: string) => name.trim()).filter(Boolean);
        body.healthConcerns = concerns.length > 0
          ? { connectOrCreate: concerns.map((name: string) => ({ where: { name }, create: { name } })) }
          : undefined;
      }

      body.shortDescription = body.shortDescription || undefined;
      body.barcode = body.barcode || undefined;
      body.volume = body.volume || undefined;
      body.tags = Array.isArray(body.tags) ? body.tags : parseJsonValue(body.tags, []);
      body.metadata = parseJsonValue(body.metadata, null);
      body.categoryIds = parsedCatIds;
      body.variants = parseJsonValue(body.variants, []);

      if (Array.isArray(body.categoryIds) && body.categoryIds.length > 0) {
        body.productCategories = { create: body.categoryIds.filter(Boolean).map((categoryId: string) => ({ category: { connect: { id: String(categoryId) } } })) };
      }
      delete body.categoryIds;

      if (Array.isArray(body.variants)) {
        body.variants = { create: buildVariantCreates(body.variants) };
      }

      if (Array.isArray(body.bulkPrices)) {
        body.bulkPrices = {
          create: body.bulkPrices.map((bp: any) => ({
            name: bp.name,
            quantity: parseInt(bp.quantity),
            price: parseFloat(bp.price)
          }))
        };
      }
    }

    return NextResponse.json(await prismaModel.create({ data: body }));
  } catch (error) {
    console.error("Database POST error:", error);
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}

// ==================== PUT ====================
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const model = searchParams.get("model");
  const session = await auth();

  if (!model || !modelMap[model]) return NextResponse.json({ error: "Invalid model" }, { status: 400 });

  const prismaModel = modelMap[model];
  const contentType = req.headers.get("content-type") || "";
  let body: any = {};

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const filesByField: Record<string, File[]> = {};

    ["file", "images", "cvDocuments", "certificationDocuments", "documents", "portfolioImages"]
      .forEach((field) => {
        const values = formData.getAll(field) as File[];
        const validFiles = values.filter((file) => file && typeof (file as File).size === "number" && (file as File).size > 0);
        if (validFiles.length > 0) filesByField[field] = validFiles;
      });

    for (const [field, files] of Object.entries(filesByField)) {
      const urls: string[] = [];
      for (const file of files) {
        const uploadRes = await handleUpload(file);
        urls.push(uploadRes.url);
      }

      if (field === "file" || field === "images" || field === "portfolioImages") {
        body.images = [...(body.images || []), ...urls];
      }
      if (field === "cvDocuments") {
        body.cvDocuments = [...(body.cvDocuments || []), ...urls];
      }
      if (field === "certificationDocuments" || field === "documents") {
        body.certificationDocuments = [...(body.certificationDocuments || []), ...urls];
      }
      if (model === "product") body.images = urls;
      if (model === "user") { body.image = urls[0]; delete body.images; }
      if (model === "category") { body.image = urls[0]; delete body.images; }
      if (model === "post") { body.contentUrl = urls[0]; delete body.images; }
    }

    formData.forEach((value, key) => {
      if (["file", "images", "cvDocuments", "certificationDocuments", "documents", "portfolioImages"].includes(key)) return;
      body[key] = value;
    });
  } else {
    body = await req.json();
  }

  const businessId = body?.businessId || body?.business?.id || null;
  const requestUserId = body?.userId || body?.ownerId || searchParams.get("userId") || searchParams.get("ownerId") || null;
  const canManage = model === "user"
    ? true
    : await canManageBusinessResource(session, model, businessId, requestUserId);

  if (model !== "user" && !canManage) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  if (model === "business" && session?.user && isPlatformManagerRole((session.user as any)?.role)) {
    // Supreme/admin users can create platform-level data and manage all businesses.
  }

  if ((model === "product" || model === "category") && !businessId) {
    const existing = await prismaModel.findUnique({ where: { id: String(parseId(body.id || searchParams.get("id"), model)) }, select: { businessId: true } }).catch(() => null);
    if (!existing?.businessId) {
      return NextResponse.json({ error: "Business-scoped updates require a valid business" }, { status: 403 });
    }
    if (!isPlatformManagerRole((session?.user as any)?.role) && !(await canManageBusinessResource(session, model, existing.businessId, null))) {
      return NextResponse.json({ error: "Unauthorized access to this business" }, { status: 403 });
    }
  }

  if (model !== "user" && (session?.user as any)?.role === "staff") {
    return NextResponse.json({ error: "Staff accounts cannot update records" }, { status: 403 });
  }

  // Support for bulk brand reordering
  if (model === "brand" && Array.isArray(body)) {
    try {
      const updates = body.map((item: any) => 
        prisma.brand.update({
          where: { id: item.id },
          data: { order: parseInt(item.order) || 0 }
        })
      );
      await prisma.$transaction(updates);
      return NextResponse.json({ success: true, count: updates.length });
    } catch (error) {
      console.error("Bulk update error:", error);
      return NextResponse.json({ error: "Bulk update failed" }, { status: 500 });
    }
  }

  const id = parseId(body.id || searchParams.get("id"), model);
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const existingRecord = (model === "product" || model === "category")
    ? await prismaModel.findUnique({
        where: { id: String(id) },
        select: { businessId: true },
      }).catch(() => null)
    : null;

  const { id: _, ...updatedData } = body;
  normalizeBusinessRelation(model, updatedData);

  if ((model === "product" || model === "category") && existingRecord?.businessId) {
    const effectiveBusinessId = (updatedData.businessId || updatedData.business?.id || existingRecord.businessId || null);
    if (String(effectiveBusinessId) !== String(existingRecord.businessId)) {
      return NextResponse.json({ error: "This record does not belong to the current business" }, { status: 403 });
    }

    if (!isPlatformManagerRole((session?.user as any)?.role) && !(await canManageBusinessResource(session, model, existingRecord.businessId, null))) {
      return NextResponse.json({ error: "Unauthorized access to this business" }, { status: 403 });
    }
  }

  if (updatedData.isRead === "true") updatedData.isRead = true;
  if (updatedData.isRead === "false") updatedData.isRead = false;

  if (model === "portfolio") {
    const uploadLimit = 3;
    const normalizeArray = (value: any) => {
      if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
      if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
      return [];
    };

    if (updatedData.images !== undefined) {
      const images = normalizeArray(updatedData.images);
      if (images.length > uploadLimit) {
        return NextResponse.json({ error: "Portfolio images cannot exceed 3 files." }, { status: 400 });
      }
      updatedData.images = images;
    }

    if (updatedData.cvDocuments !== undefined) {
      const cvDocuments = normalizeArray(updatedData.cvDocuments);
      if (cvDocuments.length > uploadLimit) {
        return NextResponse.json({ error: "CV documents cannot exceed 3 files." }, { status: 400 });
      }
      updatedData.cvDocuments = cvDocuments;
    }

    if (updatedData.certificationDocuments !== undefined) {
      const certDocuments = normalizeArray(updatedData.certificationDocuments);
      if (certDocuments.length > uploadLimit) {
        return NextResponse.json({ error: "Certification documents cannot exceed 3 files." }, { status: 400 });
      }
      updatedData.certificationDocuments = certDocuments;
    }

    if (updatedData.contactCount !== undefined) {
      updatedData.contactCount = Number(updatedData.contactCount) || 0;
    }

    if (updatedData.isDefault === "true") updatedData.isDefault = true;
    if (updatedData.isDefault === "false") updatedData.isDefault = false;

    if (updatedData.activatedAt) {
      updatedData.activatedAt = new Date(updatedData.activatedAt);
    }
    if (updatedData.activationExpiresAt) {
      updatedData.activationExpiresAt = new Date(updatedData.activationExpiresAt);
    }
  }

  if (model === "product") {
    updatedData.shortDescription = updatedData.shortDescription || undefined;
    updatedData.barcode = updatedData.barcode || undefined;
    updatedData.volume = updatedData.volume || undefined;
    updatedData.tags = Array.isArray(updatedData.tags) ? updatedData.tags : parseJsonValue(updatedData.tags, []);
    updatedData.metadata = parseJsonValue(updatedData.metadata, null);
    const categoryIds = parseJsonValue(updatedData.categoryIds, undefined);
    delete updatedData.categoryIds;
    if (Array.isArray(categoryIds)) {
      updatedData.productCategories = {
        deleteMany: {},
        create: categoryIds.filter(Boolean).map((categoryId: string) => ({ category: { connect: { id: String(categoryId) } } })),
      };
    }
    const variants = parseJsonValue(updatedData.variants, undefined);
    if (Array.isArray(variants)) {
      updatedData.variants = { deleteMany: {}, create: buildVariantCreates(variants) };
    }
    if (updatedData.brand !== undefined) {
      if (updatedData.brand) {
        updatedData.brand = { connectOrCreate: { where: { name: updatedData.brand }, create: { name: updatedData.brand } } };
      } else {
        updatedData.brand = { disconnect: true };
      }
    }
    if (updatedData.category !== undefined || updatedData.categoryId !== undefined) {
      const categoryValue = updatedData.category || updatedData.categoryId;
      if (categoryValue) {
        // If it's already an ID (ObjectId), connect directly
        if (typeof categoryValue === 'string' && categoryValue.match(/^[0-9a-fA-F]{24}$/)) {
          updatedData.category = { connect: { id: categoryValue } };
        } else {
          // Otherwise treat as name and connectOrCreate
          updatedData.category = { connectOrCreate: { where: { name: categoryValue }, create: { name: categoryValue } } };
        }
      } else {
        updatedData.category = { disconnect: true };
      }
      // Remove categoryId to avoid conflicts
      delete updatedData.categoryId;
    }
    if (updatedData.images !== undefined) {
      if (Array.isArray(updatedData.images)) {
        updatedData.images = updatedData.images.map((item: any) => String(item).trim()).filter(Boolean);
      } else if (typeof updatedData.images === 'string') {
        updatedData.images = updatedData.images.trim() ? [updatedData.images.trim()] : [];
      } else {
        delete updatedData.images;
      }
    }
    if (Array.isArray(updatedData.activeIngredients)) {
      updatedData.activeIngredients = { set: [], connectOrCreate: updatedData.activeIngredients.map((name: string) => ({ where: { name }, create: { name } })) };
    }
    if (Array.isArray(updatedData.healthConcerns)) {
      updatedData.healthConcerns = { set: [], connectOrCreate: updatedData.healthConcerns.map((name: string) => ({ where: { name }, create: { name } })) };
    }
    if (Array.isArray(updatedData.bulkPrices)) {
      updatedData.bulkPrices = {
        deleteMany: {},
        create: updatedData.bulkPrices.map((bp: any) => ({
          name: bp.name,
          quantity: parseInt(bp.quantity),
          price: parseFloat(bp.price)
        }))
      };
    }
  }
  try {
    return NextResponse.json(await prismaModel.update({
      where: { id: String(id) },
      data: updatedData,
    }));
  } catch (error) {
    console.error("Database PUT error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ==================== DELETE ====================
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const model = searchParams.get("model");
  const id = parseId(searchParams.get("id"), model || "");
  const session = await auth();

  if (!model || !modelMap[model] || !id) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const item = await modelMap[model].findUnique({ where: { id: String(id) }, select: { businessId: true } }).catch(() => null);
  const requestedBusinessId = searchParams.get("businessId");
  const userId = searchParams.get("userId") || searchParams.get("ownerId") || null;

  if ((model === "product" || model === "category") && !item?.businessId) {
    return NextResponse.json({ error: "Only business-owned products and categories can be deleted" }, { status: 403 });
  }

  if (requestedBusinessId && item?.businessId && String(item.businessId) !== String(requestedBusinessId)) {
    return NextResponse.json({ error: "This record does not belong to the current business" }, { status: 403 });
  }

  const canManage = model === "user"
    ? false
    : isPlatformManagerRole((session?.user as any)?.role)
      ? true
      : await canManageBusinessResource(session, model, item?.businessId || null, userId);

  if (!canManage) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if ((session?.user as any)?.role === "staff") {
    return NextResponse.json({ error: "Staff accounts cannot delete records" }, { status: 403 });
  }

  try {
    await modelMap[model].delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
