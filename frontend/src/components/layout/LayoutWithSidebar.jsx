import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LayoutWithSidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-background pt-16"> {/* Added pt-16 for navbar height */}
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border/50 p-4 flex flex-col fixed h-[calc(100vh-4rem)]"> {/* Made sidebar fixed and adjusted height */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground">OLFACTIVE ECHO</h2>
          <p className="text-muted-foreground text-sm">Your Fragrance Journey</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link 
            to="/profile" 
            className="block px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Profile
          </Link>
          <Link 
            to="/orders" 
            className="block px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            My Orders
          </Link>
          <Link 
            to="/wishlist" 
            className="block px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Wishlist
          </Link>
          <Link 
            to="/cart" 
            className="block px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Shopping Cart
          </Link>
          <Link 
            to="/settings" 
            className="block px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Account Settings
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-border/50">
          <button 
            onClick={logout}
            className="w-full px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 ml-64"> {/* Added ml-64 to account for sidebar width */}
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutWithSidebar;