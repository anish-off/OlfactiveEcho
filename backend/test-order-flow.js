const mongoose = require('mongoose');
const Order = require('./models/Order');
const Perfume = require('./models/Perfume');
const User = require('./models/User');

// Test data
const testOrderData = {
  items: [
    {
      perfume: null, // Will be set after creating test perfume
      quantity: 2,
      price: 1500
    }
  ],
  subtotal: 3000,
  shipping: 0,
  tax: 360,
  total: 3360,
  shippingAddress: {
    fullName: 'Test User',
    email: 'test@example.com',
    address: '123 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    phone: '9876543210'
  },
  billingAddress: {
    fullName: 'Test User',
    email: 'test@example.com',
    address: '123 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    phone: '9876543210'
  },
  paymentMethod: 'cod',
  paymentStatus: 'pending',
  status: 'pending'
};

async function testOrderFlow() {
  try {
    console.log('🧪 Testing Order Flow...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/olfactiveecho');
    console.log('✅ Connected to database');
    
    // Create test user if not exists
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123',
        isVerified: true
      });
      console.log('✅ Created test user');
    } else {
      console.log('✅ Found existing test user');
    }
    
    // Create test perfume if not exists
    let testPerfume = await Perfume.findOne({ name: 'Test Perfume' });
    if (!testPerfume) {
      testPerfume = await Perfume.create({
        name: 'Test Perfume',
        brand: 'Test Brand',
        price: 1500,
        description: 'A test perfume for order flow validation',
        category: 'Unisex',
        notes: {
          top: ['Bergamot', 'Lemon'],
          middle: ['Rose', 'Jasmine'],
          base: ['Sandalwood', 'Musk']
        },
        imageUrl: '/placeholder.png',
        inStock: true,
        stockQuantity: 100
      });
      console.log('✅ Created test perfume');
    } else {
      console.log('✅ Found existing test perfume');
    }
    
    // Update test data with actual IDs
    testOrderData.user = testUser._id;
    testOrderData.items[0].perfume = testPerfume._id;
    
    // Test order creation
    const order = await Order.create(testOrderData);
    console.log('✅ Order created successfully:', order._id);
    
    // Test order retrieval with population
    const populatedOrder = await Order.findById(order._id)
      .populate('user items.perfume');
    
    console.log('✅ Order retrieved with population');
    console.log('   - User:', populatedOrder.user.name);
    console.log('   - Items:', populatedOrder.items.length);
    console.log('   - Total:', populatedOrder.total);
    console.log('   - Status:', populatedOrder.status);
    
    // Test order status update
    await Order.findByIdAndUpdate(order._id, { status: 'confirmed' });
    console.log('✅ Order status updated to confirmed');
    
    // Test order cancellation
    await Order.findByIdAndUpdate(order._id, { status: 'cancelled' });
    console.log('✅ Order status updated to cancelled');
    
    // Cleanup - delete test order
    await Order.findByIdAndDelete(order._id);
    console.log('✅ Test order cleaned up');
    
    console.log('\n🎉 All order flow tests passed!');
    
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
  testOrderFlow();
}

module.exports = { testOrderFlow };
