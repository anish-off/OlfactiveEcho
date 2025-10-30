import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  ChevronDown, 
  LogOut, 
  Settings, 
  Package, 
  Search, 
  Menu, 
  X,
  Home,
  Store,
  Users,
  Info,
  Brain
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '@/context/CartContext';
import LoginRedirectWrapper from './login/LoginRedirectWrapper';
import SearchBar from './product/SearchBar';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const { items: cartItems, subtotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        closeAllDropdowns();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    closeAllDropdowns();
  }, [location.pathname]);

  const isActiveRoute = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleAuthRequired = (e, action = 'access this feature') => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast((t) => (
        <div className="flex flex-col gap-2 text-sm">
          <div className="text-gray-800 font-medium">
            Please login to {action}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/login');
              }}
              className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700 transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-center',
      });
    }
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      setShowSearch(false);
      closeAllDropdowns();
    }
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center" onClick={closeAllDropdowns}>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                OLFACTIVE ECHO
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/') 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                }`}
                onClick={closeAllDropdowns}
              >
                <Home className="w-4 h-4 inline mr-2" />
                Home
              </Link>
              <Link 
                to="/products" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/products') 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                }`}
                onClick={(e) => {
                  closeAllDropdowns();
                  handleAuthRequired(e, 'browse products');
                }}
              >
                <Store className="w-4 h-4 inline mr-2" />
                Shop
              </Link>
              <Link 
                to="/collections" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/collections') 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                }`}
                onClick={(e) => {
                  closeAllDropdowns();
                  handleAuthRequired(e, 'view collections');
                }}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Collections
              </Link>
              <Link 
                to="/scent-matcher" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/scent-matcher') 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                }`}
                onClick={closeAllDropdowns}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                Scent Matcher
              </Link>
              <Link 
                to="/about" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveRoute('/about') 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                }`}
                onClick={closeAllDropdowns}
              >
                <Info className="w-4 h-4 inline mr-2" />
                About
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Search, Cart, and Wishlist - Only show when logged in */}
              {isLoggedIn && (
                <>
                  {/* Search Toggle - Desktop */}
                  <button 
                    className="hidden lg:block p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                    onClick={() => setShowSearch(!showSearch)}
                  >
                    <Search className="h-5 w-5" />
                  </button>

                  {/* Cart */}
                  <div className="relative dropdown-container">
                    <button 
                      onClick={() => toggleDropdown('cart')}
                      className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </button>

                    {openDropdown === 'cart' && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                        <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900">Shopping Cart ({cartItems.length} {cartItems.length===1?'item':'items'})</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {cartItems.length === 0 && (
                            <div className="p-4 text-center text-gray-500">Your cart is empty.</div>
                          )}
                          {cartItems.map((ci) => (
                            <div key={ci.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center space-x-3">
                                <img src={ci.product.imageUrl || 'https://via.placeholder.com/48x48?text=F'} alt={ci.product.name} className="w-12 h-12 rounded object-cover" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{ci.product.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {ci.quantity}</p>
                                  <p className="text-sm font-semibold text-amber-600">₹{ci.product.price}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-700">Subtotal</span>
                            <span className="text-lg font-bold text-gray-900">₹{subtotal}</span>
                          </div>
                          <LoginRedirectWrapper>
                            <Link
                              to="/cart"
                              onClick={closeAllDropdowns}
                              className="w-full flex items-center justify-center px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                            >
                              View Cart & Checkout
                            </Link>
                          </LoginRedirectWrapper>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Wishlist */}
                  <div className="relative dropdown-container">
                    <button 
                      onClick={() => toggleDropdown('wishlist')}
                      className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                    >
                      <Heart className="h-5 w-5" />
                    </button>

                    {openDropdown === 'wishlist' && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                        <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900">Your Wishlist</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto p-4 text-sm text-gray-600">Open wishlist page to view items.</div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                          <LoginRedirectWrapper>
                            <Link
                              to="/wishlist"
                              onClick={closeAllDropdowns}
                              className="w-full flex items-center justify-center px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                            >
                              View Wishlist
                            </Link>
                          </LoginRedirectWrapper>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Profile/Auth */}
              {isLoggedIn ? (
                <div className="relative dropdown-container">
                  <button
                    onClick={() => toggleDropdown('profile')}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden xl:inline text-sm font-medium text-gray-700">{user?.name || 'Account'}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${openDropdown === 'profile' ? 'transform rotate-180' : ''}`} />
                  </button>

                  {openDropdown === 'profile' && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                      {/* Profile Header */}
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-600">{user?.email || 'user@example.com'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={closeAllDropdowns}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                        >
                          <User className="h-4 w-4 mr-3 text-gray-500" />
                          My Profile
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={closeAllDropdowns}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                        >
                          <Package className="h-4 w-4 mr-3 text-gray-500" />
                          Dashboard
                        </Link>
                        <Link
                          to="/orders"
                          onClick={closeAllDropdowns}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                        >
                          <Package className="h-4 w-4 mr-3 text-gray-500" />
                          My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={closeAllDropdowns}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                        >
                          <Heart className="h-4 w-4 mr-3 text-gray-500" />
                          My Wishlist
                        </Link>
                        <Link
                          to="/settings"
                          onClick={closeAllDropdowns}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                        >
                          <Settings className="h-4 w-4 mr-3 text-gray-500" />
                          Account Settings
                        </Link>
                        
                        {/* Divider */}
                        <div className="border-t border-gray-100 my-2"></div>
                        
                        {/* Logout Button */}
                        <button
                          onClick={() => {
                            logout();
                            closeAllDropdowns();
                            navigate('/');
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <LoginRedirectWrapper>
                  <Link
                    to="/login"
                    onClick={closeAllDropdowns}
                    className="hidden sm:flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Sign In
                  </Link>
                </LoginRedirectWrapper>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search Bar */}
              {isLoggedIn && (
                <div className="mb-4">
                  <SearchBar 
                    onSearch={(query) => {
                      handleSearch(query);
                      setMobileMenuOpen(false);
                    }}
                    placeholder="Search perfumes..."
                  />
                </div>
              )}

              {/* Mobile Navigation Links */}
              <nav className="space-y-2">
                <Link
                  to="/"
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActiveRoute('/') 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5 mr-3" />
                  Home
                </Link>
                <Link
                  to="/products"
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActiveRoute('/products') 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                  }`}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleAuthRequired(e, 'browse products');
                  }}
                >
                  <Store className="w-5 h-5 mr-3" />
                  Shop
                </Link>
                <Link
                  to="/collections"
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActiveRoute('/collections') 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                  }`}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleAuthRequired(e, 'view collections');
                  }}
                >
                  <Package className="w-5 h-5 mr-3" />
                  Collections
                </Link>
                <Link
                  to="/scent-matcher"
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActiveRoute('/scent-matcher') 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Brain className="w-5 h-5 mr-3" />
                  Scent Matcher
                </Link>
                <Link
                  to="/about"
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActiveRoute('/about') 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Info className="w-5 h-5 mr-3" />
                  About
                </Link>
              </nav>
              
              {/* Mobile User Actions */}
              {isLoggedIn ? (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-3" />
                    My Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="w-5 h-5 mr-3" />
                    Dashboard
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="w-5 h-5 mr-3" />
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5 mr-3" />
                    My Wishlist
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-3 bg-amber-600 text-white text-base font-medium rounded-lg hover:bg-amber-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Bar Overlay - Desktop */}
        {showSearch && isLoggedIn && (
          <div className="hidden lg:block border-t border-gray-100 bg-white/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Search perfumes, brands, notes..."
              />
            </div>
          </div>
        )}
      </header>
      
      {/* Spacer for fixed navbar */}
      <div className={`transition-all duration-300 ${showSearch && isLoggedIn ? 'h-32' : 'h-16'}`}></div>
    </>
  );
};

export default Navbar;