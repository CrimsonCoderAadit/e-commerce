import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import Navbar            from './components/Navbar';
import ProtectedRoute    from './components/ProtectedRoute';
import AdminRoute        from './components/AdminRoute';

import HomePage          from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import CartPage          from './pages/CartPage';
import CheckoutPage      from './pages/CheckoutPage';
import OrdersPage        from './pages/OrdersPage';
import AdminDashboard    from './pages/AdminDashboard';
import AdminProductsPage from './pages/AdminProductsPage';

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#f59e0b', secondary: '#0f172a' } },
        }}
      />
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/"            element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/register"    element={<RegisterPage />} />

          {/* Protected */}
          <Route path="/cart"     element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders"   element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
        </Routes>
      </main>
    </AuthProvider>
  );
}
