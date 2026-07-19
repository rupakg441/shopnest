import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductByIdQuery, useGetProductsQuery } from '../../features/products/productApi';
import { addToCart } from '../../features/cart/cartSlice';
import { toggleWishlist } from '../../features/ui/uiSlice';
import Rating from '../../components/common/Rating';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductCard from '../../components/product/ProductCard';
import { Heart, Truck, ShieldCheck, ZoomIn, ArrowRight } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: product, isLoading, isError } = useGetProductByIdQuery(id || "p11");
  const { data: allProducts } = useGetProductsQuery();

  const wishlist = useSelector((state) => state.ui.wishlist);
  const isWishlisted = product ? wishlist.includes(product.id) : false;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");
  const [cartSuccess, setCartSuccess] = useState(false);

  // Set default swatches when product loads
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0] || "");
      setSelectedSize(product.sizes?.[0] || "");
      setActiveImageIdx(0);
      setQuantity(1);
    }
  }, [product]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !product) {
    return (
      <div className="max-w-container-max mx-auto px-gutter py-xl text-center">
        <h2 className="font-headline-sm text-headline-sm text-error mb-4">Error loading product details</h2>
        <p className="font-body-md mb-8">The requested item could not be retrieved.</p>
        <Link to="/products" className="px-md py-sm bg-primary text-on-primary rounded-lg font-button text-button">
          Back to Collection
        </Link>
      </div>
    );
  }

  // Fallback gallery images
  const gallery = [
    product.image,
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDDMqC3d1zm0IhBeGsWQZ65ys1CevnkOYgtzdCp2t4Y5jVJZK4iF8sjEE7XUwLQxv1ctAkDosXdNhN-w_A71M8n4CNckVf3TWZdx3gfYvSNKyqDQrw_xlcVBVy-ARh60sLRvscjEURa31MHkOFutENe4a_6rJPzZfd6OX7qCXLhjMQEOsvkFQDLE9DdBRvPLgSSnUcgKM3YMYwkVFzHZuUmhU2wK18ybErlknXVFhGvb-jo-uALn3wo",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDjIG-QDUHT8_9T-6KUk-ZFXj6m8IXoGbvLQJ8_OIIUFFETiKtX2jkBWGyioiSDSxTgdJFc9lP2j43vxgsFqpb2Sc7ajuCSVX0z8Z-NAV2TpLs9DY26Rig7IHMcz21tIXDRJK40Go-ZGERroNgSAC8f7kgbPUel5ssOWu7zeXc7tkFLUVT5g2-_asXRkJc3oJJO1eTU5aWVohtZJI7FrmgbsHEpxk5VTv_-PVLHw9KlTXNGcCNeDRTY",
  ];

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      brand: product.brand,
      category: product.category,
      price: product.price,
      quantity,
      color: selectedColor,
      size: selectedSize,
      image: product.image
    }));
    
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    dispatch(toggleWishlist(product.id));
  };

  // Find related products
  const relatedProducts = allProducts
    ? allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
    : [];

  return (
    <div className="max-w-container-max mx-auto px-gutter">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: product.category, url: '/products' },
          { label: product.title, url: `/products/${product.id}` },
        ]}
        className="mt-xs"
      />

      {/* Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg mt-md">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-base">
          {/* Big Active Image */}
          <div className="flex-1 zoom-container overflow-hidden rounded-xl bg-surface-container-low relative group h-[400px] md:h-[600px] border border-outline-variant/10">
            <img
              src={gallery[activeImageIdx] || product.image}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out cursor-zoom-in"
            />
            <button className="absolute bottom-md right-md bg-white/95 p-base rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-primary">
              <ZoomIn size={18} />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="flex md:flex-col gap-base overflow-x-auto md:w-24 hide-scrollbar">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`rounded-lg overflow-hidden shrink-0 w-20 md:w-full aspect-square border-2 transition-all ${
                  activeImageIdx === idx ? 'border-primary' : 'border-transparent hover:border-outline-variant'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Product Description, Swatches, Cart Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-base">
            <div className="pb-sm border-b border-outline-variant/10">
              <span className="font-label-caps text-label-caps text-on-surface-variant tracking-[0.2em] uppercase block mb-1">
                {product.tags?.[0] || "Designer Collection"}
              </span>
              <h1 className="font-display-lg text-headline-md text-primary leading-tight">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-sm mt-base">
                <Rating rating={product.rating} />
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  ({product.reviewsCount} Reviews)
                </span>
              </div>
            </div>

            <div className="py-md border-b border-outline-variant/10">
              <p className="font-headline-sm text-headline-sm text-primary font-bold">
                ${product.price.toFixed(2)}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                Or 4 interest-free payments of ${(product.price / 4).toFixed(2)} with <span className="font-bold underline cursor-help text-primary">AfterPay</span>
              </p>
            </div>

            {/* Colors Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="font-label-caps text-label-caps text-primary mb-base block uppercase tracking-wider">
                  Color: {selectedColor}
                </label>
                <div className="flex gap-base">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1 rounded-lg border text-xs font-label-caps transition-all ${
                        selectedColor === color
                          ? 'border-primary bg-primary text-white shadow-xs'
                          : 'border-outline-variant text-on-surface-variant hover:border-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Swatches */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="font-label-caps text-label-caps text-primary mb-base block uppercase tracking-wider">
                  Size
                </label>
                <div className="flex gap-base">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border font-label-caps text-[11px] rounded-lg transition-all uppercase tracking-wider ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-white shadow-xs'
                          : 'border-outline-variant text-on-surface hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add Button */}
            <div className="pt-md space-y-md">
              <div className="flex items-center gap-md">
                <div className="flex items-center border border-outline-variant rounded-xl h-14 overflow-hidden bg-transparent">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 h-full hover:bg-surface-container transition-colors text-lg"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold font-body-md text-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 h-full hover:bg-surface-container transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-white h-14 rounded-xl font-button text-button hover:opacity-90 transition-all active:scale-[0.98] tracking-wider uppercase"
                >
                  Add to Cart
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full border border-primary h-14 rounded-xl font-button text-button text-primary hover:bg-surface-container-low transition-all active:scale-[0.98] tracking-wider uppercase"
              >
                Buy It Now
              </button>

              {/* Wishlist toggle text link */}
              <button
                onClick={handleWishlistToggle}
                className="flex items-center gap-xs text-xs font-label-caps text-on-surface-variant hover:text-primary transition-colors tracking-widest pt-2"
              >
                <Heart size={14} className={isWishlisted ? 'fill-error text-error' : ''} />
                {isWishlisted ? 'REMOVE FROM WISHLIST' : 'ADD TO WISHLIST'}
              </button>

              {cartSuccess && (
                <div className="bg-secondary-container text-on-secondary-container p-sm rounded-xl text-center text-xs font-bold animate-pulse">
                  Product successfully added to your shopping bag!
                </div>
              )}
            </div>

            {/* Quick Features */}
            <div className="grid grid-cols-2 gap-md pt-md border-t border-outline-variant/20 mt-lg">
              <div className="flex items-center gap-sm text-on-surface-variant">
                <Truck size={18} className="text-primary" />
                <span className="font-body-sm text-body-sm">Free global shipping</span>
              </div>
              <div className="flex items-center gap-sm text-on-surface-variant">
                <ShieldCheck size={18} className="text-primary" />
                <span className="font-body-sm text-body-sm">2 Year Warranty</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Tabs Section */}
      <section className="mt-xl">
        <div className="flex border-b border-outline-variant/30 gap-lg overflow-x-auto hide-scrollbar">
          {[
            { id: "desc", label: "Description" },
            { id: "spec", label: "Specifications" },
            { id: "ship", label: "Shipping & Returns" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-md font-label-caps text-label-caps uppercase tracking-widest transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="py-lg max-w-4xl min-h-[120px]">
          {activeTab === 'desc' && (
            <div className="space-y-md animate-fade-in">
              <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                {product.description}
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Crafted in collaboration with independent designers, this piece reflects ShopNest's commitment to quiet luxury and sustainable production methods. The custom finish is achieved through proprietary natural oxidation processes, ensuring each piece is unique.
              </p>
            </div>
          )}
          
          {activeTab === 'spec' && (
            <div className="grid grid-cols-2 gap-y-md gap-x-gutter animate-fade-in">
              <div>
                <p className="font-label-caps text-on-surface-variant text-[10px] uppercase tracking-wider">Material</p>
                <p className="font-body-md text-primary font-bold">{product.details?.material || "Organic Materials"}</p>
              </div>
              <div>
                <p className="font-label-caps text-on-surface-variant text-[10px] uppercase tracking-wider">Dimensions</p>
                <p className="font-body-md text-primary font-bold">{product.details?.dimensions || "H: 30cm x W: 20cm"}</p>
              </div>
              <div>
                <p className="font-label-caps text-on-surface-variant text-[10px] uppercase tracking-wider">Weight</p>
                <p className="font-body-md text-primary font-bold">{product.details?.weight || "1.0kg"}</p>
              </div>
              <div>
                <p className="font-label-caps text-on-surface-variant text-[10px] uppercase tracking-wider">Care Instructions</p>
                <p className="font-body-md text-primary font-bold">Wipe clean with a soft dry cloth.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'ship' && (
            <div className="space-y-md animate-fade-in">
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                We offer complimentary carbon-neutral shipping on all orders over $200. Each piece is meticulously packed in recyclable, high-density protective foam to ensure a safe journey to your home.
              </p>
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                Returns: We accept returns within 14 days of delivery for store credit or refund, provided the item is in its original condition and packaging.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Verified Reviews */}
      <section className="mt-xl py-xl border-t border-outline-variant/30">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary">Verified Reviews</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Based on {product.reviewsCount} customer experiences</p>
          </div>
          <button className="font-label-caps text-label-caps border-b border-primary pb-xs hover:opacity-75 transition-opacity tracking-widest text-[11px] uppercase">
            Write a review
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="p-lg bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-xs">
            <div className="flex items-center gap-sm mb-md">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container text-sm">
                E
              </div>
              <div>
                <p className="font-label-caps text-label-caps font-bold">Elena R.</p>
                <p className="text-[10px] text-on-surface-variant">Verified Purchase • 2 weeks ago</p>
              </div>
            </div>
            <Rating rating={5} size={14} className="mb-sm text-secondary" />
            <p className="font-body-sm text-body-sm text-on-surface italic leading-relaxed">
              "The texture is even more beautiful in person. It has a significant weight to it that feels very high quality. Truly an architectural anchor for my dining table."
            </p>
          </div>
          
          <div className="p-lg bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-xs">
            <div className="flex items-center gap-sm mb-md">
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center font-bold text-on-surface-variant text-sm">
                M
              </div>
              <div>
                <p className="font-label-caps text-label-caps font-bold">Marcus T.</p>
                <p className="text-[10px] text-on-surface-variant">Verified Purchase • 1 month ago</p>
              </div>
            </div>
            <Rating rating={4} size={14} className="mb-sm text-secondary" />
            <p className="font-body-sm text-body-sm text-on-surface italic leading-relaxed">
              "Packaged exceptionally well. The shipping took a bit longer to Australia, but the product itself is flawless. Exactly what I was looking for."
            </p>
          </div>
        </div>
      </section>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="mt-xl pb-xl border-t border-outline-variant/30 pt-xl">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-lg">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {relatedProducts.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
