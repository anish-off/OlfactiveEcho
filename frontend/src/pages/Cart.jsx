import React from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">2 Items in Cart</h2>
          <button className="text-destructive hover:underline">Remove All</button>
        </div>
        
        {/* Cart items would be listed here */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center space-x-4">
              <img 
                src="/assets/chanel-no5.jpg" 
                alt="Chanel No. 5" 
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-medium">Chanel No. 5</h3>
                <p className="text-muted-foreground text-sm">50ml</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-lg font-semibold">$120.00</div>
              <button className="text-destructive hover:text-destructive/80">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>$240.00</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>$19.20</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-3 border-t border-border/50">
            <span>Total</span>
            <span>$259.20</span>
          </div>
        </div>
        
        <Link 
          to="/checkout" 
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors duration-300 font-medium text-center block"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default Cart;