import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductByIdQuery, useGetCatalogPageQuery } from '../../features/products/productApi';
import { useGetProductReviewsQuery, useCreateProductReviewMutation } from '../../features/products/reviewApi';
import { addToCart } from '../../features/cart/cartSlice';
import { useAddCartItemMutation } from '../../features/cart/cartApi';
import { toggleWishlist } from '../../features/ui/uiSlice';
import { useAddWishlistItemMutation, useRemoveWishlistItemMutation } from '../../features/wishlist/wishlistApi';
import Rating from '../../components/common/Rating';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductCard from '../../components/product/ProductCard';
import { Heart, Truck, ShieldCheck, ZoomIn, ArrowRight, Sparkles } from 'lucide-react';
import { useGetAIRecommendationsQuery } from '../../features/ai/aiApi';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: product, isLoading, isError } = useGetProductByIdQuery(id || "p11");
  const { data: relatedData } = useGetCatalogPageQuery({ category: product?.category, page: 1, limit: 5 }, { skip: !product });
  const { data: reviews = [], isLoading: reviewsLoading } = useGetProductReviewsQuery(id, { skip: !id });
  const [createReview, { isLoading: submittingReview }] = useCreateProductReviewMutation();
  const [addCartItem] = useAddCartItemMutation();
  const [addWishlistItem] = useAddWishlistItemMutation();
  const [removeWishlistItem] = useRemoveWishlistItemMutation();

  const wishlist = useSelector((state) => state.ui.wishlist);
  const auth = useSelector((state) => state.auth);
  const isWishlisted = product ? wishlist.includes(product.id) : false;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

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

  const gallery = product.images?.length ? product.images : [product.image].filter(Boolean);
  const selectedVariant = product.variants?.find((variant) =>
    (!variant.color || variant.color === selectedColor) && (!variant.size || variant.size === selectedSize));
  const currentPrice = selectedVariant?.price ?? product.discountPrice ?? product.price;
  const availableStock = selectedVariant?.stock ?? product.stock;
  const hasAvailableVariant = !product.variants?.length || Boolean(selectedVariant);
  const specifications = [
    ...(product.specifications || []),
    ...Object.entries(product.details || {}).filter(([, value]) => value).map(([name, value]) => ({ name, value })),
  ];

  const handleAddToCart = async () => {
    if (!availableStock || quantity > availableStock || !hasAvailableVariant) return;
    setCartMessage('');
    if (auth.isAuthenticated) {
      try {
        await addCartItem({ productId: product.id, quantity, color: selectedColor, size: selectedSize }).unwrap();
      } catch (error) {
        setCartMessage(error?.data?.message || 'This item could not be added to your cart.');
        return false;
      }
    } else {
      dispatch(addToCart({
        id: product.id,
        title: product.title,
        brand: product.brand,
        category: product.category,
        price: currentPrice,
        quantity,
        color: selectedColor,
        size: selectedSize,
        image: gallery[activeImageIdx] || product.image
      }));
    }
    
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 3000);
    return true;
  };

  const handleBuyNow = async () => {
    if (await handleAddToCart()) navigate('/checkout');
  };

  const handleWishlistToggle = async () => {
    if (!auth.isAuthenticated) {
      dispatch(toggleWishlist(product.id));
      return;
    }
    try {
      if (isWishlisted) await removeWishlistItem(product.id).unwrap();
      else await addWishlistItem(product.id).unwrap();
    } catch (error) {
      setCartMessage(error?.data?.message || 'Your wishlist could not be updated.');
    }
  };

  // Find related products
  const relatedProducts = relatedData?.products
    ? relatedData.products.filter((p) => p.id !== product.id).slice(0, 4)
    : [];

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewMessage('');
    try {
      await createReview({ productId: id, rating: reviewRating, comment: reviewComment }).unwrap();
      setReviewComment('');
      setReviewOpen(false);
      setReviewMessage('Your review is submitted and will appear after moderation.');
    } catch (error) {
      setReviewMessage(error?.data?.message || 'You must purchase this product before reviewing it.');
    }
  };

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
                ${Number(currentPrice).toFixed(2)}
              </p>
              {product.discountPrice != null && product.discountPrice < product.price && !selectedVariant && <p className="text-sm text-on-surface-variant line-through">${Number(product.price).toFixed(2)}</p>}
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}</p>
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
                    onClick={() => setQuantity((q) => Math.min(availableStock || q, q + 1))}
                    className="px-4 h-full hover:bg-surface-container transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={!availableStock || quantity > availableStock || !hasAvailableVariant}
                  className="flex-1 bg-primary text-white h-14 rounded-xl font-button text-button hover:opacity-90 transition-all active:scale-[0.98] tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {!availableStock ? 'Out of Stock' : hasAvailableVariant ? 'Add to Cart' : 'Unavailable Variant'}
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={!availableStock || quantity > availableStock || !hasAvailableVariant}
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
              {cartMessage && <p role="alert" className="text-error text-sm">{cartMessage}</p>}
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
            </div>
          )}
          
          {activeTab === 'spec' && (
            specifications.length ? <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-md gap-x-gutter animate-fade-in">{specifications.map((item) => <div key={item.name}><dt className="font-label-caps text-on-surface-variant text-[10px] uppercase tracking-wider">{item.name}</dt><dd className="font-body-md text-primary font-bold">{item.value}</dd></div>)}</dl> : <p className="text-sm text-on-surface-variant">No specifications have been added for this product.</p>
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

      {/* Purchase-verified reviews */}
      <section className="mt-xl py-xl border-t border-outline-variant/30">
        <div className="flex flex-wrap justify-between items-end gap-md mb-lg">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary">Customer Reviews</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Based on {reviews.length} verified customer experiences</p>
          </div>
          {auth.isAuthenticated ? (
            <button onClick={() => setReviewOpen((open) => !open)} className="font-label-caps text-label-caps border-b border-primary pb-xs tracking-widest text-[11px] uppercase">Write a review</button>
          ) : <Link to="/login" className="font-label-caps text-label-caps border-b border-primary pb-xs tracking-widest text-[11px] uppercase">Sign in to review</Link>}
        </div>

        {reviewMessage && <p role="status" className="mb-md rounded-lg bg-surface-container-low p-md text-sm">{reviewMessage}</p>}
        {reviewOpen && (
          <form onSubmit={submitReview} className="mb-lg max-w-2xl space-y-md rounded-xl border border-outline-variant/30 bg-surface p-lg">
            <label className="block text-sm">Rating<select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))} className="mt-xs block rounded-lg border-outline-variant"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></label>
            <label className="block text-sm">Your review<textarea required minLength={3} maxLength={2000} rows={4} value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} className="mt-xs w-full rounded-lg border-outline-variant" /></label>
            <button disabled={submittingReview} className="rounded-xl bg-primary px-lg py-sm text-white">{submittingReview ? 'Posting…' : 'Post review'}</button>
          </form>
        )}

        {reviewsLoading ? <LoadingSpinner /> : reviews.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {reviews.map((review) => (
              <article key={review._id} className="p-lg bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-xs">
                <div className="flex items-center gap-sm mb-md">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container text-sm">{review.userName?.charAt(0) || 'C'}</div>
                  <div><p className="font-label-caps text-label-caps font-bold">{review.userName || 'ShopNest customer'}</p><p className="text-[10px] text-on-surface-variant">Purchase verified · {new Date(review.createdAt).toLocaleDateString()}</p></div>
                </div>
                <Rating rating={review.rating} size={14} className="mb-sm text-secondary" />
                <p className="font-body-sm text-body-sm text-on-surface italic leading-relaxed">{review.comment}</p>
              </article>
            ))}
          </div>
        ) : <p className="rounded-xl bg-surface-container-low p-lg text-sm text-on-surface-variant">No reviews yet. Be the first verified buyer to share your experience.</p>}
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

      {/* AI Vector Similar Products */}
      <AISimilarProductsSection productId={id} />
    </div>
  );
};

const AISimilarProductsSection = ({ productId }) => {
  const { data } = useGetAIRecommendationsQuery({ productId, limit: 4 });
  const recs = data?.data || [];

  if (!recs.length) return null;

  return (
    <section className="mt-xl pb-xl border-t border-outline-variant/30 pt-xl">
      <div className="flex items-center gap-2 mb-lg">
        <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
          <Sparkles className="w-5 h-5 fill-primary" />
        </div>
        <div>
          <h2 className="font-headline-sm text-xl text-primary font-bold">Similar Products (AI Match)</h2>
          <p className="text-xs text-on-surface-variant">Matched using catalog embedding vector similarity.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {recs.map((prod) => (
          <div key={prod._id || prod.id}>
            <ProductCard product={prod} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductDetails;

