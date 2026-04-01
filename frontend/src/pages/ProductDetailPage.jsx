import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add items to cart'); return; }
    try {
      await api.post('/cart/add', {
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: qty,
        imageUrl: product.imageUrl ?? '',
      });
      toast.success(`${product.name} added to cart!`);
    } catch { toast.error('Could not add to cart'); }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="flex flex-col gap-4">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">
        Product not found. <Link to="/" className="text-amber underline">Back to shop</Link>
      </div>
    );
  }

  const inStock = product.stock > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy mb-6 transition-colors">
        ← Back to shop
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          {product.category?.name && (
            <span className="badge bg-navy/10 text-navy w-fit">{product.category.name}</span>
          )}
          <h1 className="font-heading font-bold text-3xl text-navy leading-tight">{product.name}</h1>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-3">
            <span className="font-heading font-bold text-3xl text-navy">
              ₹{(product.price || 0).toLocaleString('en-IN')}
            </span>
            <span className={`badge ${inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>

          {inStock && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 text-lg">−</button>
                <span className="px-4 py-2 font-medium border-x border-gray-300">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-100 text-lg">+</button>
              </div>
            </div>
          )}

          <button onClick={handleAddToCart} disabled={!inStock} className="btn-primary text-base py-3">
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>

          <p className="text-xs text-gray-400 mt-2">
            Average rating: {product.averageRating?.toFixed(1) ?? '0.0'} / 5.0
            ({product.ratings?.length ?? 0} review{product.ratings?.length !== 1 ? 's' : ''})
          </p>
        </div>
      </div>
    </div>
  );
}
