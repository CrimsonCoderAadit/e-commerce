import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', category: '', imageUrl: '' };

function ProductModal({ categories, initial, onClose, onSaved }) {
  const [form, setForm]     = useState(initial ?? EMPTY_FORM);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-navy text-xl">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
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
              {categories.map((c) => (
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

export default function AdminProductsPage() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null); // null | 'create' | product object

  const fetchData = () => {
    setLoading(true);
    Promise.allSettled([
      api.get('/products?limit=100'),
      api.get('/categories'),
    ]).then(([prods, cats]) => {
      setProducts(prods.status === 'fulfilled' ? prods.value.data.products : []);
      setCategories(cats.status === 'fulfilled' ? cats.value.data : []);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl text-navy">Products</h1>
        <button onClick={() => setModal('create')} className="btn-primary py-2 px-4 text-sm">
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="card overflow-hidden animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-8 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Price</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Stock</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{p.name}</p>
                    <p className="text-gray-400 text-xs truncate max-w-xs">{p.description}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-navy">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`badge ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {p.stock}
                    </span>
                  </td>
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
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">No products yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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
