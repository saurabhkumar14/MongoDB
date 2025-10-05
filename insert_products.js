const { MongoClient } = require('mongodb');
const products = require('./products.json'); // JSON file

const url = 'mongodb://127.0.0.1:27017';
const dbName = 'inventory_db';

async function run() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const productsCol = db.collection('products');
    const logsCol = db.collection('sync_logs');

    for (const product of products) {
      await productsCol.insertOne(product);

      // Log the sync
      await logsCol.insertOne({
        logId: `L${product.productid}`,
        productid: product.productid,
        status: "SUCCESS",
        message: "Product inserted successfully",
        timestamp: new Date()
      });

      console.log(`Inserted product ${product.productid} and logged sync`);
    }

  } finally {
    await client.close();
  }
}

run().catch(console.dir);
