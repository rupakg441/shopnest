import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useGetDashboardStatsQuery, useGetUsersQuery, useUpdateManagedUserMutation, useGetManagedUserQuery } from '../../features/auth/authApi';
import { useGetAdminProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation, useUploadProductImagesMutation } from '../../features/products/productApi';
import { useGetAdminCategoriesQuery } from '../../features/categories/categoryApi';
import { useGetAdminOrdersQuery, useGetOrderDetailsQuery, useUpdateOrderStatusMutation } from '../../features/orders/orderApi';
import { useLazyDownloadOrdersCsvQuery } from '../../features/dashboard/reportsApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Calendar, Download, Plus, Edit, Trash2, Shield, User, X, Check, ShoppingBag, BarChart2, Sparkles } from 'lucide-react';
import AIGeneratorModal from '../../components/ai/AIGeneratorModal';

const AdminConsole = () => {
  const { activeTab, setActiveTab } = useOutletContext();

  // Queries
  const { data: dashboardData, isLoading: dashLoading, refetch: refetchDash } = useGetDashboardStatsQuery();
  const { data: products, isLoading: productsLoading } = useGetAdminProductsQuery();
  const { data: categories, isLoading: categoriesLoading } = useGetAdminCategoriesQuery();
  const { data: adminOrders, isLoading: ordersLoading } = useGetAdminOrdersQuery();
  const { data: users, isLoading: usersLoading } = useGetUsersQuery();

  // Mutations
  const [createProduct, { isLoading: creatingProduct }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updatingProduct }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deletingProduct }] = useDeleteProductMutation();
  const [uploadProductImages, { isLoading: uploadingImages }] = useUploadProductImagesMutation();
  const [updateOrderStatus, { isLoading: statusUpdating }] = useUpdateOrderStatusMutation();
  const [updateManagedUser] = useUpdateManagedUserMutation();
  const [downloadOrdersCsv, { isFetching: exportingOrders }] = useLazyDownloadOrdersCsvQuery();

  // Modal State for Products
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const { data: customerDetails } = useGetManagedUserQuery(selectedCustomerId, { skip: !selectedCustomerId });
  const [selectedAdminOrderId, setSelectedAdminOrderId] = useState('');
  const { data: selectedAdminOrder } = useGetOrderDetailsQuery(selectedAdminOrderId, { skip: !selectedAdminOrderId });
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [editingProductData, setEditingProductData] = useState(null); // null means adding a new product
  const [imageFiles, setImageFiles] = useState([]);
  const [productForm, setProductForm] = useState({
    title: '',
    brand: 'ShopNest Premium',
    price: '',
    stock: '',
    category: 'Ceramics',
    colors: 'White',
    sizes: 'Standard',
    sku: '',
    discountPrice: '',
    isFeatured: false,
    status: 'active',
    images: [],
    imagePublicIds: [],
    variantsText: '',
    specificationsText: '',
    description: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA01ytaOTYZkD9Lp4Iy7lYC2xQ4s8XVLAJ3vx2QXfwOM744ZdZXf1AMKfDVLfXT8SJnRz61mle9G1wssnnSLPltRPRoocpaeM5U5SkeOU45u7ujaqlAvQEgkGLQApFCFQlz0Bt5LuY6TmDHjS-8lkFvJyrZ376b7R5tl1sscQxf6iVsdDa8fVoJrWk-7v9qeO29JENCrQj1bmBlNMt9CsP6vqcJQn-M5PIvUukf7q7vdJKIzaWtQEs-'
  });

  const handleExport = async () => {
    try {
      const csv = await downloadOrdersCsv().unwrap();
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'shopnest-orders.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.data?.message || 'Could not export the order report.');
    }
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

  const handleCustomerStatusToggle = async (user) => {
    try {
      await updateManagedUser({ id: user._id, isActive: !user.isActive }).unwrap();
    } catch (err) {
      alert(err.data?.message || 'Failed to update customer status.');
    }
  };

  const openAddProductModal = () => {
    setEditingProductData(null);
    setImageFiles([]);
    setProductForm({
      title: '',
      brand: 'ShopNest Premium',
      price: '',
      stock: '',
      category: 'Ceramics',
      colors: 'White',
      sizes: 'Standard',
      sku: '',
      discountPrice: '',
      isFeatured: false,
      status: 'active',
      images: [],
      imagePublicIds: [],
      variantsText: '',
      specificationsText: '',
      description: '',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA01ytaOTYZkD9Lp4Iy7lYC2xQ4s8XVLAJ3vx2QXfwOM744ZdZXf1AMKfDVLfXT8SJnRz61mle9G1wssnnSLPltRPRoocpaeM5U5SkeOU45u7ujaqlAvQEgkGLQApFCFQlz0Bt5LuY6TmDHjS-8lkFvJyrZ376b7R5tl1sscQxf6iVsdDa8fVoJrWk-7v9qeO29JENCrQj1bmBlNMt9CsP6vqcJQn-M5PIvUukf7q7vdJKIzaWtQEs-'
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProductData(product);
    setImageFiles([]);
    setProductForm({
      title: product.title,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      category: product.category,
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
      description: product.description || '',
      image: product.image,
      images: product.images || [product.image],
      imagePublicIds: product.imagePublicIds || [],
      sku: product.sku || '',
      discountPrice: product.discountPrice ?? '',
      isFeatured: Boolean(product.isFeatured),
      status: product.status || 'active',
      variantsText: (product.variants || []).map((variant) => `${variant.color || ''} | ${variant.size || ''} | ${variant.price ?? product.price} | ${variant.stock ?? product.stock} | ${variant.sku || ''}`).join('\n'),
      specificationsText: (product.specifications || []).map((item) => `${item.name}: ${item.value}`).join('\n'),
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    let images = productForm.images || (productForm.image ? [productForm.image] : []);
    let imagePublicIds = productForm.imagePublicIds || [];
    try {
      if (imageFiles.length) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append('images', file));
        const uploaded = await uploadProductImages(formData).unwrap();
        images = [...images, ...uploaded.map((image) => image.url)];
        imagePublicIds = [...imagePublicIds, ...uploaded.map((image) => image.publicId)];
      }
    } catch (err) {
      alert(err.data?.message || 'Image upload failed. Please try again.');
      return;
    }

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      colors: productForm.colors.split(',').map(s => s.trim()),
      sizes: productForm.sizes.split(',').map(s => s.trim()),
      sku: productForm.sku || undefined,
      discountPrice: productForm.discountPrice === '' ? null : Number(productForm.discountPrice),
      isFeatured: Boolean(productForm.isFeatured),
      images,
      imagePublicIds,
      image: images[0] || productForm.image,
      variants: productForm.variantsText.split('\n').map((line) => line.split('|').map((part) => part.trim())).filter((parts) => parts[0] || parts[1]).map((parts) => ({
        color: parts[0] || undefined,
        size: parts[1] || undefined,
        price: Number(parts[2] || productForm.price),
        stock: Number(parts[3] || productForm.stock),
        sku: parts[4] || undefined,
      })),
      specifications: productForm.specificationsText.split('\n').map((line) => line.split(':')).filter((parts) => parts.length > 1 && parts[0].trim() && parts.slice(1).join(':').trim()).map((parts) => ({ name: parts[0].trim(), value: parts.slice(1).join(':').trim() })),
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

  if (dashLoading || productsLoading || categoriesLoading || ordersLoading || usersLoading) {
    return <LoadingSpinner />;
  }

  // Stats Card Mapping Data
  const stats = [
    {
      title: "Revenue",
      value: `$${(dashboardData?.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      detail: 'Collected on paid orders',
    },
    {
      title: "Orders",
      value: (dashboardData?.totalOrders || 0).toString(),
      detail: `${dashboardData?.pendingOrders || 0} pending`,
    },
    {
      title: "Products",
      value: (dashboardData?.totalProducts || 0).toString(),
      detail: `${dashboardData?.lowStockProducts || 0} low stock`,
    },
    {
      title: "Customers",
      value: (dashboardData?.totalUsers || 0).toString(),
      detail: 'Active customer accounts',
    }
  ];

  // --- RENDER SUB-VIEWS ---

  // 1. OVERVIEW VIEW
  const renderOverview = () => (
    <div className="space-y-lg">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-md">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Global Overview</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Current order, catalog, customer, and paid revenue totals.</p>
        </div>
        
        <div className="flex gap-base w-full sm:w-auto">
          <span className="flex-1 sm:flex-none px-md py-base border border-outline rounded-lg font-button text-button flex items-center justify-center gap-xs text-primary bg-transparent border-outline-variant">
            <Calendar size={16} />
            Current snapshot
          </span>
          <button
            onClick={handleExport}
            disabled={exportingOrders}
            className="flex-1 sm:flex-none px-md py-base bg-primary text-white rounded-lg font-button text-button hover:opacity-90 transition-opacity flex items-center justify-center gap-xs"
          >
            <Download size={16} />
            {exportingOrders ? 'Preparing…' : 'Export orders CSV'}
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
            </div>
            
            <h3 className="font-headline-sm text-headline-sm text-primary mb-sm font-bold">{stat.value}</h3>
            
            <p className="text-xs text-on-surface-variant">{stat.detail}</p>
          </div>
        ))}
      </div>

      <section className="bg-white p-lg rounded-xl border border-outline-variant/30 shadow-xs mt-4">
        <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-md">Paid revenue by month</h3>
        <div className="flex h-56 items-end gap-2">{(dashboardData?.monthlySales || []).map((row) => {
          const max = Math.max(1, ...(dashboardData?.monthlySales || []).map((entry) => entry.revenue));
          return <div key={row.period} title={`${row.period}: $${row.revenue.toFixed(2)}`} className="flex h-full min-w-0 flex-1 flex-col justify-end"><div className="w-full rounded-t bg-primary" style={{ height: `${Math.max(2, row.revenue / max * 100)}%` }} /><span className="mt-2 truncate text-center text-[10px] text-on-surface-variant">{row.period.slice(5)}</span></div>;
        })}</div>
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
        <h2 className="font-headline-sm text-headline-sm text-primary mb-1">Customer Orders</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Update shipment tracking stages and cancel transactions.</p>
        </div>
        <div className="flex flex-wrap gap-2"><input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Search order or customer" className="rounded-lg border p-2 text-sm" /><select value={orderStatusFilter} onChange={(event) => setOrderStatusFilter(event.target.value)} className="rounded-lg border text-sm"><option value="">All statuses</option>{['pending','confirmed','processing','shipped','delivered','cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
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
              {adminOrders?.filter((order) => (!orderStatusFilter || order.status.toLowerCase() === orderStatusFilter) && (!orderSearch || `${order.id} ${order.customer}`.toLowerCase().includes(orderSearch.toLowerCase()))).map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="p-md font-bold text-primary"><button onClick={() => setSelectedAdminOrderId(order.id)} className="underline">{order.id}</button></td>
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
                      <option value="pending">Pending</option>
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
      {selectedAdminOrder && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-md" onClick={() => setSelectedAdminOrderId('')}><section className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-lg" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><h3 className="text-xl font-bold text-primary">Order {selectedAdminOrder.orderNumber}</h3><p className="text-sm text-on-surface-variant">{selectedAdminOrder.customer?.name} · {selectedAdminOrder.customer?.email}</p></div><button onClick={() => setSelectedAdminOrderId('')} className="rounded-lg border px-3 py-1">Close</button></div><p className="mt-md text-sm">{selectedAdminOrder.customer?.phone} · {selectedAdminOrder.customer?.address}</p><div className="mt-md divide-y">{selectedAdminOrder.items.map((item, index) => <div key={`${item.product}-${index}`} className="flex justify-between gap-3 py-3 text-sm"><span>{item.title} × {item.quantity}{item.color || item.size ? ` (${[item.color,item.size].filter(Boolean).join(' / ')})` : ''}</span><span>${(item.price * item.quantity).toFixed(2)}</span></div>)}</div><div className="mt-md space-y-1 border-t pt-3 text-right text-sm"><p>Subtotal: ${selectedAdminOrder.subtotal.toFixed(2)}</p><p>Tax: ${selectedAdminOrder.tax.toFixed(2)} · Shipping: ${selectedAdminOrder.shippingCost.toFixed(2)}</p><p>Payment: {selectedAdminOrder.paymentMethod} / {selectedAdminOrder.paymentStatus}</p><p className="font-bold">Total: ${selectedAdminOrder.total.toFixed(2)}</p></div></section></div>}
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
                <th className="p-md font-label-caps text-label-caps tracking-wider">Status</th>
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
                  <td className="p-md"><span className={`rounded-full px-2 py-1 text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.isActive ? 'Active' : 'Blocked'}</span></td>
                  <td className="p-md text-right">
                    <button onClick={() => setSelectedCustomerId(user._id)} className="mr-3 text-xs underline">Details</button>
                    <button onClick={() => handleCustomerStatusToggle(user)} className="mr-3 text-xs underline">{user.isActive ? 'Block' : 'Unblock'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {customerDetails && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-md" onClick={() => setSelectedCustomerId('')}><section className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-lg" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between"><div><h3 className="text-xl font-bold text-primary">{customerDetails.user.name}</h3><p className="text-sm text-on-surface-variant">{customerDetails.user.email}</p></div><button onClick={() => setSelectedCustomerId('')} className="rounded-lg border px-3 py-1">Close</button></div>
        <h4 className="mt-lg font-bold">Saved addresses</h4>{customerDetails.addresses.length ? customerDetails.addresses.map((address) => <p key={address._id} className="mt-2 text-sm">{address.label}: {address.line1}, {address.city}, {address.country}{address.isDefault ? ' (default)' : ''}</p>) : <p className="text-sm text-on-surface-variant">No saved addresses.</p>}
        <h4 className="mt-lg font-bold">Order history</h4>{customerDetails.orders.length ? <div className="mt-2 divide-y">{customerDetails.orders.map((order) => <div key={order.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>#{order.id} · {order.items.map((item) => `${item.title} × ${item.quantity}`).join(', ')}</span><span>{order.status} · ${order.total.toFixed(2)}</span></div>)}</div> : <p className="text-sm text-on-surface-variant">No orders yet.</p>}
      </section></div>}
    </div>
  );

  // Selector routing logic for tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case "Products":
        return renderInventory();
      case "Orders":
        return renderOrders();
      case "Customers":
        return renderCustomers();
      case "Analytics": {
        const months = dashboardData?.monthlySales || [];
        const days = dashboardData?.dailyRevenue || [];
        const monthMax = Math.max(1, ...months.map((row) => row.revenue));
        const dayMax = Math.max(1, ...days.map((row) => row.revenue));
        return <div className="space-y-lg">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-headline-sm text-primary">Sales reports</h2><p className="text-sm text-on-surface-variant">Collected revenue includes paid orders; cancelled and refunded orders are excluded.</p></div><button onClick={handleExport} disabled={exportingOrders} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm text-white"><Download size={16} />{exportingOrders ? 'Preparing…' : 'Export orders CSV'}</button></div>
          <div className="grid gap-lg xl:grid-cols-2">
            <section className="rounded-xl border bg-white p-md"><h3 className="mb-4 font-bold">Monthly revenue</h3><div className="flex h-56 items-end gap-2">{months.map((row) => <div key={row.period} title={`${row.period}: $${row.revenue.toFixed(2)}`} className="flex h-full min-w-0 flex-1 flex-col justify-end"><div className="w-full rounded-t bg-primary" style={{ height: `${Math.max(2, row.revenue / monthMax * 100)}%` }} /><span className="mt-2 truncate text-center text-[10px] text-on-surface-variant">{row.period.slice(5)}</span></div>)}</div></section>
            <section className="rounded-xl border bg-white p-md"><h3 className="mb-4 font-bold">Daily revenue (30 days)</h3><div className="flex h-56 items-end gap-1">{days.map((row) => <div key={row.period} title={`${row.period}: $${row.revenue.toFixed(2)}`} className="flex h-full min-w-0 flex-1 items-end"><div className="w-full rounded-t bg-secondary" style={{ height: `${Math.max(2, row.revenue / dayMax * 100)}%` }} /></div>)}</div><p className="mt-2 flex justify-between text-xs text-on-surface-variant"><span>{days[0]?.period}</span><span>{days.at(-1)?.period}</span></p></section>
            <section className="rounded-xl border bg-white p-md"><h3 className="mb-3 font-bold">Top selling products</h3>{dashboardData?.topProducts?.length ? dashboardData.topProducts.map((product) => <div key={product._id} className="flex justify-between gap-4 border-b py-3 text-sm"><span>{product.title}</span><span>{product.unitsSold} units · ${product.revenue.toFixed(2)}</span></div>) : <p className="text-sm text-on-surface-variant">No sales recorded.</p>}</section>
            <section className="rounded-xl border bg-white p-md"><h3 className="mb-3 font-bold">Order status</h3>{Object.entries(dashboardData?.orderStatusStats || {}).map(([name,count]) => <div key={name} className="flex justify-between border-b py-3 text-sm capitalize"><span>{name}</span><span>{count}</span></div>)}</section>
          </div>
        </div>;
      }
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
              <div className="flex items-center gap-3">
                <h3 className="font-headline-sm text-lg text-primary font-bold">
                  {editingProductData ? "Edit Product Details" : "List New Product"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAIGeneratorOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                >
                  <Sparkles size={14} /> AI Copy
                </button>
              </div>
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
                    {(categories || []).filter((category) => category.isActive !== false).map((category) => (
                      <option key={category._id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-base">
                <div>
                  <label className="font-label-caps text-[10px] block mb-1">SKU</label>
                  <input value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg" />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] block mb-1">Discount Price ($)</label>
                  <input type="number" min="0" max={productForm.price || undefined} value={productForm.discountPrice} onChange={e => setProductForm({ ...productForm, discountPrice: e.target.value })} className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg" />
                </div>
              </div>

              <div className="flex items-center gap-md">
                <label className="flex items-center gap-xs"><input type="checkbox" checked={productForm.isFeatured} onChange={e => setProductForm({ ...productForm, isFeatured: e.target.checked })} />Featured</label>
                <label className="flex items-center gap-xs">Status<select value={productForm.status} onChange={e => setProductForm({ ...productForm, status: e.target.value })} className="rounded-lg border-outline-variant py-1"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
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

              <label className="block"><span className="font-label-caps text-[10px] block mb-1">Variants (color | size | price | stock | SKU, one per line)</span><textarea rows="3" value={productForm.variantsText} onChange={e => setProductForm({ ...productForm, variantsText: e.target.value })} className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg" placeholder="Ivory | Small | 28 | 12 | CUP-IV-S&#10;Charcoal | Large | 32 | 6 | CUP-CH-L" /></label>
              <label className="block"><span className="font-label-caps text-[10px] block mb-1">Specifications (name: value, one per line)</span><textarea rows="3" value={productForm.specificationsText} onChange={e => setProductForm({ ...productForm, specificationsText: e.target.value })} className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg" placeholder="Material: Stoneware&#10;Dimensions: 12 x 8 cm" /></label>

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
                <label className="font-label-caps text-[10px] block mb-1">Upload additional images (up to 8 per request)</label>
                <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={e => setImageFiles(Array.from(e.target.files || []).slice(0, 8))} className="w-full text-xs" />
                <label className="font-label-caps text-[10px] block mt-2 mb-1">Primary image URL (optional when uploading)</label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-lowest border rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={creatingProduct || updatingProduct || uploadingImages}
                className="w-full py-3 bg-primary text-white rounded-xl font-button text-xs hover:opacity-90 transition-opacity"
              >
                {uploadingImages ? "Uploading images..." : creatingProduct || updatingProduct ? "Saving..." : "Save Product Listing"}
              </button>
            </form>
          </div>
        </div>
      )}

      <AIGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        productData={productForm}
        onApply={(generated) => {
          setProductForm((prev) => ({
            ...prev,
            description: generated.detailedDescription || prev.description,
          }));
        }}
      />
    </div>
  );
};

export default AdminConsole;
