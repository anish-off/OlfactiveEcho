import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ComparisonProvider } from "./context/ComparisonContext";
import AppContent from "./AppContent";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ComparisonProvider>
            <AppContent />
            <Analytics />
          </ComparisonProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
