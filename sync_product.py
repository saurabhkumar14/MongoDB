from pymongo import MongoClient
import requests
import datetime

# Step 1: Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["inventory_db"]
products = db["products"]
sync_logs = db["sync_logs"]

# Step 2: Fetch data from REST API
url = "https://mocki.io/v1/abcd1234-xyz5678"  # Replace with your Mocki URL
response = requests.get(url)

if response.status_code == 200:
    product_data = response.json()

    # Step 3: Insert/Update product
    products.update_one(
        {"productId": product_data["productId"]},
        {"$set": product_data},
        upsert=True
    )

    # Step 4: Log success
    sync_logs.insert_one({
        "logId": "L005",
        "productId": product_data["productId"],
        "status": "success",
        "message": "Product synced successfully",
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

    print("✅ Product synced successfully:", product_data["productId"])
else:
    print("❌ Failed to fetch product. Status Code:", response.status_code)
