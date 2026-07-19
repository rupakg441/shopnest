import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumb = ({ items = [], className = '' }) => {
  return (
    <nav className={`py-base flex items-center font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest ${className}`}>
      <ul className="flex items-center gap-xs flex-wrap">
        <li>
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <li className="flex items-center">
                <ChevronRight size={10} className="text-on-surface-variant/60" />
              </li>
              {isLast ? (
                <li className="text-primary font-bold">{item.label}</li>
              ) : (
                <li>
                  <Link to={item.url} className="hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
