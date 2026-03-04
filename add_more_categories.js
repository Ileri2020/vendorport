
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const businessId = "69a586cba749e310825bb354";

const newCategories = [
  "Mobile Accessories",
  "Health & Beauty",
  "Groceries",
  "Video Games",
  "Home & Office"
];

async function main() {
  try {
    for (const name of newCategories) {
      const existing = await prisma.category.findFirst({
        where: { name, businessId }
      });
      if (!existing) {
        const created = await prisma.category.create({
          data: { name, businessId, description: `Scraped ${name} category` }
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
