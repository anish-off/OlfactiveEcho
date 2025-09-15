const axios = require('axios');

// Test the cancel order endpoint
async function testCancelOrder() {
  try {
    // This is just a placeholder - in a real test, you would use a valid token and order ID
    const orderId = 'test-order-id';
    const token = 'test-jwt-token';
    
    const response = await axios.patch(
      `http://localhost:5000/api/orders/${orderId}/cancel`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Success:', response.data);
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
  }
}

// Run the test
testCancelOrder();