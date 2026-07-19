import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-16 h-16 border-3'
  };

  return (
    <div className={`flex items-center justify-center py-xl ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-outline-variant border-t-primary rounded-full animate-spin`}
      />
    </div>
  );
};

export default LoadingSpinner;
