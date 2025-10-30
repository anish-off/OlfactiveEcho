const { 
  sendOrderConfirmationEmail, 
  sendOrderStatusUpdateEmail,
  sendReturnRequestEmail,
  sendDeliveryFailedEmail
} = require('./emailService');

const {
  sendOrderConfirmationSMS,
  sendOrderStatusUpdateSMS,
  sendDeliveryFailedSMS,
  sendReturnApprovedSMS
} = require('./smsService');

const {
  sendOrderConfirmationWhatsApp,
  sendOrderStatusUpdateWhatsApp,
  sendDeliveryFailedWhatsApp
} = require('./whatsappService');

const ActivityLog = require('../models/ActivityLog');

// Unified notification service that handles both email and SMS
class NotificationService {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  // Log notification activity
  async logActivity(type, user, details) {
    try {
      await ActivityLog.create({
        type,
        user: user?._id,
        details,
        message: `Notification sent: ${type}`
      });
    } catch (error) {
      console.error('Failed to log notification activity:', error.message);
    }
  }

  // Send order confirmation notification (Email + SMS + WhatsApp)
  async sendOrderConfirmation(order, user) {
    console.log(`📢 Sending order confirmation notifications for Order #${order._id}`);
    
    const results = {
      email: null,
      sms: null,
      whatsapp: null,
      success: false
    };

    try {
      // Send Email (always)
      if (user.preferences?.emailNotifications !== false) {
        try {
          results.email = await sendOrderConfirmationEmail(order, user);
          console.log('✅ Order confirmation email sent');
        } catch (error) {
          console.error('❌ Order confirmation email failed:', error.message);
        }
      }

      // Send SMS (if phone available and user opted in)
      if (user.preferences?.smsNotifications && (user.phone || order.shippingAddress?.phone)) {
        try {
          results.sms = await sendOrderConfirmationSMS(order, user);
          console.log('✅ Order confirmation SMS sent');
        } catch (error) {
          console.error('❌ Order confirmation SMS failed:', error.message);
        }
      }

      // Send WhatsApp (if phone available and user opted in)
      const hasPhone = !!(user.phone || order.shippingAddress?.phone);
      const whatsappEnabled = user.preferences?.whatsappNotifications === true;
      
      console.log(`📱 WhatsApp check: enabled=${whatsappEnabled}, hasPhone=${hasPhone}, phone=${user.phone || order.shippingAddress?.phone}`);
      
      if (whatsappEnabled && hasPhone) {
        try {
          results.whatsapp = await sendOrderConfirmationWhatsApp(order, user);
          console.log('✅ Order confirmation WhatsApp sent');
        } catch (error) {
          console.error('❌ Order confirmation WhatsApp failed:', error.message);
        }
      } else {
        if (!whatsappEnabled) {
          console.log('ℹ️ WhatsApp notifications disabled for this user');
        }
        if (!hasPhone) {
          console.log('ℹ️ No phone number available for WhatsApp');
        }
      }

      results.success = !!(results.email || results.sms || results.whatsapp);

      // Log activity
      await this.logActivity('order_created', user, {
        orderId: order._id,
        notificationsSent: {
          email: !!results.email,
          sms: !!results.sms,
          whatsapp: !!results.whatsapp
        }
      });

      return results;
    } catch (error) {
      console.error('❌ Order confirmation notification failed:', error.message);
      return results;
    }
  }

  // Send order status update notification (Email + SMS + WhatsApp)
  async sendOrderStatusUpdate(order, user, oldStatus, newStatus) {
    console.log(`📢 Sending order status update notifications: ${oldStatus} → ${newStatus}`);
    
    const results = {
      email: null,
      sms: null,
      whatsapp: null,
      success: false
    };

    try {
      // Send Email
      if (user.preferences?.emailNotifications !== false && user.preferences?.orderUpdates !== false) {
        try {
          results.email = await sendOrderStatusUpdateEmail(order, user, oldStatus, newStatus);
          console.log('✅ Order status update email sent');
        } catch (error) {
          console.error('❌ Order status update email failed:', error.message);
        }
      }

      // Send SMS
      if (user.preferences?.smsNotifications && user.preferences?.orderUpdates !== false) {
        try {
          results.sms = await sendOrderStatusUpdateSMS(order, user, newStatus);
          console.log('✅ Order status update SMS sent');
        } catch (error) {
          console.error('❌ Order status update SMS failed:', error.message);
        }
      }

      // Send WhatsApp
      if (user.preferences?.whatsappNotifications && user.preferences?.orderUpdates !== false) {
        try {
          results.whatsapp = await sendOrderStatusUpdateWhatsApp(order, user, newStatus);
          console.log('✅ Order status update WhatsApp sent');
        } catch (error) {
          console.error('❌ Order status update WhatsApp failed:', error.message);
        }
      }

      results.success = !!(results.email || results.sms || results.whatsapp);

      // Log activity
      await this.logActivity('order_updated', user, {
        orderId: order._id,
        statusChange: { from: oldStatus, to: newStatus },
        notificationsSent: {
          email: !!results.email,
          sms: !!results.sms,
          whatsapp: !!results.whatsapp
        }
      });

      return results;
    } catch (error) {
      console.error('❌ Order status update notification failed:', error.message);
      return results;
    }
  }

  // Send delivery failed notification (Email + SMS + WhatsApp)
  async sendDeliveryFailed(order, user, reason, nextAttemptDate) {
    console.log(`📢 Sending delivery failed notifications for Order #${order._id}`);
    
    const results = {
      email: null,
      sms: null,
      whatsapp: null,
      success: false
    };

    try {
      // Send Email
      if (user.preferences?.emailNotifications !== false) {
        try {
          results.email = await sendDeliveryFailedEmail(order, user, reason, nextAttemptDate);
          console.log('✅ Delivery failed email sent');
        } catch (error) {
          console.error('❌ Delivery failed email failed:', error.message);
        }
      }

      // Send SMS
      if (user.preferences?.smsNotifications) {
        try {
          results.sms = await sendDeliveryFailedSMS(order, user, reason);
          console.log('✅ Delivery failed SMS sent');
        } catch (error) {
          console.error('❌ Delivery failed SMS failed:', error.message);
        }
      }

      // Send WhatsApp
      if (user.preferences?.whatsappNotifications) {
        try {
          results.whatsapp = await sendDeliveryFailedWhatsApp(order, user, reason);
          console.log('✅ Delivery failed WhatsApp sent');
        } catch (error) {
          console.error('❌ Delivery failed WhatsApp failed:', error.message);
        }
      }

      results.success = !!(results.email || results.sms || results.whatsapp);

      return results;
    } catch (error) {
      console.error('❌ Delivery failed notification failed:', error.message);
      return results;
    }
  }

  // Send return request notification (Email only - detailed info)
  async sendReturnRequest(order, user) {
    console.log(`📢 Sending return request notification for Order #${order._id}`);
    
    try {
      if (user.preferences?.emailNotifications !== false) {
        const result = await sendReturnRequestEmail(order, user);
        console.log('✅ Return request email sent');
        
        // Log activity
        await this.logActivity('order_updated', user, {
          orderId: order._id,
          action: 'return_requested',
          notificationSent: true
        });
        
        return { email: result, success: true };
      }
      
      return { email: null, success: false };
    } catch (error) {
      console.error('❌ Return request notification failed:', error.message);
      return { email: null, success: false };
    }
  }

  // Send return approved notification (Email + SMS)
  async sendReturnApproved(order, user) {
    console.log(`📢 Sending return approved notifications for Order #${order._id}`);
    
    const results = {
      email: null,
      sms: null,
      success: false
    };

    try {
      // Send SMS
      if (user.preferences?.smsNotifications) {
        try {
          results.sms = await sendReturnApprovedSMS(order, user);
          console.log('✅ Return approved SMS sent');
        } catch (error) {
          console.error('❌ Return approved SMS failed:', error.message);
        }
      }

      results.success = !!results.sms;

      return results;
    } catch (error) {
      console.error('❌ Return approved notification failed:', error.message);
      return results;
    }
  }

  // Send low stock alert (Admin notification)
  async sendLowStockAlert(product, currentStock, adminContact) {
    console.log(`📢 Sending low stock alert for ${product.name}`);
    
    try {
      const { sendLowStockAlertSMS } = require('./smsService');
      
      if (adminContact?.phone) {
        await sendLowStockAlertSMS(adminContact.phone, product.name, currentStock);
        console.log('✅ Low stock alert SMS sent to admin');
      }

      // Log activity
      await this.logActivity('stock_updated', null, {
        productId: product._id,
        productName: product.name,
        currentStock,
        alertSent: true
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Low stock alert failed:', error.message);
      return { success: false };
    }
  }

  // Batch send promotional notifications
  async sendPromotionalNotification(users, message, type = 'promotion') {
    console.log(`📢 Sending promotional notifications to ${users.length} users`);
    
    const results = {
      sent: 0,
      failed: 0,
      skipped: 0
    };

    for (const user of users) {
      try {
        // Check if user has opted in for promotions
        if (user.preferences?.promotions === false) {
          results.skipped++;
          continue;
        }

        // Send based on user preferences
        if (user.preferences?.emailNotifications !== false) {
          // Send email (implement promotional email template as needed)
          results.sent++;
        }

        if (user.preferences?.smsNotifications && user.phone) {
          const { sendPromotionalSMS } = require('./smsService');
          await sendPromotionalSMS(user.phone, message);
          results.sent++;
        }
      } catch (error) {
        console.error(`Failed to send promotional notification to user ${user._id}:`, error.message);
        results.failed++;
      }
    }

    console.log(`✅ Promotional notifications completed: ${results.sent} sent, ${results.failed} failed, ${results.skipped} skipped`);
    return results;
  }

  // Queue notification for async processing
  async queueNotification(type, data) {
    this.queue.push({ type, data, timestamp: Date.now() });
    
    if (!this.processing) {
      this.processQueue();
    }
  }

  // Process notification queue
  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const notification = this.queue.shift();

    try {
      switch (notification.type) {
        case 'order_confirmation':
          await this.sendOrderConfirmation(notification.data.order, notification.data.user);
          break;
        case 'order_status':
          await this.sendOrderStatusUpdate(
            notification.data.order,
            notification.data.user,
            notification.data.oldStatus,
            notification.data.newStatus
          );
          break;
        case 'delivery_failed':
          await this.sendDeliveryFailed(
            notification.data.order,
            notification.data.user,
            notification.data.reason,
            notification.data.nextAttemptDate
          );
          break;
        default:
          console.warn(`Unknown notification type: ${notification.type}`);
      }
    } catch (error) {
      console.error('Queue processing error:', error.message);
    }

    // Process next item
    setTimeout(() => this.processQueue(), 1000);
  }
}

// Export singleton instance
module.exports = new NotificationService();
