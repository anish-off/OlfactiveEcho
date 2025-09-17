import React, { useState } from 'react';
import { CreditCard, Smartphone, Building2, Wallet, ChevronRight } from 'lucide-react';

const PaymentOptions = ({ paymentMethod, setPaymentMethod, onPaymentSelect }) => {
  const [selectedOnlineMethod, setSelectedOnlineMethod] = useState('upi');

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: <Wallet className="w-6 h-6" />,
      popular: false
    },
    {
      id: 'online',
      name: 'Online Payment',
      description: 'Pay securely with UPI, Card, or Net Banking',
      icon: <CreditCard className="w-6 h-6" />,
      popular: true
    }
  ];

  const onlinePaymentOptions = [
    {
      id: 'upi',
      name: 'UPI',
      description: 'Pay using Google Pay, PhonePe, Paytm, or any UPI app',
      icon: <Smartphone className="w-5 h-5" />,
      popular: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, RuPay, American Express',
      icon: <CreditCard className="w-5 h-5" />,
      popular: false
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major banks supported',
      icon: <Building2 className="w-5 h-5" />,
      popular: false
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'Paytm, Amazon Pay, Mobikwik',
      icon: <Wallet className="w-5 h-5" />,
      popular: false
    }
  ];

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === 'online' && onPaymentSelect) {
      onPaymentSelect(selectedOnlineMethod);
    }
  };

  const handleOnlineMethodChange = (method) => {
    setSelectedOnlineMethod(method);
    if (onPaymentSelect) {
      onPaymentSelect(method);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <CreditCard className="w-5 h-5 mr-2" />
        Choose Payment Method
      </h3>
      
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="relative">
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
              paymentMethod === method.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                className="sr-only"
              />
              
              <div className="flex items-center flex-1">
                <div className={`p-2 rounded-lg mr-4 ${
                  paymentMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {method.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{method.name}</span>
                    {method.popular && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                </div>
                
                <ChevronRight className={`w-5 h-5 transition-transform ${
                  paymentMethod === method.id ? 'rotate-90 text-blue-600' : 'text-gray-400'
                }`} />
              </div>
            </label>

            {/* Online Payment Sub-options */}
            {method.id === 'online' && paymentMethod === 'online' && (
              <div className="mt-4 ml-4 pl-4 border-l-2 border-blue-200 space-y-3">
                <h4 className="font-medium text-gray-900 mb-3">Select Payment Option</h4>
                {onlinePaymentOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                      selectedOnlineMethod === option.id
                        ? 'border-blue-400 bg-blue-25'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="onlinePayment"
                      value={option.id}
                      checked={selectedOnlineMethod === option.id}
                      onChange={(e) => handleOnlineMethodChange(e.target.value)}
                      className="sr-only"
                    />
                    
                    <div className={`p-2 rounded-lg mr-3 ${
                      selectedOnlineMethod === option.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{option.name}</span>
                        {option.popular && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedOnlineMethod === option.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedOnlineMethod === option.id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Security Badge */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">Secure Payment</p>
            <p className="text-xs text-green-600">Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;
