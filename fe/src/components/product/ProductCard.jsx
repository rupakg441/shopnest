import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import { toggleWishlist } from '../../features/ui/uiSlice';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.ui.wishlist);
  const isWishlisted = wishlist.includes(product.id);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    dispatch(toggleWishlist(product.id));

    // Simple scale haptic animation feedback
    const btn = e.currentTarget;
    btn.classList.add('scale-125');
    setTimeout(() => btn.classList.remove('scale-125'), 200);
  };

  // Check if bestseller or limited is in tags
  const isBestseller = product.tags?.includes("BESTSELLER");
  const isLimited = product.tags?.includes("LIMITED");
  const isNew = product.tags?.includes("NEW");

  return (
    <div
      onClick={handleCardClick}
      className="product-card-hover group cursor-pointer relative flex flex-col justify-between h-full"
    >
      <div>
        <div className="aspect-[4/5] bg-surface relative rounded-xl overflow-hidden mb-4 border border-outline-variant/10">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
          {/* Wishlist Heart Button */}
          <button
            onClick={handleWishlistClick}
            className={`wishlist-btn absolute top-4 right-4 bg-white/80 backdrop-blur-xs p-2 rounded-full shadow-xs md:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white active:scale-95`}
            title="Add to Wishlist"
          >
            <Heart
              size={18}
              strokeWidth={1.5}
              className={`transition-colors ${
                isWishlisted
                  ? 'fill-error text-error'
                  : 'text-primary'
              }`}
            />
          </button>
          {/* Badge overlays */}
          {(isBestseller || product.isFeatured) && (
            <span className="absolute top-4 left-4 bg-primary text-on-primary font-label-caps text-[9px] px-2 py-1 tracking-widest uppercase">
              BESTSELLER
            </span>
          )}
          {isLimited && (
            <span className="absolute top-4 left-4 bg-secondary text-white font-label-caps text-[9px] px-2 py-1 tracking-widest uppercase">
              LIMITED
            </span>
          )}
          {isNew && (
            <span className="absolute top-4 left-4 bg-primary text-on-primary font-label-caps text-[9px] px-2 py-1 tracking-widest uppercase">
              NEW
            </span>
          )}
        </div>
        
        <p className="font-label-caps text-[10px] text-on-surface-variant/60 mb-1 tracking-widest uppercase">
          {product.brand.split(' ')[0]}
        </p>
        <h4 className="font-body-md font-bold mb-1 group-hover:underline decoration-1 text-primary">
          {product.title}
        </h4>
      </div>
      <p className="font-body-md text-primary font-semibold mt-1">
        ${Number(product.discountPrice != null && product.discountPrice < product.price ? product.discountPrice : product.price).toFixed(2)}
        {product.discountPrice != null && product.discountPrice < product.price && <span className="ml-sm text-sm font-normal text-on-surface-variant line-through">${Number(product.price).toFixed(2)}</span>}
      </p>
    </div>
  );
};

export default ProductCard;
