import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-margin-mobile text-center">
      <span className="font-label-caps text-label-caps text-secondary tracking-[0.2em] mb-4 uppercase">Error 404</span>
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6">Page Not Found</h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mb-10 leading-relaxed">
        The piece or page you are looking for does not exist in our current collection. It may have been curated out or moved.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          to="/"
          className="bg-primary text-on-primary px-8 py-4 rounded-xl font-button text-button hover:opacity-90 transition-opacity tracking-wider shadow-sm"
        >
          Return Home
        </Link>
        <Link
          to="/products"
          className="border border-primary text-primary px-8 py-4 rounded-xl font-button text-button hover:bg-primary/5 transition-colors tracking-wider"
        >
          Shop Collection
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
