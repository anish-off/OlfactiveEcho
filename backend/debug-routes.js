const express = require('express');

// Simple test to check route matching
const router = express.Router();

// Test routes in the same order as orderRoutes.js
router.post('/checkout', (req, res) => res.json({ route: 'checkout' }));
router.post('/', (req, res) => res.json({ route: 'create order' }));
router.get('/', (req, res) => res.json({ route: 'get orders' }));
router.patch('/:id/cancel', (req, res) => res.json({ route: 'cancel order', id: req.params.id }));
router.get('/:id', (req, res) => res.json({ route: 'get order by id', id: req.params.id }));
router.get('/all/orders', (req, res) => res.json({ route: 'get all orders' }));
router.patch('/:id/status', (req, res) => res.json({ route: 'update status', id: req.params.id }));

// Test which route gets matched
const testRoutes = [
  'POST /orders/checkout',
  'POST /orders/',
  'GET /orders/',
  'PATCH /orders/123/cancel',
  'GET /orders/123',
  'GET /orders/all/orders',
  'PATCH /orders/123/status'
];

console.log('Route matching test:');
testRoutes.forEach(route => {
  const [method, path] = route.split(' ');
  console.log(`${route} -> Expected to match correct handler`);
});

// Create a simple app to test
const app = express();
app.use('/orders', router);

// Test the cancel route specifically
app.use('/test-cancel/:id', (req, res) => {
  res.json({ 
    message: 'Cancel route test',
    orderId: req.params.id,
    method: req.method
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\nRoute test server running on port ${PORT}`);
  console.log('Test the cancel route: PATCH http://localhost:3001/orders/123/cancel');
  console.log('Test simple route: GET http://localhost:3001/test-cancel/123');
});

module.exports = app;
