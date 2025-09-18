import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

const formatCurrency = (v) => `₹${(v ?? 0).toFixed(2)}`;

const Cart = () => {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    subtotal, 
    sampleTotal, 
    grandTotal, 
    totalItems, 
    regularItems, 
    sampleItems, 
    isFreeEligible, 
    freeThreshold 
  } = useCart();
  
  const taxRate = 0.12; // 12% tax
  const tax = grandTotal * taxRate;
  const shipping = grandTotal > 0 && grandTotal < 1000 ? 50 : 0; // ₹50 shipping if total < ₹1000
  const total = grandTotal + tax + shipping;

  if (!items.length) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Add some fragrances to begin your olfactory journey.</p>
        <Link to="/products" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

      {/* Free Sample Notification */}
      {isFreeEligible && sampleItems.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">🎉</span>
            <span className="text-green-800 font-medium">
              Congratulations! You've qualified for free samples with your ₹{freeThreshold.toLocaleString()}+ order!
            </span>
          </div>
        </div>
      )}

      {/* Regular Products */}
      {regularItems.length > 0 && (
        <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Products ({regularItems.reduce((sum, item) => sum + item.quantity, 0)} {regularItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'Item' : 'Items'})
            </h2>
          </div>
          <div className="divide-y divide-border/50">
            {regularItems.map(ci => (
              <div key={ci.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-4 min-w-0">
                  <img src={ci.product.imageUrl || ci.product.image || '/placeholder.png'} alt={ci.product.name} className="w-20 h-20 object-cover rounded-lg border" />
                  <div className="truncate">
                    <h3 className="font-medium truncate">{ci.product.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{ci.product.description?.slice(0,80)}</p>
                    {ci.product.selectedSize && (
                      <p className="text-xs text-blue-600">Size: {ci.product.selectedSize}</p>
                    )}
                    <p className="mt-1 text-sm font-semibold">{formatCurrency(ci.product.effectivePrice || ci.product.price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 ml-auto">
                  <div className="flex items-center border rounded-full overflow-hidden">
                    <button aria-label="Decrease quantity" onClick={()=>updateQuantity(ci.id, ci.quantity - 1)} className="px-3 py-1 hover:bg-accent">-</button>
                    <span className="px-4 select-none">{ci.quantity}</span>
                    <button aria-label="Increase quantity" onClick={()=>updateQuantity(ci.id, ci.quantity + 1)} className="px-3 py-1 hover:bg-accent">+</button>
                  </div>
                  <div className="hidden sm:block font-semibold">{formatCurrency((ci.product.effectivePrice || ci.product.price) * ci.quantity)}</div>
                  <button onClick={()=>removeItem(ci.id)} className="text-destructive text-sm hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Samples */}
      {sampleItems.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6 shadow-sm mb-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-800">
              Samples ({sampleItems.reduce((sum, item) => sum + item.quantity, 0)} {sampleItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'Item' : 'Items'})
            </h2>
            {isFreeEligible && (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                FREE with your order!
              </span>
            )}
          </div>
          <div className="divide-y divide-blue-200">
            {sampleItems.map(ci => (
              <div key={ci.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-20 bg-blue-100 rounded-lg border border-blue-300 flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">SAMPLE</span>
                  </div>
                  <div className="truncate">
                    <h3 className="font-medium truncate text-blue-900">{ci.product.name}</h3>
                    <p className="text-xs text-blue-700">Size: {ci.product.sampleSize || '2ml'}</p>
                    <p className="mt-1 text-sm font-semibold text-blue-800">
                      {isFreeEligible && ci.product.price === 0 ? 'FREE' : formatCurrency(ci.product.price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 ml-auto">
                  <div className="flex items-center border border-blue-300 rounded-full overflow-hidden">
                    <button aria-label="Decrease quantity" onClick={()=>updateQuantity(ci.id, ci.quantity - 1)} className="px-3 py-1 hover:bg-blue-100">-</button>
                    <span className="px-4 select-none">{ci.quantity}</span>
                    <button aria-label="Increase quantity" onClick={()=>updateQuantity(ci.id, ci.quantity + 1)} className="px-3 py-1 hover:bg-blue-100">+</button>
                  </div>
                  <div className="hidden sm:block font-semibold text-blue-800">
                    {isFreeEligible && ci.product.price === 0 ? 'FREE' : formatCurrency(ci.product.price * ci.quantity)}
                  </div>
                  <button onClick={()=>removeItem(ci.id)} className="text-red-600 text-sm hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear Cart Button */}
      {items.length > 0 && (
        <div className="text-right mb-6">
          <button onClick={clearCart} className="text-destructive hover:underline text-sm">Clear All Items</button>
        </div>
      )}

      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between"><span>Products Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          {sampleTotal > 0 && (
            <div className="flex justify-between text-blue-700">
              <span>Samples Subtotal</span>
              <span>{isFreeEligible ? 'FREE' : formatCurrency(sampleTotal)}</span>
            </div>
          )}
          <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span></div>
          <div className="flex justify-between"><span>Tax (GST)</span><span>{formatCurrency(tax)}</span></div>
          {!isFreeEligible && sampleTotal > 0 && (
            <div className="text-amber-600 text-sm p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span>💡 Add ₹{(freeThreshold - subtotal).toLocaleString()} more to get free samples!</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-3 border-t border-border/50"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>
        <Link to="/checkout" className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors duration-300 font-medium text-center block">Proceed to Checkout</Link>
      </div>
    </div>
  );
};

export default Cart;