import React, { useState, useEffect } from 'react';
import { Lock, Bell, Shield, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { changePassword, updatePreferences } from '@/api/auth';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AccountSettings = () => {
  const { user, refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState('password');
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Notification preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    newsletter: true
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    }
  }, [user]);

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', 'text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600', 'text-emerald-600'];
    
    return { strength, label: labels[strength], color: colors[strength] };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordStrength.strength < 4) {
      toast.error('Password does not meet security requirements');
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      setSavingPreferences(true);
      await updatePreferences(preferences);
      await refreshUser();
      toast.success('Preferences updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Account Settings</h1>
      
      {/* Settings Navigation */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('password')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeSection === 'password'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lock className="inline-block w-4 h-4 mr-2" />
          Password & Security
        </button>
        <button
          onClick={() => setActiveSection('notifications')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeSection === 'notifications'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Bell className="inline-block w-4 h-4 mr-2" />
          Notifications
        </button>
        <button
          onClick={() => setActiveSection('privacy')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeSection === 'privacy'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Shield className="inline-block w-4 h-4 mr-2" />
          Privacy
        </button>
      </div>

      {/* Password & Security Section */}
      {activeSection === 'password' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Lock className="text-amber-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Password & Security</h2>
              <p className="text-sm text-gray-600">Keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwordData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwordStrength.strength === 1 ? 'bg-red-500 w-1/5' :
                          passwordStrength.strength === 2 ? 'bg-orange-500 w-2/5' :
                          passwordStrength.strength === 3 ? 'bg-yellow-500 w-3/5' :
                          passwordStrength.strength === 4 ? 'bg-green-500 w-4/5' :
                          passwordStrength.strength === 5 ? 'bg-emerald-500 w-full' : ''
                        }`}
                      />
                    </div>
                    <span className={`text-sm font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="flex items-center gap-1">
                      <Check size={14} className={passwordData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'} />
                      At least 8 characters
                    </p>
                    <p className="flex items-center gap-1">
                      <Check size={14} className={/[A-Z]/.test(passwordData.newPassword) && /[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'} />
                      Uppercase and lowercase letters
                    </p>
                    <p className="flex items-center gap-1">
                      <Check size={14} className={/\d/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'} />
                      At least one number
                    </p>
                    <p className="flex items-center gap-1">
                      <Check size={14} className={/[^A-Za-z0-9]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'} />
                      At least one special character
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={changingPassword || passwordStrength.strength < 4 || passwordData.newPassword !== passwordData.confirmPassword}
              className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {changingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Notifications Section */}
      {activeSection === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Bell className="text-amber-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
              <p className="text-sm text-gray-600">Manage how you receive updates</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via text message</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.smsNotifications}
                  onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {/* Order Updates */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Order Updates</p>
                <p className="text-sm text-gray-600">Get updates about your orders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.orderUpdates}
                  onChange={(e) => setPreferences({ ...preferences, orderUpdates: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {/* Promotions */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Promotions & Offers</p>
                <p className="text-sm text-gray-600">Receive exclusive deals and offers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.promotions}
                  onChange={(e) => setPreferences({ ...preferences, promotions: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {/* Newsletter */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Newsletter</p>
                <p className="text-sm text-gray-600">Weekly fragrance tips and trends</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.newsletter}
                  onChange={(e) => setPreferences({ ...preferences, newsletter: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>

          <button
            onClick={handleUpdatePreferences}
            disabled={savingPreferences}
            className="w-full mt-6 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {savingPreferences ? 'Saving Preferences...' : 'Save Preferences'}
          </button>
        </motion.div>
      )}

      {/* Privacy Section */}
      {activeSection === 'privacy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Shield className="text-amber-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Privacy Settings</h2>
              <p className="text-sm text-gray-600">Control your data and privacy</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Account Information</h3>
              <p className="text-sm text-gray-600 mb-3">
                Your personal information is stored securely and encrypted.
              </p>
              <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                View Privacy Policy →
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Data Export</h3>
              <p className="text-sm text-gray-600 mb-3">
                Request a copy of your account data and order history.
              </p>
              <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Request Data Export →
              </button>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
              <p className="text-sm text-red-700 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                Delete Account →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AccountSettings;
