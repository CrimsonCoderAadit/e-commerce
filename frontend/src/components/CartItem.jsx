import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CartItem({ item, onUpdate }) {
  const subtotal = (item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const changeQty = async (delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return handleRemove();
    try {
      await api.post('/cart/update', { productId: item.productId, quantity: newQty });
      onUpdate();
    } catch { toast.error('Could not update quantity'); }
  };

  const handleRemove = async () => {
    try {
      await api.post('/cart/remove', { productId: item.productId });
      onUpdate();
      toast.success('Item removed');
    } catch { toast.error('Could not remove item'); }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Image */}
      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-heading font-semibold text-navy text-sm truncate">{item.productName}</h4>
        <p className="text-gray-500 text-sm mt-0.5">₹{item.price.toLocaleString('en-IN')} each</p>

        {/* Qty stepper */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => changeQty(-1)}
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg leading-none"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
          <button
            onClick={() => changeQty(1)}
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg leading-none"
          >
            +
          </button>
        </div>
      </div>

      {/* Subtotal + remove */}
      <div className="flex flex-col items-end gap-2">
        <span className="font-heading font-bold text-navy">₹{subtotal}</span>
        <button
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Remove"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
