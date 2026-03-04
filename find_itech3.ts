
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany();
  console.log('Businesses:', JSON.stringify(businesses, null, 2));
  
  const itech3 = businesses.find(b => b.name.toLowerCase().includes('itech3'));
  if (itech3) {
    console.log('Found itech3:', JSON.stringify(itech3, null, 2));
    
    // Also find categories for this business
    const categories = await prisma.category.findMany({
      where: { businessId: itech3.id }
    });
    console.log('Categories for itech3:', JSON.stringify(categories, null, 2));
  } else {
    console.log('itech3 business not found');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
