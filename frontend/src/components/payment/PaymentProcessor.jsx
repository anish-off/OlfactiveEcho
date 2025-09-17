import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Building2, Wallet, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PaymentProcessor = ({ paymentMethod, amount, onSuccess, onError, onCancel }) => {
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failed', null
  const [paymentDetails, setPaymentDetails] = useState({
    upi: { vpa: '' },
    card: { number: '', expiry: '', cvv: '', name: '' },
    netbanking: { bank: '' },
    wallet: { provider: '' }
  });

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  const banks = [
    'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 
    'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank of India'
  ];

  const walletProviders = [
    'Paytm', 'Amazon Pay', 'Mobikwik', 'Freecharge', 'Ola Money'
  ];

  const handlePayment = async () => {
    setProcessing(true);
    setPaymentStatus(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate random success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        setPaymentStatus('success');
        setTimeout(() => {
          onSuccess({
            paymentId: `pay_${Date.now()}`,
            method: paymentMethod,
            amount: amount,
            status: 'completed'
          });
        }, 2000);
      } else {
        setPaymentStatus('failed');
        setTimeout(() => {
          onError('Payment failed. Please try again.');
        }, 2000);
      }
    } catch (error) {
      setPaymentStatus('failed');
      onError('Payment processing error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'upi':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Smartphone className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">UPI Payment</h3>
              <p className="text-gray-600">Pay using your UPI ID or scan QR code</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount to Pay:</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(amount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Enter UPI ID</label>
              <input
                type="text"
                placeholder="yourname@paytm / yourname@gpay"
                value={paymentDetails.upi.vpa}
                onChange={(e) => setPaymentDetails(prev => ({
                  ...prev,
                  upi: { ...prev.upi, vpa: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">OR</p>
              <div className="bg-white p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-gray-500 text-sm">QR Code</span>
                </div>
                <p className="text-sm text-gray-600">Scan with any UPI app</p>
              </div>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CreditCard className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Card Payment</h3>
              <p className="text-gray-600">Enter your card details securely</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount to Pay:</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(amount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.card.number}
                onChange={(e) => setPaymentDetails(prev => ({
                  ...prev,
                  card: { ...prev.card, number: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="19"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cardholder Name</label>
              <input
                type="text"
                placeholder="Name as on card"
                value={paymentDetails.card.name}
                onChange={(e) => setPaymentDetails(prev => ({
                  ...prev,
                  card: { ...prev.card, name: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentDetails.card.expiry}
                  onChange={(e) => setPaymentDetails(prev => ({
                    ...prev,
                    card: { ...prev.card, expiry: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CVV</label>
                <input
                  type="password"
                  placeholder="123"
                  value={paymentDetails.card.cvv}
                  onChange={(e) => setPaymentDetails(prev => ({
                    ...prev,
                    card: { ...prev.card, cvv: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="4"
                />
              </div>
            </div>
          </div>
        );

      case 'netbanking':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Building2 className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Net Banking</h3>
              <p className="text-gray-600">Select your bank to proceed</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount to Pay:</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(amount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Your Bank</label>
              <select
                value={paymentDetails.netbanking.bank}
                onChange={(e) => setPaymentDetails(prev => ({
                  ...prev,
                  netbanking: { ...prev.netbanking, bank: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose your bank</option>
                {banks.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Wallet className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Digital Wallet</h3>
              <p className="text-gray-600">Pay using your digital wallet</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount to Pay:</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(amount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Wallet Provider</label>
              <div className="grid grid-cols-2 gap-3">
                {walletProviders.map(provider => (
                  <label
                    key={provider}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      paymentDetails.wallet.provider === provider ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="wallet"
                      value={provider}
                      checked={paymentDetails.wallet.provider === provider}
                      onChange={(e) => setPaymentDetails(prev => ({
                        ...prev,
                        wallet: { ...prev.wallet, provider: e.target.value }
                      }))}
                      className="sr-only"
                    />
                    <span className="font-medium">{provider}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderProcessingState = () => {
    if (paymentStatus === 'success') {
      return (
        <div className="text-center py-8">
          <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
          <h3 className="text-2xl font-semibold text-green-600 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">Your payment of {formatCurrency(amount)} has been processed successfully.</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-green-800">Transaction ID: pay_{Date.now()}</p>
          </div>
        </div>
      );
    }

    if (paymentStatus === 'failed') {
      return (
        <div className="text-center py-8">
          <XCircle className="w-20 h-20 mx-auto text-red-500 mb-4" />
          <h3 className="text-2xl font-semibold text-red-600 mb-2">Payment Failed</h3>
          <p className="text-gray-600 mb-4">We couldn't process your payment. Please try again.</p>
          <button
            onClick={() => {
              setPaymentStatus(null);
              setProcessing(false);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (processing) {
      return (
        <div className="text-center py-8">
          <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-semibold mb-2">Processing Payment...</h3>
          <p className="text-gray-600 mb-4">Please don't close this window or press back button.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-blue-800">Amount: {formatCurrency(amount)}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  if (processing || paymentStatus) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        {renderProcessingState()}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      {renderPaymentForm()}
      
      <div className="flex justify-between mt-8">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={processing}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(amount)}`
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentProcessor;
