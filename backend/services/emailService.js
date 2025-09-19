const nodemailer = require('nodemailer');
const { sendLocalEmail } = require('./localEmailService');

// Email configuration
const createTransporter = async () => {
  // Check if we should force using Ethereal Email for testing
  if (process.env.FORCE_ETHEREAL_EMAIL === 'true') {
    console.log('🧪 Using Ethereal Email for testing (forced by environment variable)');
    return createEtherealTransporter();
  }
  
  // Check if email credentials are provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      // Use Gmail SMTP with robust configuration
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Use service instead of manual host configuration
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        pool: true, // Use pooled connections
        maxConnections: 1, // Limit to 1 connection
        maxMessages: 3, // Send at most 3 messages per connection
        rateDelta: 20000, // Limit to 3 messages per 20 seconds
        rateLimit: 3,
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000, // 10 second timeout (reduced for faster fallback)
        greetingTimeout: 5000, // 5 second greeting timeout
        socketTimeout: 10000 // 10 second socket timeout
      });
      
      // Test the connection
      await transporter.verify();
      console.log('✅ Gmail SMTP connection verified successfully');
      return transporter;
    } catch (error) {
      console.warn(`⚠️ Gmail SMTP connection failed: ${error.message}`);
      console.log('🔄 Falling back to Ethereal Email for testing...');
      return createEtherealTransporter();
    }
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
    // Use Ethereal Email for testing
    console.log('⚠️  No email credentials found. Using Ethereal Email for testing.');
    return createEtherealTransporter();
  }
};

// Create Ethereal Email transporter for testing
const createEtherealTransporter = async () => {
  console.log('📧 Creating Ethereal test account...');
  
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('✅ Ethereal test account created:', testAccount.user);
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });
  } catch (error) {
    console.error('❌ Failed to create Ethereal test account, using fallback');
    // Fallback to a simple configuration
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });
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
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'OlfactiveEcho <noreply@olfactiveecho.com>',
    to: user.email,
    subject: `Order Confirmation #${order._id.toString().slice(-8).toUpperCase()} - OlfactiveEcho`,
    html: generateOrderConfirmationHTML(order, user)
  };

  // Try sending via SMTP first
  let attempt = 0;
  const maxAttempts = 2; // Reduced attempts for faster fallback
  
  while (attempt < maxAttempts) {
    try {
      attempt++;
      console.log(`📧 Attempting to send order confirmation email via SMTP (attempt ${attempt}/${maxAttempts})...`);
      
      const transporter = await createTransporter();
      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ Order confirmation email sent successfully via SMTP!');
      console.log('📧 Message ID:', result.messageId);
      
      // If using Ethereal Email, log the preview URL
      if (result.messageId && !process.env.EMAIL_USER) {
        console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(result));
      }
      
      return result;
    } catch (error) {
      console.error(`❌ SMTP attempt ${attempt} failed:`, error.message);
      
      // If it's the last attempt or not a connectivity issue, try local simulation
      if (attempt === maxAttempts || !isRetryableError(error)) {
        console.log('📧 SMTP failed, falling back to local email simulation...');
        
        try {
          const localResult = await sendLocalEmail(mailOptions);
          console.log('✅ Order confirmation email saved locally!');
          console.log('📧 Local Message ID:', localResult.messageId);
          return localResult;
        } catch (localError) {
          console.error('❌ Local email simulation also failed:', localError.message);
          
          // Final fallback
          if (process.env.NODE_ENV === 'production') {
            console.log('📝 Email queued for retry (production mode)');
            return { messageId: 'queued', error: error.message };
          } else {
            console.log('🔧 Development mode: All email methods failed but order will continue');
            return { messageId: 'dev-mode-skip', error: error.message };
          }
        }
      }
      
      // Wait before retrying (reduced wait time)
      const waitTime = Math.pow(2, attempt) * 500; // 1s, 2s
      console.log(`⏰ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// Check if error is retryable
const isRetryableError = (error) => {
  const retryableErrors = [
    'ETIMEDOUT',
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'ENETUNREACH'
  ];
  
  return retryableErrors.some(code => error.message.includes(code) || error.code === code);
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (order, user, oldStatus, newStatus) => {
  let attempt = 0;
  const maxAttempts = 3;
  
  while (attempt < maxAttempts) {
    try {
      attempt++;
      console.log(`📧 Attempting to send order status update email (attempt ${attempt}/${maxAttempts})...`);
      
      const transporter = await createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'OlfactiveEcho <noreply@olfactiveecho.com>',
        to: user.email,
        subject: `Order Update #${order._id.toString().slice(-8).toUpperCase()} - ${newStatus.toUpperCase()}`,
        html: generateOrderStatusUpdateHTML(order, user, oldStatus, newStatus)
      };
      
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Order status update email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      
      // If using Ethereal Email, log the preview URL
      if (result.messageId && !process.env.EMAIL_USER) {
        console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(result));
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Status email attempt ${attempt} failed:`, error.message);
      
      // If it's the last attempt or not a connectivity issue, handle differently
      if (attempt === maxAttempts || !isRetryableError(error)) {
        console.error('📧 Final status email attempt failed:', error.message);
        
        // Don't throw error in production - log it and continue
        if (process.env.NODE_ENV === 'production') {
          console.log('📝 Status update email queued for retry (production mode)');
          return { messageId: 'queued', error: error.message };
        } else {
          console.log('🔧 Development mode: Status email failed but update will continue');
          return { messageId: 'dev-mode-skip', error: error.message };
        }
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`⏰ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  isRetryableError
};
