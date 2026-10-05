import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { useExecuteToolActionMutation } from '../../features/ai/aiApi';

const AIProductCard = ({ product }) => {
  const [executeTool, { isLoading }] = useExecuteToolActionMutation();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await executeTool({
        toolName: 'addToCart',
        args: { productId: product.id || product._id, quantity: 1 },
      }).unwrap();
      alert(`Added ${product.title} to your cart!`);
    } catch (err) {
      alert(err?.data?.message || 'Please log in to add items to your cart.');
    }
  };

  const productId = product.id || product._id;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-surface p-3 rounded-lg border border-surface-container-high shadow-xs hover:border-primary/30 transition-all">
      {product.image && (
        <img
          src={product.image}
          alt={product.title}
          className="w-16 h-16 object-cover rounded-md bg-surface-container"
        />
      )}

      <div className="flex-1 min-w-0 text-left">
        <h4 className="text-sm font-semibold text-on-surface truncate">{product.title}</h4>
        <p className="text-xs text-on-surface-variant font-medium">
          {product.brand ? `${product.brand} • ` : ''}${product.category || 'General'}
        </p>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-primary">${(product.price || 0).toFixed(2)}</span>
          {product.rating > 0 && (
            <div className="flex items-center text-xs text-secondary font-medium">
              <Star className="w-3 h-3 fill-secondary text-secondary mr-0.5" />
              <span>{product.rating}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="flex items-center justify-center gap-1 text-xs bg-primary text-on-primary px-2.5 py-1.5 rounded-md font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isLoading ? 'Adding...' : 'Add'}</span>
        </button>

        <Link
          to={`/products/${productId}`}
          className="flex items-center justify-center text-xs border border-outline/30 text-on-surface px-2.5 py-1.5 rounded-md font-medium hover:bg-surface-container-high transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default AIProductCard;
