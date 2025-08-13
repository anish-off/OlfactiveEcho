import React from 'react';
import { Lock, Bell, Shield } from 'lucide-react';

const AccountSettings = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="text-amber-600" />
            <h2 className="font-bold">Password & Security</h2>
          </div>
          <button className="w-full py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            Change Password
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-amber-600" />
            <h2 className="font-bold">Notifications</h2>
          </div>
          <button className="w-full py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            Manage Notifications
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-amber-600" />
            <h2 className="font-bold">Privacy</h2>
          </div>
          <button className="w-full py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            Privacy Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;