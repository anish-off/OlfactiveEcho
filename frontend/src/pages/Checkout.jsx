import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const formatCurrency = (v) => `₹${(v ?? 0).toFixed(2)}`;

const AddressForm = ({ address, setAddress, title, errors = {} }) => {
  const handleChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input
            type="text"
            value={address.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter full name"
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={address.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter phone number"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Address *</label>
          <textarea
            value={address.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter complete address"
            rows="3"
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">City *</label>
          <input
            type="text"
            value={address.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter city"
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">State *</label>
          <select
            value={address.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select State</option>
            <option value="Delhi">Delhi</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Haryana">Haryana</option>
            <option value="Punjab">Punjab</option>
            <option value="Kerala">Kerala</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Telangana">Telangana</option>
            <option value="Odisha">Odisha</option>
            <option value="Bihar">Bihar</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Assam">Assam</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
            <option value="Goa">Goa</option>
            <option value="Tripura">Tripura</option>
            <option value="Manipur">Manipur</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Sikkim">Sikkim</option>
          </select>
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Pincode *</label>
          <input
            type="text"
            value={address.pincode || ''}
            onChange={(e) => handleChange('pincode', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter 6-digit pincode"
            maxLength="6"
          />
          {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={address.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter email address"
          />
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });
  
  const [billingAddress, setBillingAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });
  
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [selectedSample, setSelectedSample] = useState(null);
  const [availableSamples, setAvailableSamples] = useState([]);
  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review

  // Redirect if cart is empty
  useEffect(() => {
    if (!items.length) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  // Load available samples
  useEffect(() => {
    const loadSamples = async () => {
      try {
        const response = await api.get(`/cart/samples?cartTotal=${totalItems}`);
        if (response.data.success) {
          setAvailableSamples(response.data.samples);
        }
      } catch (error) {
        console.error('Error loading samples:', error);
      }
    };
    
    if (totalItems > 0) {
      loadSamples();
    }
  }, [totalItems]);

  // Update billing address when "same as shipping" changes
  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress({ ...shippingAddress });
    }
  }, [sameAsShipping, shippingAddress]);

  const validateAddresses = () => {
    const newErrors = {};
    
    // Validate shipping address
    if (!shippingAddress.fullName) newErrors.shippingFullName = 'Full name is required';
    if (!shippingAddress.address) newErrors.shippingAddress = 'Address is required';
    if (!shippingAddress.city) newErrors.shippingCity = 'City is required';
    if (!shippingAddress.state) newErrors.shippingState = 'State is required';
    if (!shippingAddress.pincode) newErrors.shippingPincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(shippingAddress.pincode)) newErrors.shippingPincode = 'Invalid pincode format';
    
    // Validate billing address if different
    if (!sameAsShipping) {
      if (!billingAddress.fullName) newErrors.billingFullName = 'Full name is required';
      if (!billingAddress.address) newErrors.billingAddress = 'Address is required';
      if (!billingAddress.city) newErrors.billingCity = 'City is required';
      if (!billingAddress.state) newErrors.billingState = 'State is required';
      if (!billingAddress.pincode) newErrors.billingPincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(billingAddress.pincode)) newErrors.billingPincode = 'Invalid pincode format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateAddresses()) {
      return;
    }
    
    // Validate cart items before checkout
    if (!items || items.length === 0) {
      setErrors({ general: 'Your cart is empty' });
      return;
    }
    
    setLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      // Ensure all items have valid perfume IDs
      const validItems = items.filter(item => item.id || item.product?._id);
      if (validItems.length !== items.length) {
        throw new Error('Some cart items are missing product information');
      }
      
      const checkoutData = {
        items: validItems.map(item => ({
          perfume: item.id || item.product._id,
          quantity: item.quantity || 1
        })),
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
        sample: selectedSample ? {
          samplePerfume: selectedSample._id,
          price: selectedSample.samplePrice || 0
        } : null
      };
      
      console.log('Checkout data being sent:', checkoutData);
      
      const response = await api.post('/orders/checkout', checkoutData);
      
      console.log('Checkout response:', response.data);
      
      if (response.data && response.data.success) {
        setOrderSummary(response.data.orderSummary);
        setStep(3);
      } else {
        setErrors({ general: response.data?.message || 'Checkout validation failed' });
      }
    } catch (error) {
      console.error('Checkout error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      let errorMessage = 'Checkout failed - please try again';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to continue with checkout';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid checkout data';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error - please check your connection';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!orderSummary) return;
    
    setLoading(true);
    try {
      const orderData = {
        ...orderSummary,
        paymentMethod,
        paymentId: paymentMethod === 'online' ? 'mock_payment_id' : null
      };
      
      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        clearCart();
        navigate('/orders', { 
          state: { 
            message: 'Order placed successfully!', 
            orderId: response.data.order._id 
          }
        });
      }
    } catch (error) {
      console.error('Order creation error:', error);
      setErrors({ general: error.response?.data?.message || 'Order creation failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return null;
  }

  const shipping = orderSummary?.shipping || (subtotal >= 1000 ? 0 : 50);
  const tax = orderSummary?.tax || (subtotal * 0.12);
  const samplePrice = selectedSample?.samplePrice || 0;
  const total = subtotal + shipping + tax + samplePrice;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                <span className={`ml-2 text-sm ${step >= stepNum ? 'text-primary' : 'text-gray-500'}`}>
                  {stepNum === 1 ? 'Address' : stepNum === 2 ? 'Payment' : 'Review'}
                </span>
                {stepNum < 3 && <div className="w-16 h-0.5 bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Step 1: Address Information */}
            {step === 1 && (
              <>
                <AddressForm
                  address={shippingAddress}
                  setAddress={setShippingAddress}
                  title="Shipping Address"
                  errors={{
                    fullName: errors.shippingFullName,
                    address: errors.shippingAddress,
                    city: errors.shippingCity,
                    state: errors.shippingState,
                    pincode: errors.shippingPincode
                  }}
                />

                <div className="bg-card rounded-lg p-6 shadow-sm">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="rounded"
                    />
                    <span>Billing address same as shipping address</span>
                  </label>
                </div>

                {!sameAsShipping && (
                  <AddressForm
                    address={billingAddress}
                    setAddress={setBillingAddress}
                    title="Billing Address"
                    errors={{
                      fullName: errors.billingFullName,
                      address: errors.billingAddress,
                      city: errors.billingCity,
                      state: errors.billingState,
                      pincode: errors.billingPincode
                    }}
                  />
                )}

                {/* Sample Selection */}
                {availableSamples.length > 0 && (
                  <div className="bg-card rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Add a Sample (Optional)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableSamples.slice(0, 6).map((sample) => (
                        <div
                          key={sample._id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedSample?._id === sample._id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedSample(
                            selectedSample?._id === sample._id ? null : sample
                          )}
                        >
                          <img
                            src={sample.imageUrl || '/placeholder.png'}
                            alt={sample.name}
                            className="w-full h-16 object-cover rounded mb-2"
                          />
                          <h4 className="font-medium text-sm">{sample.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {sample.samplePrice === 0 ? 'Free' : formatCurrency(sample.samplePrice)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Link to="/cart" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Back to Cart
                  </Link>
                  <button
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    Continue to Payment
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <>
                <div className="bg-card rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay when you receive your order</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div>
                        <div className="font-medium">Online Payment</div>
                        <div className="text-sm text-gray-600">Pay securely with UPI, Card, or Net Banking</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Review Order'}
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Order Review */}
            {step === 3 && orderSummary && (
              <>
                <div className="bg-card rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Order Review</h3>
                  
                  {/* Items */}
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.product.imageUrl || '/placeholder.png'}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                    
                    {selectedSample && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center space-x-3">
                          <img
                            src={selectedSample.imageUrl || '/placeholder.png'}
                            alt={selectedSample.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium">{selectedSample.name} (Sample)</h4>
                            <p className="text-sm text-gray-600">Qty: 1</p>
                          </div>
                        </div>
                        <span className="font-medium">
                          {selectedSample.samplePrice === 0 ? 'Free' : formatCurrency(selectedSample.samplePrice)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Addresses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-medium mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-600">
                        <p>{shippingAddress.fullName}</p>
                        <p>{shippingAddress.address}</p>
                        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                        {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Payment Method</h4>
                      <p className="text-sm text-gray-600">
                        {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 shadow-sm sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                {selectedSample && (
                  <div className="flex justify-between">
                    <span>Sample</span>
                    <span>{selectedSample.samplePrice === 0 ? 'Free' : formatCurrency(selectedSample.samplePrice)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
              
              {shipping === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-600 text-sm">🎉 You've qualified for free shipping!</p>
                </div>
              )}
              
              {subtotal < 1000 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-600 text-sm">
                    Add {formatCurrency(1000 - subtotal)} more for free shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 
