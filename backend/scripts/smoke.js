require('dotenv').config();
const axios = require('axios');

(async () => {
  try {
    const base = `http://localhost:${process.env.PORT || 5000}/api`;
    console.log('Health check...');
    const health = await axios.get(`${base}/health`);
    console.log('Health:', health.data);

    const email = `user${Date.now()}@example.com`;
    console.log('Registering user', email);
    const reg = await axios.post(`${base}/auth/register`, { name: 'Test User', email, password: 'TestPass123!' });
    const token = reg.data.token;
    console.log('Registered user id:', reg.data.user.id);

    // Create perfumes requires admin; skip if 403. Just list existing.
    console.log('Listing perfumes');
    const perfumes = await axios.get(`${base}/perfumes`);
    console.log('Perfume count:', perfumes.data.length);

    if (perfumes.data.length >= 2) {
      const items = perfumes.data.slice(0,2).map(p => ({ perfume: p._id || p.id || p._id, quantity: 1 }));
      console.log('Creating order with 2 perfumes (expect free sample if provided)');
      const order = await axios.post(`${base}/orders`, { items }, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Order total:', order.data.total, 'Sample price:', order.data.sample?.price);
    } else {
      console.log('Not enough perfumes to create order in smoke test');
    }

    console.log('Smoke test completed');
  } catch (e) {
    if (e.response) console.error('Error response:', e.response.status, e.response.data);
    else console.error('Error:', e.message);
    process.exit(1);
  }
})();
