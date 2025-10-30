import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  BellIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon,
  ShoppingBagIcon,
  MegaphoneIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: false,
    orderUpdates: true,
    promotions: true,
    newsletter: true
  });

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      
      if (data.preferences) {
        setPreferences(data.preferences);
      }
      
      if (data.phone) {
        setPhoneNumber(data.phone);
        setPhoneVerified(true);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
    if (value.length < 10) {
      setPhoneVerified(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          preferences,
          phone: phoneNumber || undefined
        })
      });

      if (!response.ok) throw new Error('Failed to save settings');

      const data = await response.json();
      
      toast.success('Notification settings saved successfully!');
      
      // Update verified status if phone was saved
      if (phoneNumber && phoneNumber.length === 10) {
        setPhoneVerified(true);
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const notificationOptions = [
    {
      key: 'emailNotifications',
      icon: EnvelopeIcon,
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      color: 'blue'
    },
    {
      key: 'smsNotifications',
      icon: DevicePhoneMobileIcon,
      title: 'SMS Notifications',
      description: 'Receive notifications via SMS (requires phone number)',
      color: 'green',
      requiresPhone: true
    },
    {
      key: 'whatsappNotifications',
      icon: DevicePhoneMobileIcon,
      title: 'WhatsApp Notifications',
      description: 'Receive notifications via WhatsApp (uses same phone number)',
      color: 'green',
      requiresPhone: true,
      badge: 'New'
    },
    {
      key: 'orderUpdates',
      icon: ShoppingBagIcon,
      title: 'Order Updates',
      description: 'Get notified about order status changes, shipping, and delivery',
      color: 'purple'
    },
    {
      key: 'promotions',
      icon: MegaphoneIcon,
      title: 'Promotional Offers',
      description: 'Receive exclusive deals, discounts, and special offers',
      color: 'orange'
    },
    {
      key: 'newsletter',
      icon: NewspaperIcon,
      title: 'Newsletter',
      description: 'Get updates about new products, fragrance tips, and more',
      color: 'pink'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-orange-100 rounded-xl">
          <BellIcon className="h-8 w-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600 mt-1">Manage how you receive updates from OlfactiveEcho</p>
        </div>
      </div>

      {/* Phone Number Section (for SMS) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <DevicePhoneMobileIcon className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Phone Number</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          Add your phone number to receive SMS notifications for important order updates
        </p>

        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-500">+91</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                maxLength={10}
              />
            </div>
            {phoneNumber && phoneNumber.length === 10 && phoneVerified && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Phone number verified
              </p>
            )}
            {phoneNumber && phoneNumber.length < 10 && (
              <p className="text-sm text-orange-600 mt-2">
                Please enter a valid 10-digit phone number
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Notification Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>

        <div className="space-y-4">
          {notificationOptions.map((option, index) => {
            const Icon = option.icon;
            const isDisabled = option.requiresPhone && (!phoneNumber || phoneNumber.length < 10);
            
            return (
              <motion.div
                key={option.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                  preferences[option.key] && !isDisabled
                    ? `border-${option.color}-200 bg-${option.color}-50`
                    : 'border-gray-200 bg-gray-50'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`p-2 rounded-lg bg-${option.color}-100`}>
                  <Icon className={`h-6 w-6 text-${option.color}-600`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{option.title}</h3>
                        {option.badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                            {option.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      {isDisabled && (
                        <p className="text-xs text-orange-600 mt-2">
                          ⚠️ Add phone number to enable {option.title.includes('WhatsApp') ? 'WhatsApp' : 'SMS'} notifications
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => !isDisabled && handleToggle(option.key)}
                      disabled={isDisabled}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences[option.key] && !isDisabled
                          ? `bg-${option.color}-600`
                          : 'bg-gray-300'
                      } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences[option.key] && !isDisabled
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6"
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">About Notifications</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Order Updates:</strong> Receive real-time notifications when your order is confirmed, shipped, or delivered</li>
              <li>• <strong>WhatsApp Alerts:</strong> Get instant WhatsApp updates with rich formatting and emojis (requires Twilio Sandbox setup)</li>
              <li>• <strong>SMS Alerts:</strong> Get instant SMS updates for critical order events (requires phone verification)</li>
              <li>• <strong>Email Notifications:</strong> Detailed updates with tracking information sent to your email</li>
              <li>• <strong>Privacy:</strong> Your contact information is kept secure and never shared with third parties</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
