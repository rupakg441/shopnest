import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, ShoppingBag, Heart, MapPin, Settings, Search, Bell, Menu, X, Globe, Share2, Mail, Package, Users, LineChart, LogOut, ShoppingCart } from 'lucide-react';
import { logout } from '../features/auth/authSlice';

const AdminLayout = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth);

  React.useEffect(() => {
    setActiveTab("Overview");
  }, [location.pathname]);

  const isAccount = location.pathname.startsWith('/account');

  // Customer links
  const customerNav = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "My Orders", icon: ShoppingBag },
    { label: "Wishlist", icon: Heart },
    { label: "Addresses", icon: MapPin },
    { label: "Settings", icon: Settings }
  ];

  // Admin links
  const adminNav = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Inventory", icon: Package },
    { label: "Orders", icon: ShoppingCart },
    { label: "Customers", icon: Users },
    { label: "Analytics", icon: LineChart },
    { label: "Settings", icon: Settings }
  ];

  const currentNav = isAccount ? customerNav : adminNav;

  // Decide user details based on active route
  const defaultUser = isAccount
    ? {
        name: "Julianne V.",
        tier: "Premium Member",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjxN5e-VpzuhXSZNgICEqmhN0VtFDgnMo2wP4Zadqz6jlb3PwvIhm-BKEwH_f_-imSLdRhsIpN25FKWsMI1w7iTlDw7ytwrr4bXj9Q2k5CiqubH3nE2H7C9BYNpIQf2clyE_DJSKPfj4mlBvnNWpZtgE5-Bn8dBDK-vr20i2wv7buhe3yUdHFLvBIOot9Y2l4BicMCPIR7yiCLN1t83_dd_LN4_IGklzH6LduPk4RrjyFdUNokK_zd"
      }
    : {
        name: "Admin User",
        tier: "ShopNest Global",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkDDSW7e98b8x9Y1CZmM5LasXLqQ1FRSKNPidhnB9Sqydva9I2zFqF88WecB_BeCLfBnUCrVcvsEHVQ1KbuYLBxAOiUDTfkemSEkOrkHI48B3ydR__AV_acjfXE0_6SPlgEgTilaVjUwlBTwLKLoECUXAdWVg0c_76BHpr1kGuJGB4r73Dy3uUUu95gM1m2xSHh7_Erm12Rg-wZQfuty4jOQLSuImmUtAeuzsU-yX8rAj8Vr6B0sud"
      };

  const displayUser = isAccount ? (auth.user || defaultUser) : defaultUser;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Sidebar - Desktop */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/30 flex flex-col p-md space-y-base z-40 hidden md:flex">
        <div className="mb-lg px-2">
          <Link to="/" className="font-headline-sm text-headline-sm text-primary tracking-tighter block leading-none">
            ShopNest
          </Link>
          <p className="font-label-caps text-[9px] text-on-surface-variant mt-1">
            {isAccount ? "Account Console" : "Admin Console"}
          </p>
        </div>
        
        <nav className="flex-1 space-y-1">
          {currentNav.map((item, index) => {
            const isActive = item.label === activeTab;
            return (
              <a
                key={index}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.label);
                }}
                className={`flex items-center px-4 py-3 rounded-lg transition-all scale-[0.98] active:scale-100 ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <item.icon className="mr-3 text-current" size={18} />
                <span className="font-label-caps text-label-caps">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="pt-base border-t border-outline-variant/30">
          <div className="flex items-center p-2 mb-4">
            <img
              src={displayUser.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuAjxN5e-VpzuhXSZNgICEqmhN0VtFDgnMo2wP4Zadqz6jlb3PwvIhm-BKEwH_f_-imSLdRhsIpN25FKWsMI1w7iTlDw7ytwrr4bXj9Q2k5CiqubH3nE2H7C9BYNpIQf2clyE_DJSKPfj4mlBvnNWpZtgE5-Bn8dBDK-vr20i2wv7buhe3yUdHFLvBIOot9Y2l4BicMCPIR7yiCLN1t83_dd_LN4_IGklzH6LduPk4RrjyFdUNokK_zd"}
              alt={displayUser.name}
              className="w-10 h-10 rounded-full object-cover mr-3 border border-outline-variant"
            />
            <div>
              <p className="font-body-sm text-body-sm font-bold leading-none mb-1 text-ellipsis overflow-hidden max-w-[120px]">{displayUser.name}</p>
              <p className="text-[10px] text-on-surface-variant font-label-caps">{displayUser.tier}</p>
            </div>
          </div>
          <div className="space-y-sm">
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 px-4 border border-primary text-primary rounded-xl font-button text-button hover:bg-primary hover:text-white transition-all"
            >
              View Storefront
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 flex items-center justify-center gap-xs text-error font-button text-button rounded-xl hover:bg-error-container/20 transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-80 bg-surface z-50 shadow-2xl p-lg flex flex-col justify-between transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex justify-between items-center mb-xl">
            <span className="font-headline-sm text-headline-sm text-primary">ShopNest</span>
            <button onClick={() => setSidebarOpen(false)}>
              <X size={24} className="text-primary" />
            </button>
          </div>
          <nav className="flex flex-col space-y-md">
            {currentNav.map((item, index) => {
              const isActive = item.label === activeTab;
              return (
                <a
                  key={index}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(item.label);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-sm font-label-caps text-lg tracking-wider transition-colors ${
                    isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
        <div className="pt-base border-t border-outline-variant/30 space-y-sm">
          <button
            onClick={() => {
              setSidebarOpen(false);
              navigate('/');
            }}
            className="w-full py-2 px-4 bg-primary text-white rounded-xl font-button text-button hover:opacity-90 transition-all"
          >
            View Storefront
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 text-error font-button text-button rounded-xl hover:bg-error-container/20 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Canvas Context */}
      <div className="md:ml-64 min-h-screen flex flex-col justify-between">
        <div>
          {/* Top Navbar */}
          <header className="fixed top-0 right-0 left-0 md:left-64 h-20 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-gutter z-35">
            <div className="flex items-center flex-1 max-w-md">
              <Search className="text-on-surface-variant mr-3" size={20} />
              <input
                type="text"
                placeholder="Search history..."
                className="bg-transparent border-none focus:ring-0 w-full font-body-sm text-body-sm placeholder:text-on-surface-variant/50"
              />
            </div>
            
            <div className="flex items-center space-x-md">
              <button className="relative p-1 hover:opacity-75 transition-opacity" title="Notifications">
                <Bell size={20} className="text-on-surface-variant" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
              </button>
              
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-1 hover:opacity-75 transition-opacity"
                title="Sidebar Open"
              >
                <Menu size={20} className="text-on-surface-variant" />
              </button>
            </div>
          </header>

          {/* Main content viewport */}
          <main className="pt-24 px-gutter pb-xl max-w-container-max mx-auto">
            {/* Quick Navigation link back to front */}
            <div className="fixed bottom-6 right-6 z-50 space-x-2 bg-white/85 dark:bg-black/85 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-outline-variant/30 flex items-center">
              <Link to="/products" className="text-xs font-button text-primary hover:underline">Shop</Link>
              <span className="text-outline-variant/50">|</span>
              <Link to="/cart" className="text-xs font-button text-primary hover:underline">Cart</Link>
              <span className="text-outline-variant/50">|</span>
              {isAccount ? (
                <Link to="/admin" className="text-xs font-button text-secondary hover:underline font-bold">Admin</Link>
              ) : (
                <Link to="/account" className="text-xs font-button text-secondary hover:underline font-bold">My Account</Link>
              )}
            </div>
            <Outlet context={{ activeTab, setActiveTab }} />
          </main>
        </div>

        {/* Footer */}
        <footer className="w-full bg-surface-container border-t border-outline-variant/30 mt-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-lg px-gutter py-xl max-w-container-max mx-auto">
            <div className="md:col-span-1">
              <h4 className="font-headline-sm text-headline-sm text-primary mb-sm leading-none tracking-tight">ShopNest</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Curation over clutter. Architectural clarity for the modern lifestyle.</p>
            </div>
            <div>
              <h5 className="font-label-caps text-label-caps text-primary mb-sm uppercase">Support</h5>
              <ul className="space-y-xs font-body-sm text-body-sm text-on-surface-variant">
                <li><Link to="/products" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-label-caps text-label-caps text-primary mb-sm uppercase">Contact</h5>
              <ul className="space-y-xs font-body-sm text-body-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Store Locator</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Size Guide</a></li>
              </ul>
            </div>
            <div className="flex flex-col justify-between">
              <p className="font-body-sm text-body-sm text-on-surface-variant">© 2024 ShopNest. All rights reserved.</p>
              <div className="flex gap-base mt-sm text-primary">
                <span className="cursor-pointer hover:opacity-70 transition-opacity"><Globe size={18} /></span>
                <span className="cursor-pointer hover:opacity-70 transition-opacity"><Share2 size={18} /></span>
                <span className="cursor-pointer hover:opacity-70 transition-opacity"><Mail size={18} /></span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
