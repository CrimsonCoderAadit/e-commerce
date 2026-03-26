import ProductCard from './ProductCard';

function Skeleton() {
  return (
    <div className="card animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-t-xl" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between mt-2">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="h-5 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="h-9 bg-gray-200 rounded-lg mt-1" />
      </div>
    </div>
  );
}

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((p) => <ProductCard key={p._id} product={p} />)}
    </div>
  );
}
