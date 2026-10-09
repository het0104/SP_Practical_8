const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
function logger(req, res, next) {
  console.log(req.method, req.url);
  next();
}
app.use(logger);

function validateProduct(req, res, next) {
  const { name, price, quantity } = req.body;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    !Number.isFinite(Number(price)) ||
    Number(price) <= 0 ||
    quantity === undefined ||
    quantity === null ||
    String(quantity).trim() === '' ||
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) < 0
  ) {
    return res.status(400).json({
      error: 'A product name, positive price, and non-negative whole-number quantity are required.',
    });
  }
  next();
}

let products = [
  { id: 1, name: 'Soap', brand: 'Dettol', price: 20, quantity: 25 },
  { id: 2, name: 'Shampoo', brand: 'Loreal', price: 100, quantity: 10 },
];

app.get('/api/products', (req, res) => res.json(products));

app.post('/api/products', validateProduct, (req, res) => {
  const product = {
    id: Date.now(),
    name: req.body.name.trim(),
    brand: typeof req.body.brand === 'string' ? req.body.brand.trim() : '',
    price: Number(req.body.price),
    quantity: Number(req.body.quantity),
  };
  products.push(product);
  res.status(201).json(product);
});

app.put('/api/products/:id', validateProduct, (req, res) => {
  const product = products.find((item) => item.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  Object.assign(product, {
    name: req.body.name.trim(),
    brand: typeof req.body.brand === 'string' ? req.body.brand.trim() : '',
    price: Number(req.body.price),
    quantity: Number(req.body.quantity),
  });
  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex((item) => item.id === Number(req.params.id));
  if (productIndex === -1) return res.status(404).json({ error: 'Product not found.' });

  products.splice(productIndex, 1);
  res.json({ msg: 'Deleted' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Backend on ${port}`));
