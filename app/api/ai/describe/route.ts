import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { mode, productIds, productData, businessId } = await req.json();

    if (!mode || !['single', 'batch'].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode. Use 'single' or 'batch'" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (mode === 'single') {
      // Single product description generation
      if (!productData || !productData.name) {
        return NextResponse.json({ error: "Missing product data for single mode" }, { status: 400 });
      }

      const { name, categoryId } = productData;

      // Get category name if available
      let categoryName = "Product";
      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
          select: { name: true }
        });
        if (category) categoryName = category.name;
      }

      const prompt = `Generate a professional, engaging product description for an e-commerce store.
Product Name: "${name}"
Category: "${categoryName}"

The description should be:
- Concise yet compelling (2-3 sentences)
- Focus on benefits and key features
- Include why customers should buy this product
- Be suitable for an online marketplace
- Written in a friendly, professional tone

Return ONLY the description text, no additional formatting.`;

      const result = await model.generateContent(prompt);
      const description = result.response.text().trim();

      return NextResponse.json({
        success: true,
        mode: 'single',
        description,
        productName: name,
      });
    }

    if (mode === 'batch') {
      // Batch product description generation (up to 20 products)
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return NextResponse.json({ error: "Missing productIds for batch mode" }, { status: 400 });
      }

      if (productIds.length > 20) {
        return NextResponse.json({ error: "Maximum 20 products per batch" }, { status: 400 });
      }

      // Fetch products
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          ...(businessId && { businessId }),
        },
        include: { category: true },
      });

      if (products.length === 0) {
        return NextResponse.json({ error: "No products found" }, { status: 404 });
      }

      // Generate descriptions for all products
      const results: any[] = [];

      for (const product of products) {
        try {
          const prompt = `Generate a professional, engaging product description for an e-commerce store.
Product Name: "${product.name}"
Category: "${product.category?.name || 'Product'}"

The description should be:
- Concise yet compelling (2-3 sentences)
- Focus on benefits and key features
- Include why customers should buy this product
- Be suitable for an online marketplace
- Written in a friendly, professional tone

Return ONLY the description text, no additional formatting.`;

          const result = await model.generateContent(prompt);
          const description = result.response.text().trim();

          results.push({
            productId: product.id,
            productName: product.name,
            description,
            categoryName: product.category?.name || "Product",
          });

          // Optional: pause between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to generate description for ${product.name}:`, error);
          results.push({
            productId: product.id,
            productName: product.name,
            description: "",
            error: "Failed to generate description",
          });
        }
      }

      return NextResponse.json({
        success: true,
        mode: 'batch',
        totalProcessed: results.length,
        results,
      });
    }
  } catch (err: any) {
    console.error("AI Describe Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
