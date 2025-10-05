require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EXPECTED_TOKEN = process.env.API_TOKEN || 'my-secret';

app.get('/v1/product/:id', (req, res) => {
  const auth = req.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Bearer token' });
  }
  const token = auth.slice(7);
  if (token !== EXPECTED_TOKEN) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  const productId = req.params.id;
  // return example product JSON
  res.json({
    productId,
    productName: "Wireless Mouse",
    stock: 85,
    category: "Electronics",
    price: 999.00
  });
});

app.listen(PORT, () => console.log(`Mock server listening on http://localhost:${PORT}`));
