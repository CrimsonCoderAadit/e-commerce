import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CartItem from '../components/CartItem';
import toast from 'react-hot-toast';

export default function CartPage() {
  const [cart, setCart]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = () => {
    setLoading(true);
    api.get('/cart')
      .then(({ data }) => setCart(data.cart || data))
      .catch(() => setCart({ items: [] }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCart(); }, []);

  useEffect(() => {
    window.addEventListener('cart-updated', fetchCart);
    return () => window.removeEventListener('cart-updated', fetchCart);
  }, []);

  const handleClear = async () => {
    try {
      await api.delete('/cart/clear');
      fetchCart();
      toast.success('Cart cleared');
    } catch { toast.error('Could not clear cart'); }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl mb-3" />)}
      </div>
    );
  }

  const items = cart?.items ?? [];
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (!items.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="font-heading font-bold text-2xl text-navy mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn-primary inline-block">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl text-navy">My Cart ({items.length})</h1>
        <button onClick={handleClear} className="text-sm text-red-500 hover:text-red-700 transition-colors">
          Clear all
        </button>
      </div>

      <div className="card p-5 mb-6">
        {items.map((item) => (
          <CartItem key={item.productId} item={item} onUpdate={fetchCart} />
        ))}
      </div>

      {/* Summary */}
      <div className="card p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between text-gray-600 text-sm">
          <span>Subtotal ({items.length} items)</span>
          <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between text-gray-600 text-sm">
          <span>Shipping</span>
          <span className="text-green-600">Free</span>
        </div>
        <hr />
        <div className="flex items-center justify-between font-heading font-bold text-navy text-lg">
          <span>Total</span>
          <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <button onClick={() => navigate('/checkout')} className="btn-primary py-3 text-base mt-1">
          Proceed to Checkout →
        </button>
      </div>
    </div>
  );
}
