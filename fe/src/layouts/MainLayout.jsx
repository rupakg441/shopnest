import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, ShoppingBag, User, Menu, X, Globe, Camera, Mail, ArrowRight } from 'lucide-react';
import { toggleMobileMenu, setMobileMenuOpen } from '../features/ui/uiSlice';
import { logout } from '../features/auth/authSlice';
import { useLogoutUserMutation } from '../features/auth/authApi';
import AIAssistantWidget from '../components/ai/AIAssistantWidget';
import ShopNestAssistant from '../components/assistant/ShopNestAssistant';
import { useSubscribeNewsletterMutation } from '../features/dashboard/newsletterApi';
import { useGetPublicStoreSettingsQuery } from '../features/dashboard/settingsApi';

const MainLayout = () => {
  const [scrolled, setScrolled] = useState(false);
  const [newsEmail, setNewsEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  
  const dispatch = useDispatch();
  const [logoutUser] = useLogoutUserMutation();
  const [subscribeNewsletter, { isLoading: newsletterLoading }] = useSubscribeNewsletterMutation();
  const { data: storeSettings } = useGetPublicStoreSettingsQuery();
  const showAnnouncement = storeSettings ? storeSettings.announcementEnabled : true;
  const navigate = useNavigate();
  const location = useLocation();

  const mobileMenuOpen = useSelector((state) => state.ui.mobileMenuOpen);
  const wishlist = useSelector((state) => state.ui.wishlist);
  const cartItems = useSelector((state) => state.cart.items);
  const auth = useSelector((state) => state.auth);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Monitor scroll for header shrinking and shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route transitions
  useEffect(() => {
    dispatch(setMobileMenuOpen(false));
  }, [location.pathname, dispatch]);

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    if (newsEmail.trim()) {
      try {
        await subscribeNewsletter(newsEmail).unwrap();
        setSubscribed(true);
        setNewsletterMessage('Thank you for subscribing.');
        setNewsEmail('');
      } catch (error) {
        setNewsletterMessage(error.data?.message || 'Could not subscribe right now. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Announcement Bar */}
      {showAnnouncement && <div className="w-full bg-primary py-2 text-center overflow-hidden">
        <p className="font-label-caps text-[10px] text-on-primary tracking-widest">
          {storeSettings?.announcement || 'COMPLIMENTARY GLOBAL SHIPPING ON ORDERS ABOVE $250 — LIMITED TIME'}
        </p>
      </div>}

      {/* Sticky Header */}
      <header
        className={`fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 transition-all duration-300 ease-in-out px-gutter ${
          scrolled ? 'h-16 shadow-sm mt-0' : `h-20 ${showAnnouncement ? 'mt-8 md:mt-10' : ''}`
        }`}
      >
        <div className="flex justify-between items-center h-full max-w-container-max mx-auto w-full">
          {/* Brand Logo */}
          <Link
            to="/"
            className="font-headline-md text-headline-md text-primary tracking-tighter hover:opacity-85 transition-opacity"
          >
            {storeSettings?.storeName || 'ShopNest'}
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-lg">
            <Link
              to="/products"
              className={`font-label-caps text-label-caps tracking-widest pb-1 border-b-2 transition-colors ${
                location.pathname === '/products'
                  ? 'text-primary border-primary font-bold'
                  : 'text-on-surface-variant border-transparent hover:text-primary'
              }`}
            >
              New Arrivals
            </Link>
            <Link
              to="/products"
              className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors tracking-widest"
            >
              Designers
            </Link>
            <Link
              to="/products"
              className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors tracking-widest"
            >
              Home Decor
            </Link>
            <Link
              to="/products"
              className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors tracking-widest"
            >
              Gifts
            </Link>
            <Link
              to="/ai-assistant"
              className={`font-label-caps text-label-caps tracking-widest pb-1 border-b-2 transition-colors ${
                location.pathname === '/ai-assistant'
                  ? 'text-primary border-primary font-bold'
                  : 'text-on-surface-variant border-transparent hover:text-primary'
              }`}
            >
              AI Assistant
            </Link>
            {['admin', 'superadmin'].includes(auth.user?.role) && (
              <Link
                to="/admin"
                className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors tracking-widest"
              >
                Console
              </Link>
            )}
          </nav>

          {/* Trailing Icons */}
          <div className="flex items-center space-x-md">
            {/* Wishlist Link */}
            <Link
              to="/account"
              className="hover:opacity-75 transition-opacity relative p-1"
              title="Wishlist"
            >
              <Heart size={20} strokeWidth={1.5} className="text-primary" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-secondary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="hover:opacity-75 transition-opacity relative p-1"
              title="Shopping Bag"
            >
              <ShoppingBag size={20} strokeWidth={1.5} className="text-primary" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile/Dashboard */}
            <Link
              to={auth.isAuthenticated ? (['admin', 'superadmin'].includes(auth.user?.role) ? "/admin" : "/account") : "/login"}
              className="hover:opacity-75 transition-opacity p-1"
              title={auth.isAuthenticated ? (['admin', 'superadmin'].includes(auth.user?.role) ? "Admin Console" : "My Account") : "Sign In"}
            >
              <User size={20} strokeWidth={1.5} className="text-primary" />
            </Link>

            {/* Hamburger (Mobile) */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="md:hidden hover:opacity-75 transition-opacity p-1"
              title="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden" onClick={() => dispatch(toggleMobileMenu())} />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-80 bg-surface z-50 shadow-2xl p-lg flex flex-col justify-between transform transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex justify-between items-center mb-xl">
            <span className="font-headline-sm text-headline-sm text-primary">ShopNest</span>
            <button onClick={() => dispatch(toggleMobileMenu())}>
              <X size={24} className="text-primary" />
            </button>
          </div>
          <nav className="flex flex-col space-y-md">
            <Link to="/products" className="font-label-caps text-lg tracking-wider text-primary border-b border-outline-variant/20 pb-2">
              New Arrivals
            </Link>
            <Link to="/products" className="font-label-caps text-lg tracking-wider text-on-surface-variant hover:text-primary">
              Designers
            </Link>
            <Link to="/products" className="font-label-caps text-lg tracking-wider text-on-surface-variant hover:text-primary">
              Home Decor
            </Link>
            <Link to="/products" className="font-label-caps text-lg tracking-wider text-on-surface-variant hover:text-primary">
              Gifts
            </Link>
            {['admin', 'superadmin'].includes(auth.user?.role) && (
              <Link to="/admin" className="font-label-caps text-lg tracking-wider text-on-surface-variant hover:text-primary">
                Admin Console
              </Link>
            )}
            {auth.isAuthenticated && (
              <button
                onClick={() => {
                  logoutUser();
                  dispatch(logout());
                  navigate('/');
                }}
                className="font-label-caps text-lg tracking-wider text-error text-left"
              >
                Sign Out
              </button>
            )}
          </nav>
        </div>
        <div className="border-t border-outline-variant/30 pt-md text-center">
          <p className="font-body-sm text-[12px] text-on-surface-variant">© 2024 ShopNest. Quiet Luxury.</p>
        </div>
      </div>

      {/* Page Content */}
      <main className="flex-grow pt-32">
        <Outlet />
      </main>

      <AIAssistantWidget />

      {/* Footer */}
      <footer className="bg-surface-container w-full mt-xl border-t border-outline-variant/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg px-gutter py-xl max-w-container-max mx-auto">
          {/* Brand Column */}
          <div className="flex flex-col space-y-md">
            <Link to="/" className="font-headline-sm text-headline-sm text-primary tracking-tighter">
              ShopNest
            </Link>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Defining modern luxury through conscious curation and architectural design principles.
            </p>
            <div className="flex space-x-md text-on-surface-variant">
              <a href="#" className="hover:text-primary transition-colors"><Globe size={18} /></a>
              <a href="#" className="hover:text-primary transition-colors"><Camera size={18} /></a>
              <a href="#" className="hover:text-primary transition-colors"><Mail size={18} /></a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-label-caps text-label-caps text-primary mb-6 tracking-widest uppercase">Customer Care</h4>
            <ul className="space-y-base">
              <li><Link to="/products" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Shipping & Returns</Link></li>
              <li><a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Size Guide</a></li>
              <li><a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Store Locator</a></li>
              <li>{storeSettings?.supportEmail ? <a href={`mailto:${storeSettings.supportEmail}`} className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Contact Us</a> : <span className="font-body-sm text-body-sm text-on-surface-variant">Contact Us</span>}</li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-label-caps text-label-caps text-primary mb-6 tracking-widest uppercase">Legal</h4>
            <ul className="space-y-base">
              <li><Link to="/pages/privacy-policy" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/pages/terms-of-service" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Accessibility Statement</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-md">
            <h4 className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Newsletter</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Subscribe for early access to new collections and exclusive editorial content.
            </p>
            {subscribed ? (
              <p className="text-secondary font-label-caps text-label-caps tracking-wider animate-fade-in">
                {newsletterMessage || 'Thank you for subscribing.'}
              </p>
            ) : (
              <form onSubmit={handleNewsSubmit} className="flex border-b border-primary py-xs">
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={newsEmail}
                  disabled={newsletterLoading}
                  onChange={(e) => setNewsEmail(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 w-full p-0 font-body-sm text-body-sm outline-none"
                />
                <button type="submit" disabled={newsletterLoading} className="hover:opacity-75 transition-opacity disabled:opacity-50" title="Subscribe">
                  <ArrowRight size={18} className="text-primary" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="border-t border-outline-variant/30 py-base px-gutter text-center">
          <p className="font-label-caps text-[10px] text-on-surface-variant">© 2024 ShopNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
