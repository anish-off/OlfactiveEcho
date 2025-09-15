const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Perfume = require('./models/Perfume');
const axios = require('axios');

// Test order cancellation
const testCancelOrder = async () => {
  try {
    // Replace with a valid order ID and token
    const orderId = 'YOUR_ORDER_ID';
    const token = 'YOUR_JWT_TOKEN';
    
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
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testCancelOrder();

async function testCancelOrder() {
  try {
    console.log('🧪 Testing Order Cancellation...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/olfactiveecho');
    console.log('✅ Connected to database');
    
    // Find or create test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123',
        role: 'user'
      });
      console.log('✅ Created test user');
    } else {
      console.log('✅ Found test user:', testUser._id);
    }
    
    // Find or create test perfume
    let testPerfume = await Perfume.findOne({ name: 'Test Perfume' });
    if (!testPerfume) {
      testPerfume = await Perfume.create({
        name: 'Test Perfume',
        brand: 'Test Brand',
        price: 1500,
        description: 'A test perfume',
        category: 'Unisex',
        notes: {
          top: ['Bergamot'],
          middle: ['Rose'],
          base: ['Sandalwood']
        },
        imageUrl: '/placeholder.png',
        inStock: true,
        stockQuantity: 100
      });
      console.log('✅ Created test perfume');
    } else {
      console.log('✅ Found test perfume:', testPerfume._id);
    }
    
    // Create a test order with pending status
    const testOrder = await Order.create({
      user: testUser._id,
      items: [{
        perfume: testPerfume._id,
        quantity: 1,
        price: 1500
      }],
      subtotal: 1500,
      shipping: 50,
      tax: 180,
      total: 1730,
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      billingAddress: {
        fullName: 'Test User',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status: 'pending'
    });
    
    console.log('✅ Created test order:', testOrder._id);
    console.log('   - Status:', testOrder.status);
    console.log('   - User:', testOrder.user);
    
    // Test cancellation logic
    console.log('\n🔄 Testing cancellation logic...');
    
    // Check if order exists
    const foundOrder = await Order.findById(testOrder._id);
    console.log('✅ Order found:', foundOrder ? 'Yes' : 'No');
    
    // Check user match
    const userMatch = foundOrder.user.toString() === testUser._id.toString();
    console.log('✅ User match:', userMatch);
    
    // Check status
    const canCancel = foundOrder.status === 'pending';
    console.log('✅ Can cancel (pending status):', canCancel);
    
    if (canCancel && userMatch) {
      foundOrder.status = 'cancelled';
      await foundOrder.save();
      console.log('✅ Order cancelled successfully');
      
      // Verify cancellation
      const cancelledOrder = await Order.findById(testOrder._id);
      console.log('✅ Verified status:', cancelledOrder.status);
    } else {
      console.log('❌ Cannot cancel order');
    }
    
    // Cleanup
    await Order.findByIdAndDelete(testOrder._id);
    console.log('✅ Test order cleaned up');
    
    console.log('\n🎉 Order cancellation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the test
if (require.main === module) {
  require('dotenv').config();
  testCancelOrder();
}

module.exports = { testCancelOrder };
