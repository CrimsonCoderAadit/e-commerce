import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import ProductGrid from '../components/ProductGrid';
import CategoryFilter from '../components/CategoryFilter';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const DEFAULT_FILTERS = { search: '', category: '', minPrice: '', maxPrice: '', sort: '', page: 1 };

export default function HomePage() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [filters, setFilters]       = useState(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');

  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data.categories || res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setFilters((f) => ({ ...f, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search)   params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.sort)     params.set('sort', filters.sort);
    params.set('page', filters.page);
    params.set('limit', 12);

    api.get(`/products?${params}`)
      .then(({ data }) => {
        setProducts(data.products ?? []);
        setPagination({ total: data.total, pages: data.pages });
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-navy mb-1">Shop</h1>
        <p className="text-gray-500 text-sm">
          {pagination.total} product{pagination.total !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="Search products…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="input pl-11 py-3 text-base"
        />
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <CategoryFilter categories={categories} filters={filters} onChange={setFilters} />
        </div>

        {/* Grid + pagination */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} loading={loading} />

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                className="btn-outline py-2 px-4 text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {filters.page} of {pagination.pages}
              </span>
              <button
                disabled={filters.page >= pagination.pages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                className="btn-outline py-2 px-4 text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
