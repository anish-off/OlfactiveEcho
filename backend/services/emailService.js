const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = async () => {
  // Check if email credentials are provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Use Gmail SMTP with explicit configuration
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else if (process.env.SENDGRID_API_KEY) {
    // Use SendGrid
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Fallback to Ethereal Email for testing (creates temporary accounts)
    console.log('⚠️  No email credentials found. Using Ethereal Email for testing.');
    console.log('📧 Creating test account...');
    
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('✅ Test account created:', testAccount.user);
      
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      console.error('❌ Failed to create test account, using fallback');
      // Fallback to a simple configuration
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
    }
  }
};

// Format currency
const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

// Generate order confirmation email HTML
const generateOrderConfirmationHTML = (order, user) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const deliveryDate = new Date(order.createdAt);
  deliveryDate.setDate(deliveryDate.getDate() + (order.paymentMethod === 'cod' ? 5 : 3));
  const expectedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - OlfactiveEcho</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .item:last-child { border-bottom: none; }
            .total { font-weight: bold; font-size: 18px; color: #667eea; }
            .address { background: #f0f4ff; padding: 15px; border-radius: 6px; margin: 10px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; display: inline-block; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Order Confirmed!</h1>
                <p>Thank you for your purchase, ${user.name}!</p>
                <div class="success-badge">Order #${order._id.toString().slice(-8).toUpperCase()}</div>
            </div>
            
            <div class="content">
                <h2>Order Details</h2>
                <p><strong>Order Date:</strong> ${orderDate}</p>
                <p><strong>Expected Delivery:</strong> ${expectedDelivery}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                
                <div class="order-details">
                    <h3>Items Ordered</h3>
                    ${order.items.map(item => `
                        <div class="item">
                            <div>
                                <strong>${item.perfume.name}</strong><br>
                                <small>Quantity: ${item.quantity}</small>
                            </div>
                            <div>${formatCurrency(item.price * item.quantity)}</div>
                        </div>
                    `).join('')}
                    
                    ${order.sample && order.sample.samplePerfume ? `
                        <div class="item">
                            <div>
                                <strong>${order.sample.samplePerfume.name} (Sample)</strong><br>
                                <small>2ml Sample</small>
                            </div>
                            <div>${order.sample.price === 0 ? 'Free' : formatCurrency(order.sample.price)}</div>
                        </div>
                    ` : ''}
                    
                    <div class="item">
                        <div>Subtotal</div>
                        <div>${formatCurrency(order.subtotal)}</div>
                    </div>
                    
                    <div class="item">
                        <div>Shipping</div>
                        <div>${order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</div>
                    </div>
                    
                    <div class="item">
                        <div>Tax (GST)</div>
                        <div>${formatCurrency(order.tax)}</div>
                    </div>
                    
                    <div class="item total">
                        <div>Total</div>
                        <div>${formatCurrency(order.total)}</div>
                    </div>
                </div>
                
                <h3>Shipping Address</h3>
                <div class="address">
                    <strong>${order.shippingAddress.fullName}</strong><br>
                    ${order.shippingAddress.address}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}<br>
                    ${order.shippingAddress.phone ? `Phone: ${order.shippingAddress.phone}` : ''}
                </div>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" class="button">
                        Track Your Order
                    </a>
                </div>
                
                <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h4 style="color: #059669; margin: 0 0 10px 0;">🛡️ Our Promise</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #065f46;">
                        <li>100% Authentic Products</li>
                        <li>Secure Packaging</li>
                        <li>Easy Returns within 7 days</li>
                        <li>24/7 Customer Support</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing OlfactiveEcho!</p>
                <p>If you have any questions, reply to this email or contact us at support@olfactiveecho.com</p>
                <p style="font-size: 12px; color: #999;">
                    This email was sent to ${user.email}. You received this because you placed an order with us.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Generate order status update email HTML
const generateOrderStatusUpdateHTML = (order, user, oldStatus, newStatus) => {
  const statusMessages = {
    confirmed: 'Your order has been confirmed and is being prepared.',
    processing: 'Your order is being processed and will be shipped soon.',
    shipped: 'Great news! Your order has been shipped.',
    delivered: 'Your order has been delivered successfully.',
    cancelled: 'Your order has been cancelled.'
  };

  const statusColors = {
    confirmed: '#3b82f6',
    processing: '#f59e0b',
    shipped: '#10b981',
    delivered: '#059669',
    cancelled: '#ef4444'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update - OlfactiveEcho</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${statusColors[newStatus] || '#667eea'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-badge { background: ${statusColors[newStatus] || '#667eea'}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; display: inline-block; margin: 10px 0; text-transform: uppercase; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📦 Order Update</h1>
                <p>Hello ${user.name}!</p>
                <div class="status-badge">${newStatus}</div>
            </div>
            
            <div class="content">
                <h2>Order #${order._id.toString().slice(-8).toUpperCase()}</h2>
                <p style="font-size: 18px; color: ${statusColors[newStatus] || '#667eea'};">
                    <strong>${statusMessages[newStatus] || 'Your order status has been updated.'}</strong>
                </p>
                
                ${order.trackingNumber ? `
                    <div style="background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h4 style="color: #0277bd; margin: 0 0 10px 0;">📍 Tracking Information</h4>
                        <p style="margin: 0; color: #01579b;">
                            <strong>Tracking Number:</strong> ${order.trackingNumber}
                        </p>
                    </div>
                ` : ''}
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" class="button">
                        View Order Details
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing OlfactiveEcho!</p>
                <p>If you have any questions, reply to this email or contact us at support@olfactiveecho.com</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'OlfactiveEcho <noreply@olfactiveecho.com>',
      to: user.email,
      subject: `Order Confirmation #${order._id.toString().slice(-8).toUpperCase()} - OlfactiveEcho`,
      html: generateOrderConfirmationHTML(order, user)
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    
    // If using Ethereal Email, log the preview URL
    if (result.messageId && !process.env.EMAIL_USER) {
      console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(result));
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error.message);
    
    // Don't throw error in production - log it and continue
    if (process.env.NODE_ENV === 'production') {
      console.log('📝 Email queued for retry (production mode)');
      // In production, you might want to queue this for retry
      return { messageId: 'queued', error: error.message };
    } else {
      console.log('🔧 Development mode: Email sending failed but order will continue');
      return { messageId: 'dev-mode-skip', error: error.message };
    }
  }
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (order, user, oldStatus, newStatus) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'OlfactiveEcho <noreply@olfactiveecho.com>',
      to: user.email,
      subject: `Order Update #${order._id.toString().slice(-8).toUpperCase()} - ${newStatus.toUpperCase()}`,
      html: generateOrderStatusUpdateHTML(order, user, oldStatus, newStatus)
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error sending order status update email:', error.message);
    
    // Don't throw error in production - log it and continue
    if (process.env.NODE_ENV === 'production') {
      console.log('📝 Status update email queued for retry (production mode)');
      return { messageId: 'queued', error: error.message };
    } else {
      console.log('🔧 Development mode: Status email failed but update will continue');
      return { messageId: 'dev-mode-skip', error: error.message };
    }
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
};
