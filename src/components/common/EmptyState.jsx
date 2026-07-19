import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  title = "No items found",
  description = "Start exploring our collection to find premium pieces.",
  actionText = "Continue Shopping",
  actionUrl = "/products",
  icon: Icon,
  className = ''
}) => {
  return (
    <div className={`text-center py-xl px-gutter flex flex-col items-center justify-center max-w-md mx-auto ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-md text-on-surface-variant/80">
          <Icon size={28} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">{title}</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg leading-relaxed">{description}</p>
      {actionText && (
        <Link
          to={actionUrl}
          className="px-xl py-md bg-primary text-on-primary font-button text-button rounded-xl hover:opacity-90 transition-all tracking-wider inline-block shadow-sm"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
