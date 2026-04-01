import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchCartCount = () => {
    if (!user) { setCartCount(0); return; }
    api.get('/cart')
      .then(({ data }) => {
        const count = (data.items ?? []).reduce((s, i) => s + i.quantity, 0);
        setCartCount(count);
      })
      .catch(() => { });
  };

  useEffect(() => { fetchCartCount(); }, [user]);

  useEffect(() => {
    window.addEventListener('cart-updated', fetchCartCount);
    return () => window.removeEventListener('cart-updated', fetchCartCount);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <nav className="bg-navy text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-heading font-bold text-2xl text-amber">
            ShopEase
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
              Home
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-amber hover:text-amber-light text-sm font-medium">
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="relative p-2 rounded-lg hover:bg-navy-light transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber text-navy text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* Orders / Admin */}
                {user.role === 'admin' ? (
                  <Link to="/admin" className="text-amber hover:text-amber-light text-sm hidden md:block font-medium">
                    Admin
                  </Link>
                ) : (
                  <Link to="/orders" className="text-gray-300 hover:text-white text-sm hidden md:block">
                    Orders
                  </Link>
                )}

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex items-center gap-2 bg-navy-light px-3 py-1.5 rounded-lg text-sm hover:bg-navy-lighter transition-colors"
                  >
                    <span className="font-medium">{user.username}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white text-navy rounded-xl shadow-lg py-1 border border-gray-100">
                      <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>My Orders</Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                      )}
                      <hr className="my-1" />
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
