const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const name = process.argv[2];
    if (!name) {
      console.error('Usage: node remove_duplicate_business.js <businessName>');
      process.exit(1);
    }

    const items = await prisma.business.findMany({ where: { name } });
    console.log(`Found ${items.length} businesses with name='${name}'`);
    if (items.length <= 1) {
      console.log('Nothing to delete.');
      process.exit(0);
    }

    // Keep the first one, delete others
    const keep = items[0];
    const toDelete = items.slice(1);

    for (const b of toDelete) {
      console.log('Deleting duplicate business:', b.id);
      await prisma.business.delete({ where: { id: b.id } });
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(2);
  }
})();