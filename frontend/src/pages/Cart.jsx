import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

const formatCurrency = (v) => `₹${(v ?? 0).toFixed(2)}`;

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();
  const taxRate = 0.0; // adjust if needed
  const tax = subtotal * taxRate;
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + tax + shipping;

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

      <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{totalItems} {totalItems === 1 ? 'Item' : 'Items'} in Cart</h2>
          <button onClick={clearCart} className="text-destructive hover:underline text-sm">Remove All</button>
        </div>
        <div className="divide-y divide-border/50">
          {items.map(ci => (
            <div key={ci.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-4 min-w-0">
                <img src={ci.product.imageUrl || ci.product.image || '/placeholder.png'} alt={ci.product.name} className="w-20 h-20 object-cover rounded-lg border" />
                <div className="truncate">
                  <h3 className="font-medium truncate">{ci.product.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{ci.product.description?.slice(0,80)}</p>
                  <p className="mt-1 text-sm font-semibold">{formatCurrency(ci.product.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 ml-auto">
                <div className="flex items-center border rounded-full overflow-hidden">
                  <button aria-label="Decrease quantity" onClick={()=>updateQuantity(ci.id, ci.quantity - 1)} className="px-3 py-1 hover:bg-accent">-</button>
                  <span className="px-4 select-none">{ci.quantity}</span>
                  <button aria-label="Increase quantity" onClick={()=>updateQuantity(ci.id, ci.quantity + 1)} className="px-3 py-1 hover:bg-accent">+</button>
                </div>
                <div className="hidden sm:block font-semibold">{formatCurrency(ci.product.price * ci.quantity)}</div>
                <button onClick={()=>removeItem(ci.id)} className="text-destructive text-sm hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span></div>
          {taxRate > 0 && <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(tax)}</span></div>}
          <div className="flex justify-between font-bold text-lg pt-3 border-t border-border/50"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>
        <Link to="/checkout" className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors duration-300 font-medium text-center block">Proceed to Checkout</Link>
      </div>
    </div>
  );
};

export default Cart;