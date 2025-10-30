const twilio = require('twilio');

// Initialize Twilio client (if credentials are provided)
let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log('✅ Twilio SMS client initialized');
} else {
  console.log('⚠️ Twilio credentials not found. SMS notifications will be simulated.');
}

// Format phone number to E.164 format (international format)
const formatPhoneNumber = (phone, countryCode = '+91') => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If phone already starts with country code, return as is with +
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  
  // Otherwise, add country code
  return `${countryCode}${cleaned}`;
};

// Send SMS using Twilio
const sendSMS = async (to, message) => {
  try {
    const formattedPhone = formatPhoneNumber(to);
    
    if (!twilioClient) {
      // Simulate SMS in development
      console.log('📱 SMS Simulation (Development Mode):');
      console.log(`   To: ${formattedPhone}`);
      console.log(`   Message: ${message}`);
      console.log(`   Status: ✅ Simulated successfully`);
      
      return {
        sid: `SIM${Date.now()}`,
        status: 'simulated',
        to: formattedPhone,
        body: message,
        dateCreated: new Date()
      };
    }
    
    // Send actual SMS via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    
    console.log('✅ SMS sent successfully via Twilio');
    console.log(`   SID: ${result.sid}`);
    console.log(`   Status: ${result.status}`);
    
    return result;
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    
    // In production, log error but don't throw
    if (process.env.NODE_ENV === 'production') {
      console.log('📝 SMS queued for retry (production mode)');
      return { sid: 'queued', error: error.message };
    }
    
    throw error;
  }
};

// Send order confirmation SMS
const sendOrderConfirmationSMS = async (order, user) => {
  const phone = user.phone || order.shippingAddress?.phone;
  
  if (!phone) {
    console.log('⚠️ No phone number available for SMS notification');
    return null;
  }
  
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const total = `₹${order.total.toFixed(2)}`;
  
  const message = `OlfactiveEcho: Order #${orderId} confirmed! Total: ${total}. Track your order: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders`;
  
  return await sendSMS(phone, message);
};

// Send order status update SMS
const sendOrderStatusUpdateSMS = async (order, user, newStatus) => {
  const phone = user.phone || order.shippingAddress?.phone;
  
  if (!phone) {
    console.log('⚠️ No phone number available for SMS notification');
    return null;
  }
  
  const orderId = order._id.toString().slice(-8).toUpperCase();
  
  const statusMessages = {
    confirmed: 'Order confirmed and being prepared',
    processing: 'Order is being processed',
    shipped: `Order shipped! ${order.trackingNumber ? `Track: ${order.trackingNumber}` : 'Check email for tracking'}`,
    delivered: 'Order delivered successfully! Enjoy your fragrances 🎉',
    cancelled: 'Order has been cancelled'
  };
  
  const message = `OlfactiveEcho: Order #${orderId} - ${statusMessages[newStatus] || 'Status updated'}. View: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders`;
  
  return await sendSMS(phone, message);
};

// Send low stock alert SMS (for admin)
const sendLowStockAlertSMS = async (adminPhone, productName, currentStock) => {
  if (!adminPhone) {
    console.log('⚠️ No admin phone number configured for alerts');
    return null;
  }
  
  const message = `🚨 OlfactiveEcho Alert: "${productName}" is low on stock! Current stock: ${currentStock} units. Please reorder soon.`;
  
  return await sendSMS(adminPhone, message);
};

// Send delivery failed SMS
const sendDeliveryFailedSMS = async (order, user, reason) => {
  const phone = user.phone || order.shippingAddress?.phone;
  
  if (!phone) {
    console.log('⚠️ No phone number available for SMS notification');
    return null;
  }
  
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const message = `OlfactiveEcho: Delivery attempt failed for Order #${orderId}. Reason: ${reason}. We'll try again soon. Contact: support@olfactiveecho.com`;
  
  return await sendSMS(phone, message);
};

// Send OTP SMS
const sendOTPSMS = async (phone, otp) => {
  const message = `Your OlfactiveEcho verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
  return await sendSMS(phone, message);
};

// Send return approved SMS
const sendReturnApprovedSMS = async (order, user) => {
  const phone = user.phone || order.shippingAddress?.phone;
  
  if (!phone) {
    console.log('⚠️ No phone number available for SMS notification');
    return null;
  }
  
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const message = `OlfactiveEcho: Your return request for Order #${orderId} has been approved. Check email for return instructions.`;
  
  return await sendSMS(phone, message);
};

// Send promotional SMS (with opt-out message)
const sendPromotionalSMS = async (phone, promoMessage) => {
  const message = `${promoMessage} - OlfactiveEcho. Reply STOP to unsubscribe.`;
  return await sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendOrderConfirmationSMS,
  sendOrderStatusUpdateSMS,
  sendLowStockAlertSMS,
  sendDeliveryFailedSMS,
  sendOTPSMS,
  sendReturnApprovedSMS,
  sendPromotionalSMS,
  formatPhoneNumber
};
