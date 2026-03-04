
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const businessId = "69a586cba749e310825bb354";

const categoriesToCreate = [
  "Electronics",
  "Appliances",
  "Computing",
  "Drugs",
  "Skincare",
  "Phones and Tablets"
];

async function main() {
  try {
    for (const name of categoriesToCreate) {
      const existing = await prisma.category.findFirst({
        where: { name, businessId }
      });
      if (!existing) {
        await prisma.category.create({
          data: { name, businessId, description: `Scraped ${name} category` }
        });
        console.log(`Created category: ${name}`);
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
