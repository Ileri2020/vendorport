import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { query, businessId } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    // 1. Use Gemini to parse the input list into a structured JSON
    // If no API Key, we'll use a regex fallback for simple lists
    const apiKey = process.env.GEMINI_API_KEY;
    let itemsToSearch: any[] = [];

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are an AI Shopping Assistant for a multi-vendor platform.
        Parse the following user shopping list (which might be human-written text or a direct list):
        "${query}"
        
        Extract each product and return ONLY a JSON array of objects with:
        - name: The product name (string)
        - quantity: The quantity requested (number, default 1)
        
        Example Output: [{"name": "Panadol", "quantity": 2}, {"name": "Coke", "quantity": 1}]
        Return ONLY the raw JSON array.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, "").trim();
      itemsToSearch = JSON.parse(text);
    } else {
      // Fallback: simple line-based parsing
      itemsToSearch = query.split(/,|\n/).map((s: string) => {
         const parts = s.trim().split(/\s+/);
         return { name: parts.join(" "), quantity: 1 };
      }).filter((p: any) => p.name.length > 2);
    }

    // 2. Search products in the database
    // We search for top matches AND similar products in the same category
    const results: any[] = [];

    for (const item of itemsToSearch) {
      // Find top direct matches
      const directMatches = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: item.name, mode: "insensitive" } },
            { brand: { contains: item.name, mode: "insensitive" } },
          ]
        },
        take: 3,
        include: { category: true }
      });

      let options = [...directMatches];

      // If we found direct matches, also find other products in the same category for comparison
      if (directMatches.length > 0) {
        const categoryId = directMatches[0].categoryId;
        const similarProducts = await prisma.product.findMany({
          where: {
            categoryId: categoryId,
            id: { notIn: directMatches.map(m => m.id) }
          },
          take: 5,
          include: { category: true }
        });
        options = [...options, ...similarProducts];
      }

      results.push({
        identifiedItem: item,
        options: options.map(opt => ({
           ...opt,
           requestedQuantity: item.quantity
        }))
      });
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("AI Shop Error:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}
