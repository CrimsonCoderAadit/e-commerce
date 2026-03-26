import { useEffect, useState } from 'react';
import api from '../api/axios';
import OrderCard from '../components/OrderCard';

export default function OrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data.orders || data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl mb-3" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-heading font-bold text-2xl text-navy mb-6">My Orders</h1>

      {!orders.length ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm mt-1">Your past orders will appear here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => <OrderCard key={order._id} order={order} />)}
        </div>
      )}
    </div>
  );
}
