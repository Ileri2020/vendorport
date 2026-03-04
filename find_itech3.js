
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const businesses = await prisma.business.findMany();
    // console.log('Businesses:', JSON.stringify(businesses, null, 2));
    
    const itech3 = businesses.find(b => b.name.toLowerCase().includes('itech3'));
    if (itech3) {
      console.log('FOUND_BUSINESS_ID:' + itech3.id);
      console.log('FOUND_BUSINESS_NAME:' + itech3.name);
      
      const categories = await prisma.category.findMany({
        where: { businessId: itech3.id }
      });
      console.log('CATEGORIES:' + JSON.stringify(categories));
    } else {
      console.log('itech3 business not found');
      // List available names to help debugging
      console.log('Available businesses:', businesses.map(b => b.name).join(', '));
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
