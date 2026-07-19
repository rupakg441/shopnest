import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useGetDashboardStatsQuery, useGetUsersQuery, useDeleteUserMutation } from '../../features/auth/authApi';
import { useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } from '../../features/products/productApi';
import { useGetAdminOrdersQuery, useUpdateOrderStatusMutation } from '../../features/orders/orderApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Calendar, Download, Plus, Edit, Trash2, Shield, User, X, Check, ShoppingBag, BarChart2 } from 'lucide-react';

const AdminConsole = () => {
  const { activeTab, setActiveTab } = useOutletContext();

  // Queries
  const { data: dashboardData, isLoading: dashLoading, refetch: refetchDash } = useGetDashboardStatsQuery();
  const { data: products, isLoading: productsLoading } = useGetProductsQuery();
  const { data: adminOrders, isLoading: ordersLoading } = useGetAdminOrdersQuery();
  const { data: users, isLoading: usersLoading } = useGetUsersQuery();

  // Mutations
  const [createProduct, { isLoading: creatingProduct }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updatingProduct }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deletingProduct }] = useDeleteProductMutation();
  const [updateOrderStatus, { isLoading: statusUpdating }] = useUpdateOrderStatusMutation();
  const [deleteUser, { isLoading: userDeleting }] = useDeleteUserMutation();

  // Modal State for Products
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductData, setEditingProductData] = useState(null); // null means adding a new product
  const [productForm, setProductForm] = useState({
    title: '',
    brand: 'ShopNest Premium',
    price: '',
    stock: '',
    category: 'Ceramics',
    colors: 'White',
    sizes: 'Standard',
    description: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA01ytaOTYZkD9Lp4Iy7lYC2xQ4s8XVLAJ3vx2QXfwOM744ZdZXf1AMKfDVLfXT8SJnRz61mle9G1wssnnSLPltRPRoocpaeM5U5SkeOU45u7ujaqlAvQEgkGLQApFCFQlz0Bt5LuY6TmDHjS-8lkFvJyrZ376b7R5tl1sscQxf6iVsdDa8fVoJrWk-7v9qeO29JENCrQj1bmBlNMt9CsP6vqcJQn-M5PIvUukf7q7vdJKIzaWtQEs-'
  });

  const handleExport = () => {
    alert("Exporting financial ledger as PDF...");
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus }).unwrap();
      alert(`Order #${orderId} status changed to ${newStatus}.`);
      refetchDash(); // Refresh recent orders in overview
    } catch (err) {
      alert(err.data?.message || "Failed to update order status.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product? This action is permanent.")) {
      try {
        await deleteProduct(productId).unwrap();
        alert("Product deleted successfully.");
      } catch (err) {
        alert(err.data?.message || "Failed to delete product.");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this customer account?")) {
      try {
        await deleteUser(userId).unwrap();
        alert("User deleted successfully.");
      } catch (err) {
        alert(err.data?.message || "Failed to delete user.");
      }
    }
  };

  const openAddProductModal = () => {
    setEditingProductData(null);
    setProductForm({
      title: '',
      brand: 'ShopNest Premium',
      price: '',
      stock: '',
      category: 'Ceramics',
      colors: 'White',
      sizes: 'Standard',
      description: '',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA01ytaOTYZkD9Lp4Iy7lYC2xQ4s8XVLAJ3vx2QXfwOM744ZdZXf1AMKfDVLfXT8SJnRz61mle9G1wssnnSLPltRPRoocpaeM5U5SkeOU45u7ujaqlAvQEgkGLQApFCFQlz0Bt5LuY6TmDHjS-8lkFvJyrZ376b7R5tl1sscQxf6iVsdDa8fVoJrWk-7v9qeO29JENCrQj1bmBlNMt9CsP6vqcJQn-M5PIvUukf7q7vdJKIzaWtQEs-'
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProductData(product);
    setProductForm({
      title: product.title,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      category: product.category,
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
      description: product.description || '',
      image: product.image
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      colors: productForm.colors.split(',').map(s => s.trim()),
      sizes: productForm.sizes.split(',').map(s => s.trim())
    };

    try {
      if (editingProductData) {
        await updateProduct({ id: editingProductData.id || editingProductData._id, ...payload }).unwrap();
        alert("Product listing updated successfully.");
      } else {
        await createProduct(payload).unwrap();
        alert("Product listed successfully.");
      }
      setIsProductModalOpen(false);
    } catch (err) {
      alert(err.data?.message || "Failed to save product details.");
    }
  };

  if (dashLoading || productsLoading || ordersLoading || usersLoading) {
    return <LoadingSpinner />;
  }

  // Stats Card Mapping Data
  const stats = [
    {
      title: "Revenue",
      value: `$${(dashboardData?.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+12.5%",
      isPositive: true,
      sparkline: "M0,25 Q10,15 20,20 T40,10 T60,18 T80,5 T100,12",
      color: "stroke-primary"
    },
    {
      title: "Orders",
      value: (dashboardData?.totalOrders || 0).toString(),
      change: "-2.1%",
      isPositive: false,
      sparkline: "M0,10 Q15,25 30,15 T60,20 T85,10 T100,25",
      color: "stroke-secondary"
    },
    {
      title: "Products",
      value: (dashboardData?.totalProducts || 0).toString(),
      change: "+4.3%",
      isPositive: true,
      sparkline: "M0,20 Q20,5 40,22 T70,8 T100,15",
      color: "stroke-primary"
    },
    {
      title: "Customers",
      value: (dashboardData?.totalUsers || 0).toString(),
      change: "+8.1%",
      isPositive: true,
      sparkline: "M0,25 L10,22 L20,28 L30,15 L40,10 L50,18 L60,5 L70,12 L80,8 L90,15 L100,5",
      color: "stroke-secondary"
    }
  ];

  // --- RENDER SUB-VIEWS ---

  // 1. OVERVIEW VIEW
  const renderOverview = () => (
    <div className="space-y-lg">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-md">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Global Overview</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Real-time performance across all regions.</p>
        </div>
        
        <div className="flex gap-base w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-md py-base border border-outline rounded-lg font-button text-button hover:bg-surface-container transition-colors flex items-center justify-center gap-xs text-primary bg-transparent border-outline-variant">
            <Calendar size={16} />
            Last 30 Days
          </button>
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none px-md py-base bg-primary text-white rounded-lg font-button text-button hover:opacity-90 transition-opacity flex items-center justify-center gap-xs"
          >
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </header>

      {/* Bento Grid Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mt-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-md rounded-xl border border-outline-variant/30 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-base">
              <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider">{stat.title}</span>
              <span className={`font-label-caps text-label-caps flex items-center ${
                stat.isPositive ? 'text-green-600' : 'text-error'
              }`}>
                {stat.change}
              </span>
            </div>
            
            <h3 className="font-headline-sm text-headline-sm text-primary mb-sm font-bold">{stat.value}</h3>
            
            <div className="relative w-full h-[36px] overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  className={`fill-none stroke-2 ${
                    stat.color === 'stroke-primary' ? 'stroke-primary' : 'stroke-secondary'
                  }`}
                  d={stat.sparkline}
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Sales graph */}
      <section className="bg-white p-lg rounded-xl border border-outline-variant/30 shadow-xs mt-4">
        <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-md">Sales Performance Curve</h3>
        <div className="h-80 w-full relative">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
            <defs>
              <linearGradient id="salesGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(0,0,0,0.1)"></stop>
                <stop offset="100%" stopColor="rgba(0,0,0,0)"></stop>
              </linearGradient>
            </defs>
            <path d="M0,250 Q100,150 200,200 T400,100 T600,180 T800,50 T1000,120 L1000,300 L0,300 Z" fill="url(#salesGradient)"></path>
            <path d="M0,250 Q100,150 200,200 T400,100 T600,180 T800,50 T1000,120" fill="none" stroke="#000000" strokeWidth="3" strokeLinejoin="round"></path>
          </svg>
        </div>
      </section>

      {/* Recent Orders table */}
      <div className="bg-white rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden mt-4">
        <div className="p-md border-b border-outline-variant/30">
          <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Recent Checkout Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body-sm">
            <thead>
              <tr className="bg-surface-container-low/40">
                <th className="p-md font-label-caps text-label-caps tracking-wider">Order ID</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider">Customer</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider">Status</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider">Amount</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="p-md font-bold text-primary">{order.id}</td>
                    <td className="p-md text-primary font-medium">{order.customer}</td>
                    <td className="p-md">
                      <span className={`px-2 py-0.5 rounded-full font-label-caps text-[9px] font-bold uppercase tracking-wider ${
                        order.status === 'Delivered' || order.status === 'Shipped' || order.status === 'Confirmed'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-md font-bold text-primary">${order.amount.toFixed(2)}</td>
                    <td className="p-md text-right text-on-surface-variant">{order.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-md text-center text-on-surface-variant/70">No orders logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 2. INVENTORY (PRODUCTS) VIEW
  const renderInventory = () => (
    <div className="space-y-md">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-primary mb-1">Product Inventory</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Manage product listings, details, and stock levels.</p>
        </div>
        <button
          onClick={openAddProductModal}
          className="px-4 py-2 bg-primary text-white text-xs font-button rounded-xl flex items-center gap-xs"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body-sm">
            <thead>
              <tr className="bg-surface-container-low/40">
                <th className="p-md font-label-caps text-label-caps tracking-wider">Item</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider">Category</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider">Price</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider">Stock</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {products?.map((product) => (
                <tr key={product.id || product._id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="p-md flex items-center font-medium text-primary">
                    <img src={product.image} alt={product.title} className="w-10 h-12 object-cover mr-3 rounded border" />
                    <div>
                      <p className="font-bold">{product.title}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase">{product.brand}</p>
                    </div>
                  </td>
                  <td className="p-md text-on-surface-variant">{product.category}</td>
                  <td className="p-md font-bold text-primary">${product.price.toFixed(2)}</td>
                  <td className="p-md">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      product.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="p-md text-right space-x-2">
                    <button
                      onClick={() => openEditProductModal(product)}
                      className="p-1 hover:text-primary transition-colors inline-block"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id || product._id)}
                      className="p-1 hover:text-error transition-colors inline-block"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 3. ADMIN ORDERS VIEW
  const renderOrders = () => (
    <div className="space-y-md">
      <div>
        <h2 className="font-headline-sm text-headline-sm text-primary mb-1">Customer Orders</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Update shipment tracking stages and cancel transactions.</p>
      </div>

      <div className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body-sm">
            <thead>
              <tr className="bg-surface-container-low/40">
                <th className="p-md font-label-caps text-label-caps tracking-wider">Order ID</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider">Customer</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider">Amount</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider">Status</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {adminOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="p-md font-bold text-primary">{order.id}</td>
                  <td className="p-md text-primary font-medium">{order.customer}</td>
                  <td className="p-md font-bold text-primary">${order.amount.toFixed(2)}</td>
                  <td className="p-md">
                    <span className={`px-2 py-0.5 rounded-full font-label-caps text-[9px] font-bold uppercase tracking-wider ${
                      order.status === 'Delivered' || order.status === 'Confirmed' || order.status === 'Shipped'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : order.status === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-md text-right">
                    <select
                      value={order.status.toLowerCase()}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs px-2 py-1 bg-surface-container-low border rounded focus:ring-1 focus:ring-primary"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 4. CUSTOMERS VIEW
  const renderCustomers = () => (
    <div className="space-y-md">
      <div>
        <h2 className="font-headline-sm text-headline-sm text-primary mb-1">Registered Customers</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">View user directory logs and manage authorization permissions.</p>
      </div>

      <div className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body-sm">
            <thead>
              <tr className="bg-surface-container-low/40">
                <th className="p-md font-label-caps text-label-caps tracking-wider">Client Name</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider">Email Address</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider">Role</th>
                <th className="p-md font-label-caps text-label-caps tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {users?.map((user) => (
                <tr key={user.id || user._id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="p-md flex items-center font-medium text-primary">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover mr-3 border" />
                    ) : (
                      <div className="w-8 h-8 bg-surface-container rounded-full mr-3 flex items-center justify-center text-xs font-bold font-headline-sm border text-primary">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    {user.name}
                  </td>
                  <td className="p-md text-on-surface-variant">{user.email}</td>
                  <td className="p-md">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide flex items-center gap-xs w-fit ${
                      user.role === 'admin' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface'
                    }`}>
                      {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-md text-right">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user.id || user._id)}
                        className="p-1 hover:text-error transition-colors inline-block"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Selector routing logic for tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case "Inventory":
        return renderInventory();
      case "Orders":
        return renderOrders();
      case "Customers":
        return renderCustomers();
      case "Analytics":
        return (
          <div className="space-y-base bg-white p-lg rounded-xl border border-outline-variant/30 text-center opacity-70">
            <BarChart2 size={32} className="mx-auto mb-2 text-primary" />
            <p className="font-body-md font-bold">Analytics tracking dashboard is fully synced. Gross margins hold steady at 67.2%.</p>
          </div>
        );
      case "Settings":
        return (
          <div className="space-y-base bg-white p-lg rounded-xl border border-outline-variant/30 text-center opacity-70">
            <Settings size={32} className="mx-auto mb-2 text-primary" />
            <p className="font-body-md font-bold">Administrative global configurations are synchronized.</p>
          </div>
        );
      case "Overview":
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      {renderTabContent()}

      {/* --- ADD/EDIT PRODUCT MODAL DIALOG --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-base">
          <div className="bg-white w-full max-w-lg rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-sm text-lg text-primary font-bold">
                {editingProductData ? "Edit Product Details" : "List New Product"}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)}>
                <X size={20} className="text-on-surface-variant hover:text-primary" />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="p-md space-y-base overflow-y-auto flex-1 font-body-sm">
              <div className="grid grid-cols-2 gap-base">
                <div>
                  <label className="font-label-caps text-[10px] block mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={e => setProductForm({ ...productForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] block mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-base">
                <div>
                  <label className="font-label-caps text-[10px] block mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] block mb-1">Stock Limit</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg text-xs"
                  >
                    <option value="Accessories">Accessories</option>
                    <option value="Ceramics">Ceramics</option>
                    <option value="Decor">Decor</option>
                    <option value="Glassware">Glassware</option>
                    <option value="Furniture">Furniture</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-base">
                <div>
                  <label className="font-label-caps text-[10px] block mb-1">Colors (comma separated)</label>
                  <input
                    type="text"
                    value={productForm.colors}
                    onChange={e => setProductForm({ ...productForm, colors: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg"
                    placeholder="White, Matte Black"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] block mb-1">Sizes (comma separated)</label>
                  <input
                    type="text"
                    value={productForm.sizes}
                    onChange={e => setProductForm({ ...productForm, sizes: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg"
                    placeholder="Standard, Large"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-[10px] block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg"
                  placeholder="Enter minimalist product description details..."
                />
              </div>

              <div>
                <label className="font-label-caps text-[10px] block mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={productForm.image}
                  onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={creatingProduct || updatingProduct}
                className="w-full py-3 bg-primary text-white rounded-xl font-button text-xs hover:opacity-90 transition-opacity"
              >
                {creatingProduct || updatingProduct ? "Saving..." : "Save Product Listing"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;
