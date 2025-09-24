import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BellIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [settings, setSettings] = useState({
    store: {
      name: 'OlfactiveEcho',
      description: 'Premium Fragrance E-commerce Platform',
      logo: '/olfactiveecho-mark.svg',
      address: '',
      phone: '',
      email: 'admin@olfactiveecho.com',
      currency: 'INR',
      timezone: 'Asia/Kolkata'
    },
    shipping: {
      freeShippingThreshold: 5000,
      standardShippingRate: 100,
      expressShippingRate: 200,
      codCharges: 50,
      maxCodAmount: 50000,
      processingDays: 2
    },
    payments: {
      codEnabled: true,
      onlinePaymentsEnabled: true,
      razorpayEnabled: false,
      stripeEnabled: false,
      paypalEnabled: false
    },
    taxes: {
      gstEnabled: true,
      gstRate: 18,
      includeGstInPrice: false,
      taxCalculationMethod: 'exclusive'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      orderConfirmation: true,
      shipmentUpdates: true,
      lowStockAlerts: true,
      newCustomerWelcome: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);

  const tabs = [
    { id: 'store', name: 'Store Details', icon: BuildingStorefrontIcon },
    { id: 'shipping', name: 'Shipping', icon: TruckIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
    { id: 'taxes', name: 'Taxes', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'admins', name: 'Admin Users', icon: UserGroupIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ];

  useEffect(() => {
    fetchSettings();
    if (activeTab === 'admins') {
      fetchAdmins();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    // In a real app, fetch settings from API
    // For now, using default settings
  };

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users?role=admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.data?.users || []);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleSaveSettings = async (section) => {
    setLoading(true);
    try {
      // In a real app, save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const renderStoreSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
          <input
            type="text"
            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={settings.store.name}
            onChange={(e) => updateSetting('store', 'name', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={settings.store.email}
            onChange={(e) => updateSetting('store', 'email', e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          rows={3}
          className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          value={settings.store.description}
          onChange={(e) => updateSetting('store', 'description', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <textarea
          rows={3}
          className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          value={settings.store.address}
          onChange={(e) => updateSetting('store', 'address', e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={settings.store.phone}
            onChange={(e) => updateSetting('store', 'phone', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={settings.store.currency}
            onChange={(e) => updateSetting('store', 'currency', e.target.value)}
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (₹)</label>
          <input
            type="number"
            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={settings.shipping.freeShippingThreshold}
            onChange={(e) => updateSetting('shipping', 'freeShippingThreshold', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Standard Shipping Rate (₹)</label>
          <input
            type="number"
            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={settings.shipping.standardShippingRate}
            onChange={(e) => updateSetting('shipping', 'standardShippingRate', parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Express Shipping Rate (₹)</label>
          <input
            type="number"
            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={settings.shipping.expressShippingRate}
            onChange={(e) => updateSetting('shipping', 'expressShippingRate', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">COD Charges (₹)</label>
          <input
            type="number"
            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={settings.shipping.codCharges}
            onChange={(e) => updateSetting('shipping', 'codCharges', parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max COD Amount (₹)</label>
          <input
            type="number"
            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={settings.shipping.maxCodAmount}
            onChange={(e) => updateSetting('shipping', 'maxCodAmount', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Processing Days</label>
          <input
            type="number"
            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={settings.shipping.processingDays}
            onChange={(e) => updateSetting('shipping', 'processingDays', parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Cash on Delivery (COD)</h4>
            <p className="text-sm text-gray-500">Allow customers to pay on delivery</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.payments.codEnabled}
              onChange={(e) => updateSetting('payments', 'codEnabled', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Online Payments</h4>
            <p className="text-sm text-gray-500">Enable online payment gateways</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.payments.onlinePaymentsEnabled}
              onChange={(e) => updateSetting('payments', 'onlinePaymentsEnabled', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Payment Gateway Configuration</h4>
        <p className="text-sm text-yellow-700">
          To enable online payments, you'll need to configure payment gateways like Razorpay, Stripe, or PayPal. 
          Contact your developer to set up the API keys and webhook endpoints.
        </p>
      </div>
    </div>
  );

  const renderTaxSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">GST Enabled</h4>
          <p className="text-sm text-gray-500">Enable GST calculation for Indian customers</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.taxes.gstEnabled}
            onChange={(e) => updateSetting('taxes', 'gstEnabled', e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>
      
      {settings.taxes.gstEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              value={settings.taxes.gstRate}
              onChange={(e) => updateSetting('taxes', 'gstRate', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Calculation</label>
            <select
              className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              value={settings.taxes.taxCalculationMethod}
              onChange={(e) => updateSetting('taxes', 'taxCalculationMethod', e.target.value)}
            >
              <option value="exclusive">Exclusive (Add to price)</option>
              <option value="inclusive">Inclusive (Include in price)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <p className="text-sm text-gray-500">
              {key === 'emailNotifications' && 'Send email notifications to customers'}
              {key === 'smsNotifications' && 'Send SMS notifications to customers'}
              {key === 'orderConfirmation' && 'Send order confirmation emails'}
              {key === 'shipmentUpdates' && 'Send shipment tracking updates'}
              {key === 'lowStockAlerts' && 'Alert admins when stock is low'}
              {key === 'newCustomerWelcome' && 'Welcome new customers with email'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={value}
              onChange={(e) => updateSetting('notifications', key, e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      ))}
    </div>
  );

  const renderAdminSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Admin User Management</h4>
        <p className="text-sm text-blue-700">
          Manage admin users who have access to this dashboard. Only existing admins can create new admin accounts.
        </p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{admin.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-medium text-red-800 mb-2">Security Settings</h4>
        <p className="text-sm text-red-700">
          These settings affect the security of your admin panel. Changes should be made carefully.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Session Timeout</h4>
          <p className="text-sm text-gray-500 mb-3">Automatically log out admin users after inactivity</p>
          <select className="w-full md:w-48 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="480">8 hours</option>
          </select>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
          <p className="text-sm text-gray-500 mb-3">Require 2FA for all admin accounts (Coming Soon)</p>
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            Enable 2FA (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your store settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeTab === 'store' && renderStoreSettings()}
            {activeTab === 'shipping' && renderShippingSettings()}
            {activeTab === 'payments' && renderPaymentSettings()}
            {activeTab === 'taxes' && renderTaxSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'admins' && renderAdminSettings()}
            {activeTab === 'security' && renderSecuritySettings()}

            {/* Save Button */}
            {activeTab !== 'admins' && activeTab !== 'security' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleSaveSettings(activeTab)}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
