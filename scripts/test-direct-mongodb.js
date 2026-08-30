#!/usr/bin/env node

require('dotenv/config');

const { MongoClient } = require('mongodb');

async function testDirectConnection() {
  // Try direct connection without SRV
  const url = 'mongodb+srv://adepojuololade2020:j0k2iy9xXcraCpHn@succomongo.b5r4o.mongodb.net/scraped?retryWrites=true&w=majority&appName=succomongo';
  
  console.log('Attempting direct MongoDB connection...');
  console.log('URL:', url.replace(/:[^:]*@/, ':***@'));

  const client = new MongoClient(url, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    const adminDb = client.db('admin');
    const status = await adminDb.command({ ping: 1 });
    console.log('✓ Connection successful:', status);
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    console.error('Error code:', error.code);
  } finally {
    await client.close();
  }
}

testDirectConnection().catch(error => {
  console.error('Test failed:', error);
  process.exitCode = 1;
});
