import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetProductsQuery } from '../../features/products/productApi';
import { toggleCategoryFilter, toggleBrandFilter, setMaxPrice, setSortBy, setCurrentPage, resetFilters } from '../../features/products/productSlice';
import ProductCard from '../../components/product/ProductCard';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ChevronDown, PackageOpen } from 'lucide-react';

const Products = () => {
  const dispatch = useDispatch();
  const { data: products, isLoading } = useGetProductsQuery();

  const { selectedCategories, selectedBrands, maxPrice, sortBy } = useSelector((state) => state.products);

  const [sortOpen, setSortOpen] = useState(false);

  // Available filters configuration
  const categoriesList = [
    { name: "Lighting", count: 12 },
    { name: "Furniture", count: 34 },
    { name: "Ceramics", count: 18 },
    { name: "Accessories", count: 8 },
    { name: "Apparel", count: 20 },
    { name: "Fragrance", count: 15 }
  ];

  const brandsList = ["Ligne Roset", "Hay Design", "Muuto", "Vitra", "Hasami Porcelain", "ShopNest Design"];

  const colorsList = [
    { name: "White", bg: "bg-white border-outline-variant" },
    { name: "Light Sand", bg: "bg-stone-100 border-outline-variant" },
    { name: "Charcoal", bg: "bg-stone-900 border-outline" },
    { name: "Amber Gold", bg: "bg-amber-200 border-outline-variant" },
    { name: "Deep Indigo", bg: "bg-indigo-950 border-outline-variant" }
  ];

  // Filtering Logic
  const filteredProducts = products ? products.filter((product) => {
    // Category Filter
    if (selectedCategories.length > 0) {
      if (!selectedCategories.some(cat => product.category.toLowerCase() === cat.toLowerCase())) {
        return false;
      }
    }
    
    // Brand Filter
    if (selectedBrands.length > 0) {
      if (!selectedBrands.some(brand => product.brand.toLowerCase().includes(brand.toLowerCase()))) {
        return false;
      }
    }
    
    // Price Filter
    if (product.price > maxPrice) {
      return false;
    }
    
    return true;
  }) : [];

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "Price: Low-High") {
      return a.price - b.price;
    }
    if (sortBy === "Price: High-Low") {
      return b.price - a.price;
    }
    if (sortBy === "Newest") {
      const aNew = a.tags?.includes("NEW") ? 1 : 0;
      const bNew = b.tags?.includes("NEW") ? 1 : 0;
      return bNew - aNew;
    }
    // Featured default ordering
    return 0;
  });

  const handleSortSelect = (value) => {
    dispatch(setSortBy(value));
    setSortOpen(false);
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
              Exploring {sortedProducts.length} curated objects for the modern home.
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
                          onChange={() => dispatch(toggleCategoryFilter(cat.name))}
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
                        onChange={() => dispatch(toggleBrandFilter(brand))}
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

            {/* Filter Block: Color (Visual Only) */}
            <div>
              <h3 className="font-label-caps text-label-caps text-primary mb-md pb-xs border-b border-outline-variant/30 tracking-widest uppercase">
                Colors
              </h3>
              <div className="flex flex-wrap gap-sm">
                {colorsList.map((col) => (
                  <button
                    key={col.name}
                    className={`w-6 h-6 rounded-full border hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all ${col.bg}`}
                    title={col.name}
                  />
                ))}
              </div>
            </div>

            {/* Reset Filters CTA */}
            {(selectedCategories.length > 0 || selectedBrands.length > 0 || maxPrice < 1200 || sortBy !== "Featured") && (
              <button
                onClick={() => dispatch(resetFilters())}
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
                <button
                  className="px-xl py-md border border-primary text-primary font-label-caps text-label-caps tracking-widest hover:bg-primary hover:text-white transition-all duration-300 rounded-full"
                >
                  Load More
                </button>
                <p className="mt-md font-body-sm text-body-sm text-on-surface-variant">
                  Showing {sortedProducts.length} of {sortedProducts.length} results
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
