import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ComparisonProvider } from "./context/ComparisonContext";
import AppContent from "./AppContent";

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ComparisonProvider>
            <AppContent />
          </ComparisonProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
