import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function OrderCard({ order }) {
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const total = Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const itemSummary = order.items.slice(0, 2).map((i) => i.productName).join(', ');
  const extra = order.items.length > 2 ? ` +${order.items.length - 2} more` : '';

  return (
    <Link to={`/orders`} className="card p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-heading font-semibold text-navy text-sm">
            #{order._id.slice(-8).toUpperCase()}
          </span>
          <span className={`badge ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <p className="text-gray-500 text-xs mb-2">{date}</p>
        <p className="text-sm text-gray-700 truncate">{itemSummary}{extra}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="font-heading font-bold text-navy text-lg">₹{total}</p>
        <p className="text-xs text-gray-400 mt-0.5">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
      </div>
    </Link>
  );
}
