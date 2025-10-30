import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Edit, Heart, ShoppingBag, Clock, MapPin, CreditCard, Save, X, Trash2, Plus } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { myOrders } from '@/api/order';
import { updateProfile, addAddress, updateAddress, deleteAddress } from '@/api/auth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, refreshUser } = useAuth();
  const { ids: wishlistIds } = useWishlist();
  const { totalItems } = useCart();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Address states
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: 'home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!user) return;
      try {
        setOrdersLoading(true);
        const data = await myOrders();
        if (!ignore) setOrders(data);
      } catch (e) {
        toast.error('Failed to load orders');
      } finally {
        if (!ignore) setOrdersLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setProfileData({
      name: user?.name || '',
      phone: user?.phone || ''
    });
  };

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setSavingProfile(true);
      await updateProfile(profileData);
      await refreshUser();
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setProfileData({
      name: user?.name || '',
      phone: user?.phone || ''
    });
  };

  const resetAddressForm = () => {
    setAddressForm({
      type: 'home',
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false
    });
  };

  const handleAddAddress = () => {
    resetAddressForm();
    setIsAddingAddress(true);
    setEditingAddressId(null);
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      type: address.type || 'home',
      fullName: address.fullName || '',
      phone: address.phone || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'India',
      isDefault: address.isDefault || false
    });
    setEditingAddressId(address._id);
    setIsAddingAddress(false);
  };

  const handleSaveAddress = async () => {
    // Validate required fields
    if (!addressForm.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!addressForm.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (!addressForm.addressLine1.trim()) {
      toast.error('Address line 1 is required');
      return;
    }
    if (!addressForm.city.trim()) {
      toast.error('City is required');
      return;
    }
    if (!addressForm.state.trim()) {
      toast.error('State is required');
      return;
    }
    if (!addressForm.postalCode.trim()) {
      toast.error('Postal code is required');
      return;
    }

    try {
      setSavingAddress(true);
      
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
        toast.success('Address updated successfully!');
      } else {
        await addAddress(addressForm);
        toast.success('Address added successfully!');
      }
      
      await refreshUser();
      setIsAddingAddress(false);
      setEditingAddressId(null);
      resetAddressForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleCancelAddress = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
    resetAddressForm();
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await deleteAddress(addressId);
      await refreshUser();
      toast.success('Address deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : '';
  const avatar = user?.avatarUrl || '/assets/default-avatar.jpg';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar - Already handled by LayoutWithSidebar */}
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img 
                  src={avatar} 
                  alt={user?.name||'User'} 
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
                <button className="absolute bottom-0 right-0 bg-amber-600 text-white p-2 rounded-full shadow-md hover:bg-amber-700 transition-colors">
                  <Edit size={16} />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name||'Guest'}</h1>
                <p className="text-gray-600">{user?.email||'No email'}</p>
                {joinDate && <p className="text-sm text-amber-700 mt-1">Member since {joinDate}</p>}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <ShoppingBag className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Orders</p>
                  <p className="text-xl font-bold text-gray-900">{ordersLoading ? '...' : orders.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Heart className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Wishlist</p>
                  <p className="text-xl font-bold text-gray-900">{wishlistIds.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Clock className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cart Items</p>
                  <p className="text-xl font-bold text-gray-900">{totalItems}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Personal Information
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'addresses'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Addresses
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'payments'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Payment Methods
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h2>
                
                {!isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium text-gray-900">{user?.name||'Guest'}</p>
                      </div>
                      <button 
                        onClick={handleEditProfile}
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Edit size={14} /> Edit
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-medium text-gray-900">{user?.email||'-'}</p>
                      </div>
                      <span className="text-gray-400 text-xs">Cannot be changed</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium text-gray-900">{user?.phone||'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                      >
                        <Save size={16} />
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancelEditProfile}
                        disabled={savingProfile}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
                  <button 
                    onClick={handleAddAddress}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <Plus size={16} /> Add New Address
                  </button>
                </div>

                <AnimatePresence>
                  {(isAddingAddress || editingAddressId) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 border border-amber-200 bg-amber-50 rounded-lg p-6"
                    >
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {editingAddressId ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={addressForm.type}
                            onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Enter full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 1 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.addressLine1}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="House number, street name"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            value={addressForm.addressLine2}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Apartment, suite, etc. (optional)"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Enter city"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Enter state"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.postalCode}
                            onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Enter postal code"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Enter country"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700">Set as default address</span>
                        </label>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={handleSaveAddress}
                          disabled={savingAddress}
                          className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                        >
                          <Save size={16} />
                          {savingAddress ? 'Saving...' : editingAddressId ? 'Update Address' : 'Add Address'}
                        </button>
                        <button
                          onClick={handleCancelAddress}
                          disabled={savingAddress}
                          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {(!user?.addresses || user.addresses.length === 0) ? (
                  <div className="text-center py-12 text-gray-500">
                    <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No addresses saved yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((address) => (
                      <motion.div
                        key={address._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`border rounded-lg p-4 ${
                          address.isDefault ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 capitalize">{address.type}</span>
                            {address.isDefault && (
                              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-gray-500 hover:text-amber-600 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-gray-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium text-gray-900">{address.fullName}</p>
                          <p>{address.phone}</p>
                          <p>{address.addressLine1}</p>
                          {address.addressLine2 && <p>{address.addressLine2}</p>}
                          <p>{address.city}, {address.state} {address.postalCode}</p>
                          <p>{address.country}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Payment Methods</h2>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <CreditCard size={16} /> Add New Card
                  </button>
                </div>
                <div className="space-y-4">
                  {(user?.paymentMethods||[]).map(payment => (
                    <div key={payment.id} className={`border rounded-lg p-4 ${payment.default ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}`}>
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium text-gray-900">{payment.type} •••• {payment.last4}</p>
                            {payment.default && (
                              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">Expires {payment.expiry}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-gray-500 hover:text-amber-600">
                            <Edit size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Orders Preview */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <Link to="/orders" className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  {(ordersLoading ? [] : orders).slice(0,2).map(order => (
                    <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="bg-amber-100 p-3 rounded-lg">
                          <ShoppingBag className="text-amber-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Order #{order._id.slice(-6)}</p>
                          <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-medium text-gray-900">₹{order.total?.toFixed(2) || '0.00'}</p>
                        </div>
                        <Link to={`/orders/${order._id}`} className="text-amber-600 hover:text-amber-700">
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {ordersLoading && <div className="text-sm text-gray-500">Loading orders...</div>}
                  {!ordersLoading && orders.length === 0 && <div className="text-sm text-gray-500">No orders yet.</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;