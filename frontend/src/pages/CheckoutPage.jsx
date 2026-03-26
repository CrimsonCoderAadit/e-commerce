import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });

  useEffect(() => {
    api.get('/cart')
      .then(({ data }) => setCart(data.cart || data))
      .catch(() => setCart({ items: [] }))
      .finally(() => setLoading(false));
  }, []);

  const setField = (f) => (e) => setAddress((a) => ({ ...a, [f]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const items = cart?.items ?? [];
    if (!items.length) { toast.error('Your cart is empty'); return; }
    setPlacing(true);
    try {
      const { data } = await api.post('/orders/checkout', { shippingAddress: address });
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-amber border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  const items = cart?.items ?? [];
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-heading font-bold text-2xl text-navy mb-8">Checkout</h1>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Shipping form */}
        <form onSubmit={handlePlaceOrder} className="md:col-span-3 flex flex-col gap-5">
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-navy mb-4">Shipping Address</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input required value={address.street} onChange={setField('street')} className="input" placeholder="123 MG Road" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input required value={address.city} onChange={setField('city')} className="input" placeholder="Bangalore" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input required value={address.state} onChange={setField('state')} className="input" placeholder="Karnataka" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input required pattern="[0-9]{6}" value={address.pincode} onChange={setField('pincode')} className="input" placeholder="560001" maxLength={6} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={placing || !items.length} className="btn-primary py-3 text-base">
            {placing ? 'Placing order…' : 'Place Order'}
          </button>
        </form>

        {/* Order summary */}
        <div className="md:col-span-2">
          <div className="card p-5 sticky top-20">
            <h2 className="font-heading font-semibold text-navy mb-4">Order Summary</h2>
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate flex-1 mr-2">{item.productName} × {item.quantity}</span>
                  <span className="font-medium text-navy flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <hr />
            <div className="flex justify-between font-heading font-bold text-navy mt-3 text-lg">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <p className="text-xs text-green-600 mt-2">✓ Free shipping included</p>
          </div>
        </div>
      </div>
    </div>
  );
}
