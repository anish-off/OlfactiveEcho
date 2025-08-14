import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Edit, Heart, ShoppingBag, Clock, MapPin, CreditCard } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { myOrders } from '@/api/order';
import toast from 'react-hot-toast';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  const { ids: wishlistIds } = useWishlist();
  const { totalItems } = useCart();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

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
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">{user?.name||'Guest'}</p>
                    </div>
                    <button className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
                      <Edit size={14} /> Edit
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium text-gray-900">{user?.email||'-'}</p>
                    </div>
                    <button className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
                      <Edit size={14} /> Edit
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">{user?.phone||'-'}</p>
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
                  {(user?.addresses||[]).map(address => (
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