import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import OrderCard from '../components/OrderCard';

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', category: '', imageUrl: '' };

function ProductModal({ categories, initial, onClose, onSaved }) {
  const [form, setForm] = useState(
    initial
      ? {
        name: initial.name ?? '',
        description: initial.description ?? '',
        price: initial.price ?? '',
        stock: initial.stock ?? '',
        category: initial.category?._id ?? initial.category ?? '',
        imageUrl: initial.imageUrl ?? '',
      }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?._id);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/products/${initial._id}`, form);
      } else {
        await api.post('/products', form);
      }
      toast.success(isEdit ? 'Product updated' : 'Product created');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="card w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl mt-auto mb-auto shrink-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-navy text-xl">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input required value={form.name} onChange={set('name')} className="input" placeholder="Product name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required value={form.description} onChange={set('description')} className="input resize-none" rows={3} placeholder="Product description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input required type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className="input" placeholder="999" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input required type="number" min="0" value={form.stock} onChange={set('stock')} className="input" placeholder="100" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select required value={form.category} onChange={set('category')} className="input">
              <option value="">Select category</option>
              {(categories || []).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
            <input type="url" value={form.imageUrl} onChange={set('imageUrl')} className="input" placeholder="https://..." />
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | product object
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });

  const fetchData = () => {
    setLoading(true);
    Promise.allSettled([
      api.get('/products?limit=100'),
      api.get('/categories'),
      api.get('/orders')
    ]).then(([prods, cats, ords]) => {
      const p = prods.status === 'fulfilled' ? (prods.value.data.products || []) : [];
      const c = cats.status === 'fulfilled' ? (cats.value.data.categories || []) : [];
      const o = ords.status === 'fulfilled' ? (ords.value.data.orders || ords.value.data || []) : [];

      setProducts(p);
      setCategories(c);
      setOrders(o);

      setStats({
        products: p.length,
        orders: o.length,
        revenue: o.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
      });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await api.delete(`/products/${product._id}`);
      toast.success('Product deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-navy">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage products and orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="card p-6 flex items-center gap-4 bg-white shadow-sm rounded-xl">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-blue-100">📦</div>
          <div>
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="font-heading font-bold text-2xl text-navy">{stats.products}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4 bg-white shadow-sm rounded-xl">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-amber-100">📋</div>
          <div>
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="font-heading font-bold text-2xl text-navy">{stats.orders}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4 bg-white shadow-sm rounded-xl">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-green-100">💰</div>
          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="font-heading font-bold text-2xl text-navy">₹{stats.revenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-xl text-navy">Products</h2>
            <button onClick={() => setModal('create')} className="btn-primary py-2 px-4 text-sm">
              + Add Product
            </button>
          </div>

          {loading ? (
            <div className="card overflow-hidden animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
                  <div className="h-4 bg-gray-200 rounded flex-1" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="card overflow-x-auto bg-white rounded-xl shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Price</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy">{p.name}</p>
                        <p className="text-gray-400 text-xs truncate max-w-[150px]">{p.category?.name ?? '—'} &bull; Stock: {p.stock}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-navy">₹{p.price.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setModal(p)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => handleDelete(p)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!products.length && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400">No products yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-xl text-navy">All Orders</h2>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => <OrderCard key={order._id} order={order} />)}
              {!orders.length && (
                <div className="text-center py-8 text-gray-400 bg-white rounded-xl shadow-sm card">
                  <p className="text-sm font-medium">No orders found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <ProductModal
          categories={categories}
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
