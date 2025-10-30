require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function enableWhatsAppForUser(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME || 'olfactive_echo'
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }
    
    console.log(`\n👤 Found user: ${user.name} (${user.email})`);
    console.log(`📱 Current phone: ${user.phone || 'Not set'}`);
    console.log(`\n📋 Current preferences:`);
    console.log(`   Email: ${user.preferences?.emailNotifications !== false ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   SMS: ${user.preferences?.smsNotifications ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   WhatsApp: ${user.preferences?.whatsappNotifications ? '✅ Enabled' : '❌ Disabled'}`);
    
    // Enable WhatsApp notifications
    if (!user.preferences) {
      user.preferences = {};
    }
    
    user.preferences.whatsappNotifications = true;
    
    await user.save();
    
    console.log(`\n✅ WhatsApp notifications enabled for ${user.email}!`);
    console.log(`\n📋 Updated preferences:`);
    console.log(`   Email: ${user.preferences.emailNotifications !== false ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   SMS: ${user.preferences.smsNotifications ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   WhatsApp: ${user.preferences.whatsappNotifications ? '✅ Enabled' : '❌ Disabled'}`);
    
    console.log(`\n🎉 Done! You will now receive WhatsApp notifications for orders.`);
    console.log(`\n⚠️  IMPORTANT: Make sure you've joined the Twilio Sandbox:`);
    console.log(`   1. Open WhatsApp`);
    console.log(`   2. Send to: +1 415 523 8886`);
    console.log(`   3. Type: join rubber-iron`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Get email from command line or use default
const email = process.argv[2] || 'shanmugapatelkani@gmail.com';

console.log('🚀 Enabling WhatsApp notifications...\n');
console.log(`📧 User email: ${email}\n`);

enableWhatsAppForUser(email);
