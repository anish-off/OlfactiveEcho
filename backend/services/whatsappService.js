const twilio = require('twilio');

// Initialize Twilio client for WhatsApp
let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log('✅ Twilio WhatsApp client initialized');
} else {
  console.log('⚠️ Twilio credentials not found. WhatsApp notifications will be simulated.');
}

// Format phone number for WhatsApp (E.164 format with whatsapp: prefix)
const formatWhatsAppNumber = (phone, countryCode = '+91') => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `whatsapp:+${cleaned}`;
  }
  
  return `whatsapp:${countryCode}${cleaned}`;
};

// Send WhatsApp message using Twilio
const sendWhatsAppMessage = async (to, message) => {
  try {
    const formattedPhone = formatWhatsAppNumber(to);
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio Sandbox
    
    if (!twilioClient) {
      // Simulate WhatsApp in development
      console.log('💬 WhatsApp Simulation (Development Mode):');
      console.log(`   To: ${formattedPhone}`);
      console.log(`   From: ${fromNumber}`);
      console.log(`   Message: ${message}`);
      console.log(`   Status: ✅ Simulated successfully`);
      
      return {
        success: true,
        sid: `WA${Date.now()}`,
        status: 'simulated',
        to: formattedPhone,
        body: message,
        dateCreated: new Date()
      };
    }
    
    // Send actual WhatsApp message via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: formattedPhone
    });
    
    console.log('✅ WhatsApp message sent successfully via Twilio');
    console.log(`   SID: ${result.sid}`);
    console.log(`   Status: ${result.status}`);
    
    return {
      success: true,
      sid: result.sid,
      status: result.status,
      to: result.to,
      body: result.body,
      dateCreated: result.dateCreated
    };
  } catch (error) {
    console.error('❌ WhatsApp message sending failed:', error.message);
    
    return {
      success: false,
      error: error.message,
      sid: null,
      status: 'failed'
    };
  }
};

// Send order confirmation WhatsApp message
const sendOrderConfirmationWhatsApp = async (order, user) => {
  const phone = user.phone || order.shippingAddress?.phone;
  
  if (!phone) {
    console.log('⚠️ No phone number available for WhatsApp notification');
    return { success: false, error: 'No phone number available' };
  }
  
  try {
    const orderId = order._id.toString().slice(-8).toUpperCase();
    const total = `₹${(order.totalAmount || order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const orderUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order._id}`;
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
    
    // Build items list
    const itemsList = order.items.map(item => {
      const perfumeName = item.perfume?.name || 'Unknown Item';
      const size = item.size || '';
      const qty = item.quantity || 1;
      const price = item.price ? `₹${item.price.toLocaleString('en-IN')}` : '';
      return `• ${perfumeName}${size ? ` (${size})` : ''} x${qty}${price ? ` - ${price}` : ''}`;
    }).join('\n');
    
    const message = `🎉 *Order Confirmed!*

Hi ${user.name}! Your OlfactiveEcho order has been confirmed.

*Order Details:*
📦 Order ID: #${orderId}
💰 Total: ${total}
📅 Date: ${orderDate}

*Items:*
${itemsList}

*Shipping Address:*
${order.shippingAddress.fullName}
${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? ', ' + order.shippingAddress.addressLine2 : ''}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}

Track your order: ${orderUrl}

Thank you for shopping with OlfactiveEcho! 🌸`;
    
    const result = await sendWhatsAppMessage(phone, message);
    return { success: true, messageSid: result.sid, status: result.status };
  } catch (error) {
    console.error('❌ Order confirmation WhatsApp failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Send order status update WhatsApp message
const sendOrderStatusUpdateWhatsApp = async (order, user, newStatus) => {
  const phone = user.phone || order.shippingAddress?.phone;
  
  if (!phone) {
    console.log('⚠️ No phone number available for WhatsApp notification');
    return { success: false, error: 'No phone number available' };
  }
  
  try {
    const orderId = order._id.toString().slice(-8).toUpperCase();
    const orderUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order._id}`;
    
    const statusEmojis = {
      confirmed: '✅',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '🎉',
      cancelled: '❌'
    };
    
    const statusMessages = {
      confirmed: '*Order Confirmed*\nYour order has been confirmed and is being prepared.',
      processing: '*Order Processing*\nYour order is being processed and will be shipped soon.',
      shipped: `*Order Shipped*\nGreat news! Your order has been shipped.\n${order.trackingNumber ? `\n📍 Tracking: ${order.trackingNumber}` : ''}`,
      delivered: '*Order Delivered*\nYour order has been delivered successfully! We hope you enjoy your fragrances! 🎉',
      cancelled: '*Order Cancelled*\nYour order has been cancelled.'
    };
    
    const emoji = statusEmojis[newStatus] || '📦';
    const statusMsg = statusMessages[newStatus] || 'Your order status has been updated.';
    
    const message = `${emoji} *OlfactiveEcho Update*

Hi ${user.name}!

Order #${orderId}
${statusMsg}

View order details: ${orderUrl}

Thank you for choosing OlfactiveEcho! 🌸`;
    
    const result = await sendWhatsAppMessage(phone, message);
    return { success: true, messageSid: result.sid, status: result.status };
  } catch (error) {
    console.error('❌ Order status update WhatsApp failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Send delivery failed WhatsApp message
const sendDeliveryFailedWhatsApp = async (order, user, reason) => {
  const phone = user.phone || order.shippingAddress?.phone;
  
  if (!phone) {
    console.log('⚠️ No phone number available for WhatsApp notification');
    return { success: false, error: 'No phone number available' };
  }
  
  try {
    const orderId = order._id.toString().slice(-8).toUpperCase();
    const orderUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order._id}`;
    
    const message = `⚠️ *Delivery Update*

Hi ${user.name},

We attempted to deliver your order #${orderId} but were unable to complete the delivery.

*Reason:* ${reason}

*What's next?*
We'll attempt delivery again soon. Please ensure someone is available at the delivery address.

Track your order: ${orderUrl}

Questions? Contact us at support@olfactiveecho.com

Thank you for your patience! 🌸`;
    
    const result = await sendWhatsAppMessage(phone, message);
    return { success: true, messageSid: result.sid, status: result.status };
  } catch (error) {
    console.error('❌ Delivery failed WhatsApp failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Send promotional WhatsApp message (with opt-out)
const sendPromotionalWhatsApp = async (phone, promoMessage) => {
  const message = `🌸 *OlfactiveEcho*

${promoMessage}

Reply STOP to unsubscribe from promotional messages.`;
  
  return await sendWhatsAppMessage(phone, message);
};

// Send WhatsApp with media (image)
const sendWhatsAppWithMedia = async (to, message, mediaUrl) => {
  try {
    const formattedPhone = formatWhatsAppNumber(to);
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    
    if (!twilioClient) {
      console.log('💬 WhatsApp with Media Simulation (Development Mode):');
      console.log(`   To: ${formattedPhone}`);
      console.log(`   Message: ${message}`);
      console.log(`   Media: ${mediaUrl}`);
      console.log(`   Status: ✅ Simulated successfully`);
      
      return {
        sid: `WA${Date.now()}`,
        status: 'simulated',
        to: formattedPhone,
        body: message,
        mediaUrl: [mediaUrl],
        dateCreated: new Date()
      };
    }
    
    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: formattedPhone,
      mediaUrl: [mediaUrl]
    });
    
    console.log('✅ WhatsApp message with media sent successfully');
    return result;
  } catch (error) {
    console.error('❌ WhatsApp message with media failed:', error.message);
    throw error;
  }
};

module.exports = {
  sendWhatsAppMessage,
  sendOrderConfirmationWhatsApp,
  sendOrderStatusUpdateWhatsApp,
  sendDeliveryFailedWhatsApp,
  sendPromotionalWhatsApp,
  sendWhatsAppWithMedia,
  formatWhatsAppNumber
};
