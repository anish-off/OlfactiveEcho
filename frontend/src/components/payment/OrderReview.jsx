import React from 'react';
import { Package, MapPin, CreditCard, Gift, Truck, Shield } from 'lucide-react';

const OrderReview = ({ 
  items, 
  selectedSample, 
  shippingAddress, 
  paymentMethod, 
  orderSummary,
  onEdit 
}) => {
  const formatCurrency = (amount) => `₹${(amount ?? 0).toFixed(2)}`;

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      cod: 'Cash on Delivery',
      upi: 'UPI Payment',
      card: 'Credit/Debit Card',
      netbanking: 'Net Banking',
      wallet: 'Digital Wallet'
    };
    return methods[method] || 'Online Payment';
  };

  const getDeliveryEstimate = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + (paymentMethod === 'cod' ? 5 : 3));
    
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Order Items */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order Items ({items.length + (selectedSample ? 1 : 0)})
          </h3>
          <button
            onClick={() => onEdit('items')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit Cart
          </button>
        </div>
        
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={item.product.imageUrl || '/placeholder.png'}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                <p className="text-sm text-gray-600">{item.product.brand}</p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-sm font-medium">{formatCurrency(item.product.price)} each</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">{formatCurrency(item.product.price * item.quantity)}</p>
              </div>
            </div>
          ))}
          
          {selectedSample && (
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <img
                src={selectedSample.imageUrl || '/placeholder.png'}
                alt={selectedSample.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="font-medium text-gray-900">{selectedSample.name}</h4>
                  <Gift className="w-4 h-4 ml-2 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Sample - 2ml</p>
                <span className="text-sm text-green-600 font-medium">
                  {selectedSample.samplePrice === 0 ? 'Free Sample' : 'Sample'}
                </span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg text-green-600">
                  {selectedSample.samplePrice === 0 ? 'Free' : formatCurrency(selectedSample.samplePrice)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Delivery Address
          </h3>
          <button
            onClick={() => onEdit('address')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Change
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="font-medium text-gray-900 mb-1">{shippingAddress.fullName}</div>
          <div className="text-gray-600 text-sm space-y-1">
            <p>{shippingAddress.address}</p>
            <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
            {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
          </div>
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-600">
          <Truck className="w-4 h-4 mr-2" />
          <span>Expected delivery by <strong>{getDeliveryEstimate()}</strong></span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Method
          </h3>
          <button
            onClick={() => onEdit('payment')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Change
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="font-medium text-gray-900">{getPaymentMethodDisplay(paymentMethod)}</div>
          <div className="text-sm text-gray-600 mt-1">
            {paymentMethod === 'cod' 
              ? 'Pay when you receive your order' 
              : 'Payment will be processed securely'
            }
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Price Details</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal ({items.length} items)</span>
            <span>{formatCurrency(orderSummary?.subtotal || 0)}</span>
          </div>
          
          {selectedSample && selectedSample.samplePrice > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Sample</span>
              <span>{formatCurrency(selectedSample.samplePrice)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className={orderSummary?.shipping === 0 ? 'text-green-600' : ''}>
              {orderSummary?.shipping === 0 ? 'Free' : formatCurrency(orderSummary?.shipping || 0)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (GST)</span>
            <span>{formatCurrency(orderSummary?.tax || 0)}</span>
          </div>
          
          {paymentMethod !== 'cod' && (
            <div className="flex justify-between text-green-600">
              <span>Online Payment Discount</span>
              <span>-₹20.00</span>
            </div>
          )}
          
          <div className="border-t pt-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount</span>
              <span className="text-green-600">
                {formatCurrency((orderSummary?.total || 0) - (paymentMethod !== 'cod' ? 20 : 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Guarantee */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">100% Secure & Authentic</h4>
            <p className="text-sm text-blue-700">
              All products are 100% authentic. Your payment information is encrypted and secure. 
              Easy returns within 7 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;
