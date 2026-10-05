import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetCatalogPageQuery, useGetProductFiltersQuery } from '../../features/products/productApi';
import { useGetCategoriesQuery } from '../../features/categories/categoryApi';
import { toggleCategoryFilter, toggleBrandFilter, setMaxPrice, setSortBy, setCurrentPage, resetFilters } from '../../features/products/productSlice';
import ProductCard from '../../components/product/ProductCard';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ChevronDown, PackageOpen, Sparkles } from 'lucide-react';
import { useGetAIRecommendationsQuery } from '../../features/ai/aiApi';

const Products = () => {
  const dispatch = useDispatch();
  const { data: categoryData = [] } = useGetCategoriesQuery();
  const { data: filterData } = useGetProductFiltersQuery();

  const { selectedCategories, selectedBrands, maxPrice, sortBy, currentPage } = useSelector((state) => state.products);

  const [sortOpen, setSortOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [minimumRating, setMinimumRating] = useState(0);

  const sortValues = { Featured: 'featured', Newest: 'newest', 'Price: Low-High': 'price_asc', 'Price: High-Low': 'price_desc' };
  const params = useMemo(() => ({
    page: currentPage,
    limit: 12,
    search: search || undefined,
    category: selectedCategories.length ? selectedCategories.join(',') : undefined,
    brand: selectedBrands.length ? selectedBrands.join(',') : undefined,
    maxPrice: maxPrice < 1200 ? maxPrice : undefined,
    rating: minimumRating || undefined,
    sort: sortValues[sortBy] || 'featured',
  }), [currentPage, maxPrice, minimumRating, search, selectedBrands, selectedCategories, sortBy]);
  const { data: catalog, isLoading, isError } = useGetCatalogPageQuery(params);
  const products = catalog?.products || [];
  const pagination = catalog?.pagination;

  const categoriesList = categoryData.map((category) => ({ name: category.name, count: category.count || 0 }));
  const brandsList = filterData?.brands || [];

  const sortedProducts = products;

  const handleSortSelect = (value) => {
    dispatch(setSortBy(value));
    dispatch(setCurrentPage(1));
    setSortOpen(false);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    dispatch(setCurrentPage(1));
  };

  const clearFilters = () => {
    dispatch(resetFilters());
    setSearch('');
    setSearchInput('');
    setMinimumRating(0);
  };

  return (
    <div className="min-h-screen">
      {/* Header & Breadcrumbs Section */}
      <section className="max-w-container-max mx-auto px-gutter py-lg">
        <Breadcrumb items={[{ label: 'New Arrivals', url: '/products' }]} />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-base mt-2">
          <div>
            <h1 className="font-display-lg text-display-lg text-primary mb-xs">New Arrivals</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Showing {pagination?.total || 0} curated objects for the modern home.
            </p>
          </div>
          
          {/* Sorting Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center space-x-sm border border-outline-variant/60 px-md py-sm rounded-lg font-label-caps text-label-caps hover:border-primary transition-all bg-transparent text-primary"
            >
                <span>Sort By: {sortBy}</span>
              <ChevronDown size={14} className={`transform transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-outline-variant/30 rounded-xl shadow-xl z-20 overflow-hidden">
                  <ul className="py-2">
                    {["Featured", "Newest", "Price: Low-High", "Price: High-Low"].map((option) => (
                      <li
                        key={option}
                        onClick={() => handleSortSelect(option)}
                        className={`px-md py-base font-body-sm hover:bg-surface-container-low cursor-pointer transition-colors ${
                          sortBy === option ? 'font-bold bg-surface-container' : ''
                        }`}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <form onSubmit={submitSearch} className="max-w-container-max mx-auto px-gutter pb-lg flex gap-sm">
        <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search products, brands, or details" className="w-full rounded-xl border-outline-variant bg-surface px-md py-sm" aria-label="Search products" />
        <button className="rounded-xl bg-primary px-lg py-sm text-white">Search</button>
      </form>

      {/* Product Listing Grid + Sidebar */}
      <div className="max-w-container-max mx-auto px-gutter pb-xl flex flex-col md:flex-row gap-lg">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-lg">
            
            {/* Filter Block: Category */}
            <div>
              <h3 className="font-label-caps text-label-caps text-primary mb-md pb-xs border-b border-outline-variant/30 tracking-widest uppercase">
                Category
              </h3>
              <ul className="space-y-base">
                {categoriesList.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.name);
                  return (
                    <li key={cat.name} className="flex items-center justify-between group cursor-pointer">
                      <label className="flex items-center space-x-base cursor-pointer w-full">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => { dispatch(toggleCategoryFilter(cat.name)); dispatch(setCurrentPage(1)); }}
                          className="w-4 h-4 rounded border-outline-variant/60 text-primary focus:ring-0 cursor-pointer"
                        />
                        <span className="font-body-sm text-on-surface-variant group-hover:text-primary transition-colors">
                          {cat.name}
                        </span>
                      </label>
                      <span className="text-[10px] text-on-surface-variant/40">({cat.count})</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Filter Block: Price Range */}
            <div>
              <h3 className="font-label-caps text-label-caps text-primary mb-md pb-xs border-b border-outline-variant/30 tracking-widest uppercase">
                Price Range
              </h3>
              <div className="px-xs pt-base">
                <input
                  type="range"
                  min="0"
                  max="1200"
                  step="20"
                  value={maxPrice}
                  onChange={(e) => dispatch(setMaxPrice(Number(e.target.value)))}
                  className="w-full h-1 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-sm text-on-surface-variant font-label-caps text-[10px] tracking-wider">
                  <span>$0</span>
                  <span className="text-primary font-bold">Max: ${maxPrice}</span>
                  <span>$1,200+</span>
                </div>
              </div>
            </div>

            {/* Filter Block: Brand */}
            <div>
              <h3 className="font-label-caps text-label-caps text-primary mb-md pb-xs border-b border-outline-variant/30 tracking-widest uppercase">
                Brand
              </h3>
              <ul className="space-y-base max-h-36 overflow-y-auto custom-scrollbar pr-xs">
                {brandsList.map((brand) => {
                  const isChecked = selectedBrands.includes(brand);
                  return (
                    <li key={brand} className="flex items-center space-x-base">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => { dispatch(toggleBrandFilter(brand)); dispatch(setCurrentPage(1)); }}
                        className="rounded border-outline-variant/60 text-primary focus:ring-0 cursor-pointer"
                        id={`brand-${brand}`}
                      />
                      <label
                        htmlFor={`brand-${brand}`}
                        className="font-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      >
                        {brand}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="font-label-caps text-label-caps text-primary mb-md pb-xs border-b border-outline-variant/30 tracking-widest uppercase">Minimum rating</h3>
              <select value={minimumRating} onChange={(event) => { setMinimumRating(Number(event.target.value)); dispatch(setCurrentPage(1)); }} className="w-full rounded-lg border-outline-variant bg-transparent text-sm">
                <option value="0">Any rating</option><option value="3">3 stars & up</option><option value="4">4 stars & up</option><option value="4.5">4.5 stars & up</option>
              </select>
            </div>

            {/* Reset Filters CTA */}
            {(selectedCategories.length > 0 || selectedBrands.length > 0 || maxPrice < 1200 || sortBy !== "Featured" || minimumRating > 0 || search) && (
              <button
                onClick={clearFilters}
                className="w-full py-2 border border-dashed border-error text-error rounded-lg font-button text-button hover:bg-error/5 transition-colors"
              >
                Clear All Filters
              </button>
            )}

          </div>
        </aside>

        {/* Catalog Grid */}
        <div className="flex-grow">
          {isLoading ? (
            <LoadingSpinner />
          ) : isError ? (
            <EmptyState title="Products could not load" description="Check your connection and try again." actionText="Retry" actionUrl="/products" icon={PackageOpen} />
          ) : sortedProducts.length === 0 ? (
            <EmptyState
              title="No pieces found"
              description="No products match your active category, brand, or price constraints. Try clearing your filters."
              actionText="Reset Filters"
              actionUrl="/products"
              icon={PackageOpen}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-lg gap-x-md">
                {sortedProducts.map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Load More Pagination */}
              <div className="mt-xl text-center">
                <div className="flex items-center justify-center gap-md">
                  <button disabled={(pagination?.page || 1) <= 1} onClick={() => dispatch(setCurrentPage(currentPage - 1))} className="rounded-full border border-primary px-lg py-sm text-primary disabled:opacity-40">Previous</button>
                  <span className="text-sm text-on-surface-variant">Page {pagination?.page || 1} of {Math.max(1, pagination?.totalPages || 1)}</span>
                  <button disabled={(pagination?.page || 1) >= (pagination?.totalPages || 1)} onClick={() => dispatch(setCurrentPage(currentPage + 1))} className="rounded-full border border-primary px-lg py-sm text-primary disabled:opacity-40">Next</button>
                </div>
                <p className="mt-md font-body-sm text-body-sm text-on-surface-variant">
                  Showing {sortedProducts.length} of {pagination?.total || 0} results
                </p>
              </div>
            </>
          )}

          {/* AI Recommended For You Section */}
          <AIProductRecommendationsSection category={selectedCategories[0]} />
        </div>
      </div>
    </div>
  );
};

const AIProductRecommendationsSection = ({ category }) => {
  const { data } = useGetAIRecommendationsQuery({ category, limit: 4 });
  const recs = data?.data || [];

  if (!recs.length) return null;

  return (
    <section className="mt-20 pt-10 border-t border-outline-variant/30">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
          <Sparkles className="w-5 h-5 fill-primary" />
        </div>
        <div>
          <h3 className="font-headline-sm text-xl text-primary font-bold">Recommended for You</h3>
          <p className="text-xs text-on-surface-variant">Curated using product embeddings & catalog vector similarity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recs.map((prod) => (
          <ProductCard key={prod._id || prod.id} product={prod} />
        ))}
      </div>
    </section>
  );
};

export default Products;
