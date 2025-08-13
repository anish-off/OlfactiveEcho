import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Edit, Heart, ShoppingBag, Clock, MapPin, CreditCard, LogOut } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 123-4567',
    joinDate: 'Member since June 2023',
    avatar: '/assets/default-avatar.jpg',
    orders: 12,
    wishlist: 8,
    addresses: [
      {
        id: 1,
        type: 'Home',
        address: '123 Perfume Lane, Apt 4B, New York, NY 10001',
        default: true
      },
      {
        id: 2,
        type: 'Work',
        address: '456 Scent Street, Floor 12, New York, NY 10005',
        default: false
      }
    ],
    paymentMethods: [
      {
        id: 1,
        type: 'Visa',
        last4: '4242',
        expiry: '12/25',
        default: true
      }
    ]
  });

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
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
                <button className="absolute bottom-0 right-0 bg-amber-600 text-white p-2 rounded-full shadow-md hover:bg-amber-700 transition-colors">
                  <Edit size={16} />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-amber-700 mt-1">{user.joinDate}</p>
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
                  <p className="text-xl font-bold text-gray-900">{user.orders}</p>
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
                  <p className="text-xl font-bold text-gray-900">{user.wishlist}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Clock className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-xl font-bold text-gray-900">Jun 2023</p>
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
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">{user.name}</p>
                    </div>
                    <button className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
                      <Edit size={14} /> Edit
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                    <button className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
                      <Edit size={14} /> Edit
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">{user.phone}</p>
                    </div>
                    <button className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
                      <Edit size={14} /> Edit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <MapPin size={16} /> Add New Address
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map(address => (
                    <div key={address.id} className={`border rounded-lg p-4 ${address.default ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}`}>
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium text-gray-900">{address.type}</p>
                            {address.default && (
                              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{address.address}</p>
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

            {activeTab === 'payments' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Payment Methods</h2>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <CreditCard size={16} /> Add New Card
                  </button>
                </div>
                <div className="space-y-4">
                  {user.paymentMethods.map(payment => (
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
                  {[1, 2].map(order => (
                    <div key={order} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="bg-amber-100 p-3 rounded-lg">
                          <ShoppingBag className="text-amber-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Order #OLF{1000 + order}</p>
                          <p className="text-sm text-gray-500">Placed on June {10 + order}, 2023</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium text-amber-600">Delivered</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-medium text-gray-900">${120 + (order * 30)}.00</p>
                        </div>
                        <Link to={`/orders/${order}`} className="text-amber-600 hover:text-amber-700">
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    </div>
                  ))}
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