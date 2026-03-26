import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="font-heading font-bold text-2xl text-navy">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: null, categories: null });

  useEffect(() => {
    Promise.allSettled([
      api.get('/products?limit=1'),
      api.get('/categories'),
    ]).then(([products, categories]) => {
      setStats({
        products:   products.status === 'fulfilled' ? products.value.data.total : 'N/A',
        categories: categories.status === 'fulfilled' ? categories.value.data.length : 'N/A',
      });
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-navy">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your store</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <StatCard label="Total Products"   value={stats.products}   icon="📦" color="bg-blue-100" />
        <StatCard label="Categories"       value={stats.categories} icon="🗂️" color="bg-purple-100" />
        <StatCard label="Services"         value="4 running"        icon="⚙️" color="bg-green-100" />
      </div>

      {/* Quick links */}
      <h2 className="font-heading font-semibold text-navy text-lg mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/products" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4 group">
          <span className="text-3xl">📦</span>
          <div>
            <p className="font-heading font-semibold text-navy group-hover:text-amber transition-colors">Manage Products</p>
            <p className="text-sm text-gray-500">Add, edit, or remove products</p>
          </div>
        </Link>
        <Link to="/" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4 group">
          <span className="text-3xl">🏪</span>
          <div>
            <p className="font-heading font-semibold text-navy group-hover:text-amber transition-colors">View Storefront</p>
            <p className="text-sm text-gray-500">See the customer-facing shop</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
