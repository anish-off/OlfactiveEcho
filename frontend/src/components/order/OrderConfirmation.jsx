import React, { useEffect, useState } from 'react';
import { CheckCircle, Mail, Package, Truck, Clock, CreditCard } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Get order details from navigation state
    if (location.state && location.state.orderId) {
      setOrderDetails(location.state);
      setEmailSent(true); // Assume email was sent when order was created
    } else {
      // Redirect to orders page if no order details
      navigate('/orders');
    }
  }, [location.state, navigate]);

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  const getDeliveryEstimate = (paymentMethod) => {
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

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          {orderDetails.orderId && (
            <div className="mt-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
                Order #{orderDetails.orderId.slice(-8).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Email Confirmation */}
        {emailSent && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-green-800">Confirmation Email Sent</h3>
                <p className="text-sm text-green-700">
                  We've sent a detailed order confirmation to your registered email address.
                  Please check your inbox (and spam folder) for the confirmation email.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">Order Confirmed</h3>
                <p className="text-sm text-gray-600">Your order has been received and confirmed</p>
              </div>
              <div className="ml-auto text-sm text-gray-500">Just now</div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">Processing</h3>
                <p className="text-sm text-gray-600">We're preparing your order for shipment</p>
              </div>
              <div className="ml-auto text-sm text-gray-500">1-2 business days</div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">Shipped</h3>
                <p className="text-sm text-gray-600">Your order is on its way to you</p>
              </div>
              <div className="ml-auto text-sm text-gray-500">2-3 business days</div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">Delivered</h3>
                <p className="text-sm text-gray-600">
                  Expected delivery: <strong>{getDeliveryEstimate('online')}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="text-sm text-gray-600 mb-4">
            {orderDetails.message || 'Your order has been successfully placed and will be processed shortly.'}
          </div>
          
          {/* Payment Method Info */}
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Payment Method</h3>
              <p className="text-sm text-gray-600">
                Payment details will be shown in your order history
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            View Order Details
          </button>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Continue Shopping
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-700 mb-4">
              If you have any questions about your order, our customer support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <div className="flex items-center justify-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>support@olfactiveecho.com</span>
              </div>
              <div className="flex items-center justify-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>24/7 Customer Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Reminder */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            📧 Keep an eye on your email for order updates and tracking information.
            <br />
            Don't forget to check your spam folder if you don't see our emails in your inbox.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
