#!/usr/bin/env node

require('dotenv/config');

// Set default MongoDB URLs
if (!process.env.PRICEPALLY_MONGODB_URL) {
  process.env.PRICEPALLY_MONGODB_URL = 'mongodb+srv://adepojuololade2020:j0k2iy9xXcraCpHn@succomongo.b5r4o.mongodb.net/scraped?retryWrites=true&w=majority&appName=succomongo';
}
if (!process.env.MARKET2HOME_MONGODB_URL) {
  process.env.MARKET2HOME_MONGODB_URL = 'mongodb+srv://adepojuololade2020:j0k2iy9xXcraCpHn@succomongo.b5r4o.mongodb.net/scraped?retryWrites=true&w=majority&appName=succomongo';
}

const { MongoClient } = require('mongodb');

async function testConnections() {
  console.log('Testing MongoDB connections...');

  try {
    console.log('Connecting to Pricepally MongoDB...');
    const pricepally = new MongoClient(process.env.PRICEPALLY_MONGODB_URL);
    await Promise.race([
      pricepally.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000))
    ]);
    console.log('✓ Pricepally connection succeeded');

    const pricepallyDb = pricepally.db('scraped');
    const collections = await pricepallyDb.listCollections().toArray();
    console.log(`✓ Found ${collections.length} collections in scraped database:`, collections.map(c => c.name).join(', '));

    const productCount = await pricepallyDb.collection('pricepally_products').countDocuments();
    console.log(`✓ Pricepally products collection has ${productCount} documents`);

    await pricepally.close();
    console.log('✓ Pricepally connection closed');
  } catch (error) {
    console.error('✗ Pricepally connection failed:', error.message);
  }

  try {
    console.log('\nConnecting to Market2Home MongoDB...');
    const market2home = new MongoClient(process.env.MARKET2HOME_MONGODB_URL);
    await Promise.race([
      market2home.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000))
    ]);
    console.log('✓ Market2Home connection succeeded');

    const market2homeDb = market2home.db('scraped');
    const collections = await market2homeDb.listCollections().toArray();
    console.log(`✓ Found ${collections.length} collections in scraped database:`, collections.map(c => c.name).join(', '));

    const productCount = await market2homeDb.collection('market2home_products').countDocuments();
    console.log(`✓ Market2Home products collection has ${productCount} documents`);

    await market2home.close();
    console.log('✓ Market2Home connection closed');
  } catch (error) {
    console.error('✗ Market2Home connection failed:', error.message);
  }
}

testConnections().catch(error => {
  console.error('Test failed:', error);
  process.exitCode = 1;
});
