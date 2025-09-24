import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import PaymentOptions from '../components/payment/PaymentOptions';
import PaymentProcessor from '../components/payment/PaymentProcessor';
import OrderReview from '../components/payment/OrderReview';
import useAdvancedDiscounts from '../hooks/useAdvancedDiscounts';

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
  const { items, subtotal, totalItems, clearCart, regularItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Apply advanced discounts
  const cartItemsForDiscount = regularItems?.map(item => ({
    ...item.product,
    quantity: item.quantity,
    price: item.product?.price || 0
  })) || [];
  
  const { applicableOffers, totalSavings, freeItems } = useAdvancedDiscounts(cartItemsForDiscount, subtotal || 0);
  const discountedSubtotal = Math.max(0, (subtotal || 0) - totalSavings);
  
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
  const [selectedOnlineMethod, setSelectedOnlineMethod] = useState('upi');
  const [selectedSample, setSelectedSample] = useState(null);
  const [availableSamples, setAvailableSamples] = useState([]);
  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review, 4: Payment Processing
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);

  // Redirect if cart is empty (temporarily disabled for debugging)
  useEffect(() => {
    console.log('🛒 Cart items check:', items.length);
    if (!items.length && step === 1) { // Only redirect on step 1, not during order placement
      console.log('⚠️ Cart is empty, redirecting to cart page');
      navigate('/cart');
    }
  }, [items.length, navigate, step]);

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
    console.log('handleCheckout called, current step:', step);
    
    if (!validateAddresses()) {
      console.log('Address validation failed');
      return;
    }
    
    // Move to payment step
    setStep(2);
  };

  const handleReviewOrder = async () => {
    console.log('handleReviewOrder called');
    console.log('Current addresses:', { shippingAddress, billingAddress });
    console.log('Current items:', items);
    console.log('Payment method:', paymentMethod, 'Selected online method:', selectedOnlineMethod);
    
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
      
      // Create order summary locally for review
      const shipping = discountedSubtotal >= 1000 ? 0 : 50;
      const tax = discountedSubtotal * 0.12;
      const samplePrice = selectedSample?.samplePrice || 0;
      const total = discountedSubtotal + shipping + tax + samplePrice;
      
      const localOrderSummary = {
        items: validItems.map(item => ({
          perfume: item.id || item.product._id,
          quantity: item.quantity || 1,
          price: item.product.price,
          name: item.product.name
        })),
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod: paymentMethod === 'online' ? selectedOnlineMethod : paymentMethod,
        sample: selectedSample ? {
          samplePerfume: selectedSample._id,
          price: selectedSample.samplePrice || 0,
          name: selectedSample.name
        } : null,
        subtotal,
        discountedSubtotal,
        totalSavings,
        applicableOffers,
        shipping,
        tax,
        total,
        totalItems
      };
      
      console.log('Order summary created:', localOrderSummary);
      
      // Try to validate with backend, but proceed even if it fails
      try {
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
        
        const response = await api.post('/orders/checkout', checkoutData);
        
        if (response.data && response.data.success) {
          setOrderSummary(response.data.orderSummary);
        } else {
          // Use local order summary if backend validation fails
          setOrderSummary(localOrderSummary);
        }
      } catch (apiError) {
        console.log('Backend validation failed, using local order summary:', apiError.message);
        // Use local order summary if API call fails
        setOrderSummary(localOrderSummary);
      }
      
      // Always proceed to review step
      console.log('Setting step to 3');
      setStep(3);
      
    } catch (error) {
      console.error('Review order error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      let errorMessage = 'Failed to create order summary - please try again';
      
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

  const handlePlaceOrder = async (paymentData = null) => {
    console.log('🚀 handlePlaceOrder called');
    console.log('📋 orderSummary:', orderSummary);
    console.log('🛒 items:', items);
    console.log('💳 paymentMethod:', paymentMethod);
    console.log('🔗 selectedOnlineMethod:', selectedOnlineMethod);
    
    if (!orderSummary) {
      console.error('❌ No orderSummary found');
      setErrors({ general: 'Order summary not found. Please try again.' });
      return;
    }
    
    setLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      const orderData = {
        ...orderSummary,
        paymentMethod: paymentMethod === 'online' ? selectedOnlineMethod : paymentMethod,
        paymentId: paymentData?.paymentId || (paymentMethod !== 'cod' ? 'mock_payment_id' : null),
        paymentStatus: paymentData?.status || 'pending'
      };
      
      console.log('📤 Sending order data:', orderData);
      
      const response = await api.post('/orders', orderData);
      
      console.log('📥 Order response:', response.data);
      
      if (response.data.success) {
        clearCart();
        navigate('/order-confirmation', { 
          state: { 
            message: 'Order placed successfully!', 
            orderId: response.data.order._id,
            orderNumber: response.data.order._id.slice(-8).toUpperCase(),
            paymentMethod: paymentMethod === 'online' ? selectedOnlineMethod : paymentMethod,
            emailSent: true
          }
        });
      }
    } catch (error) {
      console.error('❌ Order creation error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      let errorMessage = 'Order creation failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to place an order';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid order data. Please check your information.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    handlePlaceOrder(paymentData);
  };

  const handlePaymentError = (error) => {
    setErrors({ general: error });
    setShowPaymentProcessor(false);
    setStep(3);
  };

  const handlePaymentCancel = () => {
    setShowPaymentProcessor(false);
    setStep(3);
  };

  const handleEditOrder = (section) => {
    switch (section) {
      case 'items':
        navigate('/cart');
        break;
      case 'address':
        setStep(1);
        break;
      case 'payment':
        setStep(2);
        break;
      default:
        break;
    }
  };

  const proceedToPayment = () => {
    if (paymentMethod === 'cod') {
      handlePlaceOrder();
    } else {
      setShowPaymentProcessor(true);
      setStep(4);
    }
  };

  if (!items.length) {
    return null;
  }

  const shipping = orderSummary?.shipping || (discountedSubtotal >= 1000 ? 0 : 50);
  const tax = orderSummary?.tax || (discountedSubtotal * 0.12);
  const samplePrice = selectedSample?.samplePrice || 0;
  const total = discountedSubtotal + shipping + tax + samplePrice;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {(showPaymentProcessor ? [1, 2, 3, 4] : [1, 2, 3]).map((stepNum) => {
              const stepLabels = showPaymentProcessor 
                ? ['Address', 'Payment', 'Review', 'Processing'] 
                : ['Address', 'Payment', 'Review'];
              const isActive = step >= stepNum;
              const maxSteps = showPaymentProcessor ? 4 : 3;
              
              return (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {stepNum}
                  </div>
                  <span className={`ml-2 text-sm ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {stepLabels[stepNum - 1]}
                  </span>
                  {stepNum < maxSteps && <div className={`w-16 h-0.5 ${isActive ? 'bg-blue-600' : 'bg-gray-300'} ml-4`} />}
                </div>
              );
            })}
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
                <PaymentOptions
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  onPaymentSelect={setSelectedOnlineMethod}
                />

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleReviewOrder}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Review Order'}
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Order Review */}
            {step === 3 && orderSummary && !showPaymentProcessor && (
              <>
                <OrderReview
                  items={items}
                  selectedSample={selectedSample}
                  shippingAddress={shippingAddress}
                  paymentMethod={paymentMethod === 'online' ? selectedOnlineMethod : paymentMethod}
                  orderSummary={orderSummary}
                  onEdit={handleEditOrder}
                />

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={proceedToPayment}
                    disabled={loading}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-lg"
                  >
                    {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : `Pay ${formatCurrency((orderSummary?.total || 0) - (paymentMethod !== 'cod' ? 20 : 0))}`}
                  </button>
                </div>
              </>
            )}

            {/* Step 4: Payment Processing */}
            {step === 4 && showPaymentProcessor && (
              <PaymentProcessor
                paymentMethod={selectedOnlineMethod}
                amount={(orderSummary?.total || 0) - 20} // Online payment discount
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
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
                
                {totalSavings > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Discount Savings</span>
                      <span>-{formatCurrency(totalSavings)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Discounted Subtotal</span>
                      <span>{formatCurrency(discountedSubtotal)}</span>
                    </div>
                  </>
                )}
                
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
              
              {discountedSubtotal < 1000 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-600 text-sm">
                    Add {formatCurrency(1000 - discountedSubtotal)} more for free shipping!
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
