const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const name = process.argv[2];
    if (!name) {
      console.error('Usage: node remove_duplicate_business_fix.js <businessName>');
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
      console.log('Processing duplicate business:', b.id);

      // Delete related project settings, pages, and sections first
      const ps = await prisma.projectSettings.findUnique({ where: { businessId: b.id } });
      if (ps) {
        console.log('Found projectSettings:', ps.id);
        const pages = await prisma.page.findMany({ where: { projectSettingsId: ps.id } });
        for (const p of pages) {
          console.log('Deleting sections for page:', p.id);
          await prisma.section.deleteMany({ where: { pageId: p.id } });
        }
        console.log('Deleting pages for projectSettings:', ps.id);
        await prisma.page.deleteMany({ where: { projectSettingsId: ps.id } });

        console.log('Deleting projectSettings:', ps.id);
        await prisma.projectSettings.delete({ where: { id: ps.id } });
      }

      // Attempt to delete the business
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
