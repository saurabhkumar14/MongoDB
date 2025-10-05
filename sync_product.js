const { MongoClient } = require("mongodb");

// ✅ Mock API function simulating GET call
async function fetchProductFromMockAPI(productid) {
  const mockData = {
    P2001: { productid: "P2001", productName: "Gaming Laptop", stock: 60, price: 89999, category: "Electronics" },
    P2002: { productid: "P2002", productName: "Smartwatch", stock: 100, price: 13999, category: "Wearables" },
    P2003: { productid: "P2003", productName: "Wireless Earbuds", stock: 250, price: 3899, category: "Accessories" }
  };

  await new Promise(resolve => setTimeout(resolve, 500)); // simulate delay

  if (mockData[productid]) {
    return mockData[productid];
  } else {
    throw new Error(`Product ${productid} not found in mock API`);
  }
}

// ✅ MongoDB connection details
const url = "mongodb://127.0.0.1:27017";
const dbName = "inventory_db";

async function syncProduct(productid) {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log(`🔄 Sync started for Product ID: ${productid}`);

    const db = client.db(dbName);
    const productsCol = db.collection("products");
    const logsCol = db.collection("sync_logs");

    // STEP 1: Fetch product details (mock GET API)
    const productData = await fetchProductFromMockAPI(productid);

    // STEP 2: Upsert product document
    const result = await productsCol.updateOne(
      { productid: productid },
      { $set: productData },
      { upsert: true }
    );

    // STEP 3: Log success
    const logEntry = {
      logId: `LOG_${productid}_${Date.now()}`,
      productid: productid,
      status: "SUCCESS",
      message: result.upsertedCount
        ? "Product inserted successfully"
        : "Product updated successfully",
      timestamp: new Date()
    };
    await logsCol.insertOne(logEntry);

    console.log(`✅ ${logEntry.message}`);

  } catch (err) {
    // STEP 4: Log failure
    const db = client.db(dbName);
    const logsCol = db.collection("sync_logs");

    await logsCol.insertOne({
      logId: `LOG_${productid}_${Date.now()}`,
      productid: productid,
      status: "FAILED",
      message: err.message,
      timestamp: new Date()
    });

    console.error(`❌ Sync failed for ${productid}: ${err.message}`);
  } finally {
    await client.close();
  }
}

// ✅ Take productid from command-line args
const productid = process.argv[2];
if (!productid) {
  console.error("❌ Please provide a productid. Example: node sync_product.js P2001");
  process.exit(1);
}

syncProduct(productid);
