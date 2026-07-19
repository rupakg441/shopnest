import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart, applyPromo } from '../../features/cart/cartSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { useGetProductsQuery } from '../../features/products/productApi';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { data: allProducts, isLoading } = useGetProductsQuery();

  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState("");

  const handleQuantityChange = (item, direction) => {
    const newQty = direction === 'inc' ? item.quantity + 1 : item.quantity - 1;
    if (newQty > 0) {
      dispatch(updateQuantity({ id: item.id, color: item.color, size: item.size, quantity: newQty }));
    }
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart({ id: item.id, color: item.color, size: item.size }));
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput.trim().toUpperCase() === "WELCOME10") {
      if (cart.promoApplied) {
        setPromoMessage("Coupon already applied.");
      } else {
        dispatch(applyPromo(promoInput));
        setPromoMessage("10% discount applied successfully.");
        setPromoInput("");
      }
    } else {
      setPromoMessage("Invalid coupon code. Try WELCOME10.");
    }
    setTimeout(() => setPromoMessage(""), 4000);
  };

  const handleQuickAdd = (product) => {
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      brand: product.brand,
      category: product.category,
      price: product.price,
      quantity: 1,
      color: product.colors?.[0] || "Standard",
      size: product.sizes?.[0] || "Standard",
      image: product.image
    }));
  };

  // Recommended products list (filtering items not in the cart)
  const recommendedItems = allProducts
    ? allProducts.filter((p) => !cart.items.some(item => item.id === p.id)).slice(0, 4)
    : [];

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <EmptyState
          title="Your Shopping Bag is empty"
          description="You haven't added any pieces to your bag yet. Explore our curated collections to find the perfect addition to your home."
          actionText="Explore New Arrivals"
          actionUrl="/products"
          icon={ShoppingBag}
        />
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-gutter py-lg">
      <h1 className="font-display-lg text-display-lg text-primary mb-lg">Your Shopping Bag</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        
        {/* Left Column: Cart Items list */}
        <div className="lg:col-span-8 space-y-lg">
          {/* Header Row on Desktop */}
          <div className="hidden md:grid grid-cols-6 border-b border-outline-variant/30 pb-base mb-md">
            <div className="col-span-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              Product
            </div>
            <div className="col-span-1 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-center">
              Price
            </div>
            <div className="col-span-1 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-center">
              Quantity
            </div>
            <div className="col-span-1 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-right">
              Total
            </div>
          </div>

          {/* Cart Item rows */}
          {cart.items.map((item) => (
            <div
              key={`${item.id}-${item.color}-${item.size}`}
              className="grid grid-cols-1 md:grid-cols-6 gap-md md:gap-0 items-center py-md border-b border-outline-variant/10"
            >
              {/* Product description column */}
              <div className="col-span-3 flex items-center gap-md">
                <div className="w-24 h-32 bg-surface-container rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/10">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-1">{item.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">
                    {item.color} / {item.size}
                  </p>
                  <button
                    onClick={() => handleRemove(item)}
                    className="flex items-center gap-xs font-label-caps text-label-caps text-on-surface-variant hover:text-error transition-colors text-[10px] tracking-widest uppercase"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                </div>
              </div>

              {/* Price column */}
              <div className="col-span-1 text-center font-body-md text-body-md text-primary">
                ${item.price.toFixed(2)}
              </div>

              {/* Quantity selectors */}
              <div className="col-span-1 flex justify-center">
                <div className="flex items-center border border-outline-variant/50 rounded-lg p-1 bg-transparent">
                  <button
                    onClick={() => handleQuantityChange(item, 'dec')}
                    className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded transition-colors text-primary"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-body-md font-bold text-primary">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item, 'inc')}
                    className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded transition-colors text-primary"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total column */}
              <div className="col-span-1 text-right font-body-md text-body-md font-semibold text-primary">
                ${(item.price * item.quantity).toFixed(2)}
              </div>

            </div>
          ))}
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <aside className="lg:col-span-4 sticky top-32">
          <div className="bg-surface-container-low p-md rounded-xl space-y-lg border border-outline-variant/20 shadow-xs">
            <h2 className="font-headline-sm text-headline-sm text-primary border-b border-outline-variant/30 pb-base">
              Order Summary
            </h2>
            
            <div className="space-y-md">
              <div className="flex justify-between font-body-md text-body-md text-primary">
                <span className="text-on-surface-variant">Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-body-md text-body-md text-primary">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant">Estimated Shipping</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-secondary mt-0.5">Free Shipping</span>
                </div>
                <span>$0.00</span>
              </div>
              
              <div className="flex justify-between font-body-md text-body-md text-primary">
                <span className="text-on-surface-variant">Tax (8%)</span>
                <span>${cart.tax.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Application form */}
            <form onSubmit={handleApplyPromo} className="space-y-base">
              <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                Promo Code
              </label>
              <div className="flex gap-base">
                <input
                  type="text"
                  placeholder="Enter code (WELCOME10)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 bg-surface border border-outline-variant rounded-lg px-md py-sm focus:ring-0 focus:border-primary text-body-sm transition-all text-primary"
                />
                <button
                  type="submit"
                  className="font-button text-button px-md py-sm border border-primary hover:bg-primary hover:text-white transition-all rounded-lg text-primary"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p className="text-xs font-bold text-secondary mt-1">{promoMessage}</p>
              )}
              {cart.promoApplied && (
                <p className="text-xs text-green-700 font-bold">10% discount applied via coupon code: {cart.promoCode}</p>
              )}
            </form>

            <div className="border-t border-outline-variant/30 pt-md">
              <div className="flex justify-between items-end mb-lg">
                <span className="font-headline-sm text-headline-sm text-primary">Total</span>
                <span className="font-headline-md text-headline-md text-primary font-bold">
                  ${cart.total.toFixed(2)}
                </span>
              </div>
              
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary text-white py-md rounded-xl font-button text-button hover:opacity-95 transition-all active:scale-[0.98] uppercase tracking-wider"
              >
                Proceed to Checkout
              </button>
              
              <div className="flex items-center justify-center gap-xs text-on-surface-variant mt-md">
                <Lock size={12} className="text-secondary" />
                <p className="text-center text-[10px] font-label-caps">Secure Checkout Powered by ShopNest Pay</p>
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* Recommended Section */}
      {recommendedItems.length > 0 && (
        <section className="mt-xl border-t border-outline-variant/30 pt-xl">
          <div className="flex justify-between items-baseline mb-lg gap-2">
            <h2 className="font-headline-md text-headline-md text-primary">Recommended for You</h2>
            <Link
              to="/products"
              className="font-label-caps text-label-caps border-b border-primary pb-1 hover:opacity-70 transition-opacity tracking-widest text-[11px]"
            >
              View All
            </Link>
          </div>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              {recommendedItems.map((product) => (
                <div key={product.id} className="group cursor-pointer relative flex flex-col justify-between h-full">
                  <div className="aspect-[4/5] bg-surface-container rounded-xl overflow-hidden mb-base relative border border-outline-variant/10">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => handleQuickAdd(product)}
                      className="absolute bottom-md left-1/2 -translate-x-1/2 bg-white/90 hover:bg-white text-primary px-md py-sm rounded-full font-label-caps text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all shadow-sm tracking-wider"
                    >
                      Quick Add
                    </button>
                  </div>
                  <div>
                    <h3 className="font-body-md text-body-md font-semibold text-primary">{product.title}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Cart;
