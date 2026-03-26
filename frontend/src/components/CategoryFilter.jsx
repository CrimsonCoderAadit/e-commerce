export default function CategoryFilter({ categories, filters, onChange }) {
  const SORT_OPTIONS = [
    { value: '', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'newest', label: 'Newest First' },
  ];

  const update = (patch) => onChange({ ...filters, ...patch, page: 1 });
  const categoryList = Array.isArray(categories) ? categories : (categories?.categories || []);

  return (
    <aside className="card p-5 flex flex-col gap-6 h-fit sticky top-20">
      <div>
        <h3 className="font-heading font-semibold text-navy mb-3">Categories</h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => update({ category: '' })}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-navy text-white font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            All Categories
          </button>
          {categoryList.map((cat) => (
            <button
              key={cat._id}
              onClick={() => update({ category: cat._id })}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === cat._id ? 'bg-navy text-white font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-heading font-semibold text-navy mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => update({ minPrice: e.target.value })}
            className="input text-sm py-2"
            min="0"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: e.target.value })}
            className="input text-sm py-2"
            min="0"
          />
        </div>
      </div>

      <div>
        <h3 className="font-heading font-semibold text-navy mb-3">Sort By</h3>
        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="input text-sm py-2"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => onChange({ search: '', category: '', minPrice: '', maxPrice: '', sort: '', page: 1 })}
        className="btn-outline text-sm py-2"
      >
        Clear Filters
      </button>
    </aside>
  );
}
