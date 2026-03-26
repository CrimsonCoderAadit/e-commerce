import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(value) ? 'text-amber' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 0 0-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69L9.049 2.927Z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">({value?.toFixed(1) ?? '0.0'})</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { user } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to add items to cart'); return; }
    const payload = {
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl || '',
    };
    console.log('[Cart] Sending POST /api/cart/add', payload);
    try {
      const res = await api.post('/cart/add', payload);
      console.log('[Cart] Success:', res.data);
      toast.success(`${product.name} added to cart!`);
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (err) {
      console.error('[Cart] Error:', err.response?.status, err.response?.data ?? err.message);
      toast.error('Could not add to cart');
    }
  };

  const inStock = product.stock > 0;

  return (
    <Link to={`/product/${product._id}`} className="card hover:shadow-md transition-shadow group flex flex-col">
      {/* Image */}
      <div className="aspect-square bg-gray-100 rounded-t-xl overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {product.category?.name && (
          <span className="badge bg-navy/10 text-navy">{product.category.name}</span>
        )}
        <h3 className="font-heading font-semibold text-navy line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <StarRating value={product.averageRating} />
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-heading font-bold text-lg text-navy">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <span className={`badge ${inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="btn-primary w-full text-sm mt-1"
        >
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  );
}
