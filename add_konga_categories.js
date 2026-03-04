
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const businessId = "69a586cba749e310825bb354";

const kongaCategories = [
  "Computers and Accessories",
  "Home and Kitchen",
  "Beauty, Health & Personal Care",
  "Drinks & Groceries",
  "Generators & Power Solutions"
];

async function main() {
  try {
    for (const name of kongaCategories) {
      const existing = await prisma.category.findFirst({
        where: { name, businessId }
      });
      if (!existing) {
        const created = await prisma.category.create({
          data: { name, businessId, description: `Scraped ${name} category from Konga` }
        });
        console.log(`Created category: ${name} (${created.id})`);
      } else {
        console.log(`Category exists: ${name} (${existing.id})`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
