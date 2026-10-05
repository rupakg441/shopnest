import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { useGetUserOrdersQuery, useCancelOrderMutation } from '../../features/orders/orderApi';
import { useGetProductsQuery } from '../../features/products/productApi';
import { useUpdateProfileMutation, useUpdatePasswordMutation } from '../../features/auth/authApi';
import { updateProfile } from '../../features/auth/authSlice';
import { useCreateAddressMutation, useDeleteAddressMutation, useGetAddressesQuery, useUpdateAddressMutation } from '../../features/addresses/addressApi';
import { useRemoveWishlistItemMutation } from '../../features/wishlist/wishlistApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Award, ShoppingBag, Heart, Trash2, PlusCircle, ArrowRight, User, Key, MapPin, Eye, Settings, FileText } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeTab, setActiveTab } = useOutletContext();

  const auth = useSelector((state) => state.auth);
  const wishlistIds = useSelector((state) => state.ui.wishlist);

  const { data: orders, isLoading: ordersLoading } = useGetUserOrdersQuery();
  const { data: products, isLoading: productsLoading } = useGetProductsQuery();
  const [cancelOrder, { isLoading: cancelLoading }] = useCancelOrderMutation();
  const [updateProfileApi, { isLoading: profileUpdating }] = useUpdateProfileMutation();
  const [updatePasswordApi, { isLoading: passwordUpdating }] = useUpdatePasswordMutation();
  const { data: addresses = [] } = useGetAddressesQuery();
  const [createAddress, { isLoading: addressSaving }] = useCreateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [removeWishlistItem] = useRemoveWishlistItemMutation();

  // Selected order details viewer state
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Addresses forms states
  const [addressForm, setAddressForm] = useState({
    label: 'Home', firstName: auth.user?.firstName || '', lastName: auth.user?.lastName || '',
    phone: auth.user?.phone || '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', isDefault: false,
  });

  // Profile forms states
  const [profileForm, setProfileForm] = useState({
    firstName: auth.user?.firstName || '',
    lastName: auth.user?.lastName || '',
    email: auth.user?.email || ''
  });

  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const displayUserName = auth.user?.name || "User";

  // Find wishlist product items
  const wishlistProducts = products
    ? products.filter((p) => wishlistIds.includes(p.id))
    : [];

  const handleCancelOrder = async (orderId) => {
    if (window.confirm(`Are you sure you want to cancel order #${orderId}?`)) {
      try {
        await cancelOrder(orderId).unwrap();
        alert(`Order #${orderId} has been successfully cancelled.`);
        if (selectedOrderId === orderId) {
          setSelectedOrderId(null);
        }
      } catch (err) {
        alert(err.data?.message || "Failed to cancel order.");
      }
    }
  };

  const handleRemoveWishlist = (e, productId) => {
    e.stopPropagation();
    removeWishlistItem(productId).unwrap().catch((err) => alert(err.data?.message || 'Failed to update wishlist.'));
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...addressForm, isDefault: addresses.length === 0 || addressForm.isDefault };
      if (addressForm.id) await updateAddress({ id: addressForm.id, ...payload }).unwrap();
      else await createAddress(payload).unwrap();
      setAddressForm({ label: 'Home', firstName: auth.user?.firstName || '', lastName: auth.user?.lastName || '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', isDefault: false });
    } catch (err) {
      alert(err.data?.message || "Failed to save address.");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfileApi(profileForm).unwrap();
      dispatch(updateProfile(res));
      alert("Profile details updated successfully.");
    } catch (err) {
      alert(err.data?.message || "Failed to update profile.");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
    try {
      await updatePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }).unwrap();
      alert("Password updated successfully.");
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.data?.message || "Failed to change password.");
    }
  };

  if (ordersLoading || productsLoading) {
    return <LoadingSpinner />;
  }

  // --- RENDER VIEWS ---

  // 1. OVERVIEW VIEW
  const renderOverview = () => (
    <div className="space-y-lg">
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
          <div className="lg:col-span-2 relative overflow-hidden rounded-xl bg-primary p-lg text-white shadow-sm flex flex-col justify-between min-h-[240px]">
            <div className="relative z-10">
              <h2 className="font-headline-md text-headline-md mb-2 text-white">Welcome back, {displayUserName.split(' ')[0]}.</h2>
              <p className="font-body-md text-body-md text-white/70 max-w-md leading-relaxed">
                Your personalized curation of minimalist luxury is waiting. Check recent transactions and settings below.
              </p>
            </div>
            
            <div className="relative z-10 flex space-x-lg mt-base">
              <div>
                <p className="font-label-caps text-label-caps text-white/50 mb-1">Orders</p>
                <p className="font-headline-sm text-headline-sm text-white">{orders?.length || 0}</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-white/50 mb-1">Wishlist</p>
                <p className="font-headline-sm text-headline-sm text-white">{wishlistIds.length}</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-white/50 mb-1">Membership</p>
                <p className="font-headline-sm text-headline-sm text-white">{auth.user?.tier || 'Premium Member'}</p>
              </div>
            </div>
            <div className="absolute -right-16 -bottom-16 w-64 h-64 border-[32px] border-white/5 rounded-full pointer-events-none"></div>
          </div>

          <div className="rounded-xl bg-surface-container-high p-lg flex flex-col justify-center items-center text-center border border-outline-variant/10 shadow-xs">
            <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mb-md">
              <Award className="text-secondary" size={28} />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-1">{auth.user?.tier || 'Premium Member'}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md max-w-xs leading-normal">
              Thank you for being a valued ShopNest client. Enjoy free express shipping offsets.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-lg pt-4">
        {/* Recent Orders List */}
        <div className="xl:col-span-8">
          <div className="flex justify-between items-end mb-md">
            <h3 className="font-headline-sm text-headline-sm text-primary">Recent Orders</h3>
            <span 
              onClick={() => setActiveTab("My Orders")}
              className="font-label-caps text-label-caps text-on-surface-variant/80 hover:text-primary transition-colors tracking-widest text-[11px] uppercase cursor-pointer"
            >
              View All Orders
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                    <th className="px-gutter py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider">Order #</th>
                    <th className="px-gutter py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider">Product</th>
                    <th className="px-gutter py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider">Date</th>
                    <th className="px-gutter py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider">Status</th>
                    <th className="px-gutter py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm">
                  {orders && orders.length > 0 ? (
                    orders.slice(0, 5).map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setActiveTab("My Orders");
                        }}
                        className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer group active:scale-[0.995]"
                      >
                        <td className="px-gutter py-5 font-bold text-primary">{order.id}</td>
                        <td className="px-gutter py-5 flex items-center text-primary font-medium">
                          {order.image && (
                            <div className="w-10 h-12 bg-surface-container mr-3 rounded overflow-hidden flex-shrink-0 border border-outline-variant/10">
                              <img src={order.image} alt={order.productName} className="w-full h-full object-cover" />
                            </div>
                          )}
                          {order.productName}
                        </td>
                        <td className="px-gutter py-5 text-on-surface-variant">{order.date}</td>
                        <td className="px-gutter py-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            order.status === 'Shipped' || order.status === 'Delivered' || order.status === 'Confirmed'
                              ? 'bg-secondary-container text-on-secondary-container'
                              : order.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-surface-container-highest text-on-surface'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-gutter py-5 font-bold text-primary">${order.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-on-surface-variant/60">No orders found. Place your first order today!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Wishlist Preview */}
        <div className="xl:col-span-4">
          <div className="flex justify-between items-end mb-md">
            <h3 className="font-headline-sm text-headline-sm text-primary">Wishlist</h3>
            <span 
              onClick={() => setActiveTab("Wishlist")}
              className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors tracking-widest text-[11px] uppercase cursor-pointer"
            >
              View All
            </span>
          </div>
          
          <div className="space-y-4">
            {wishlistProducts.length === 0 ? (
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 text-center opacity-60">
                <Heart size={24} className="mx-auto mb-2 text-on-surface-variant" />
                <p className="font-body-sm">Your wishlist is empty.</p>
              </div>
            ) : (
              wishlistProducts.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex items-center group cursor-pointer hover:shadow-md transition-all duration-300 relative"
                >
                  <div className="w-20 h-24 bg-surface-container-high rounded overflow-hidden flex-shrink-0 border border-outline-variant/10">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="ml-4 flex-1 pr-8">
                    <h4 className="font-body-md text-body-md font-bold text-primary leading-tight group-hover:underline">{p.title}</h4>
                    <p className="text-on-surface-variant font-label-caps text-[9px] mb-2 tracking-widest mt-1 uppercase">
                      {p.brand.split(' ')[0]}
                    </p>
                    <p className="font-body-sm text-body-sm font-bold text-primary">${p.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={(e) => handleRemoveWishlist(e, p.id)}
                    className="absolute right-4 top-4 text-outline hover:text-error transition-colors p-1"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}

            <div
              onClick={() => navigate('/products')}
              className="border-2 border-dashed border-outline-variant/40 rounded-xl p-8 flex flex-col items-center justify-center text-center opacity-65 hover:opacity-100 hover:border-primary transition-all cursor-pointer bg-transparent"
            >
              <PlusCircle size={24} className="text-on-surface-variant mb-2" />
              <p className="font-label-caps text-label-caps tracking-widest text-[11px] uppercase">Find More Treasures</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. MY ORDERS VIEW
  const renderOrders = () => {
    const selectedOrder = orders?.find(o => o.id === selectedOrderId);

    return (
      <div className="space-y-md">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-primary mb-1">My Orders</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">View order logs and manage delivery packages.</p>
        </div>

        {selectedOrder ? (
          // DETAILED ORDER PANEL VIEW
          <div className="bg-white p-lg rounded-xl border border-outline-variant/30 space-y-lg shadow-sm">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4 flex-wrap gap-2">
              <div>
                <button 
                  onClick={() => setSelectedOrderId(null)}
                  className="text-xs text-primary hover:underline font-bold mb-1 block"
                >
                  ← Back to Orders list
                </button>
                <h3 className="font-headline-sm text-headline-sm text-primary">Order ID: #{selectedOrder.id}</h3>
              </div>
              <div className="flex gap-2">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered' || selectedOrder.status === 'Confirmed'
                    ? 'bg-secondary-container text-on-secondary-container'
                    : selectedOrder.status === 'Cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-surface-container-highest text-on-surface'
                }`}>
                  {selectedOrder.status}
                </span>
                {['pending', 'confirmed', 'processing'].includes(selectedOrder.status.toLowerCase()) && (
                  <button
                    disabled={cancelLoading}
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="px-4 py-1.5 border border-error text-error text-xs rounded-full hover:bg-error/10 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg font-body-sm">
              <div className="space-y-base">
                <h4 className="font-label-caps text-label-caps text-primary border-b border-outline-variant pb-1">Customer & Delivery Info</h4>
                <p><strong>Name:</strong> {auth.user?.name}</p>
                <p><strong>Email:</strong> {auth.user?.email}</p>
                <p><strong>Phone:</strong> {auth.user?.phone || 'N/A'}</p>
                <p><strong>Shipping Address:</strong> {auth.user?.address || 'N/A'}</p>
              </div>
              <div className="space-y-base">
                <h4 className="font-label-caps text-label-caps text-primary border-b border-outline-variant pb-1">Pricing Breakdown</h4>
                <p><strong>Order Subtotal:</strong> ${selectedOrder.total.toFixed(2)}</p>
                <p><strong>Shipping:</strong> Free Standard Shipping</p>
                <p className="border-t border-outline-variant/30 pt-2 font-bold text-base text-primary">
                  Total Paid: ${selectedOrder.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // TABLE LIST VIEW
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                    <th className="px-gutter py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider">Order #</th>
                    <th className="px-gutter py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider">Product</th>
                    <th className="px-gutter py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider">Date</th>
                    <th className="px-gutter py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider">Status</th>
                    <th className="px-gutter py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider">Total</th>
                    <th className="px-gutter py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm">
                  {orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer group active:scale-[0.995]"
                      >
                        <td className="px-gutter py-5 font-bold text-primary">{order.id}</td>
                        <td className="px-gutter py-5 flex items-center text-primary font-medium">
                          {order.image && (
                            <div className="w-10 h-12 bg-surface-container mr-3 rounded overflow-hidden flex-shrink-0 border border-outline-variant/10">
                              <img src={order.image} alt={order.productName} className="w-full h-full object-cover" />
                            </div>
                          )}
                          {order.productName}
                        </td>
                        <td className="px-gutter py-5 text-on-surface-variant">{order.date}</td>
                        <td className="px-gutter py-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            order.status === 'Shipped' || order.status === 'Delivered' || order.status === 'Confirmed'
                              ? 'bg-secondary-container text-on-secondary-container'
                              : order.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-surface-container-highest text-on-surface'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-gutter py-5 font-bold text-primary">${order.total.toFixed(2)}</td>
                        <td className="px-gutter py-5">
                          <button 
                            className="text-xs text-primary underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrderId(order.id);
                            }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-16 text-on-surface-variant/60">
                        <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
                        No orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 3. WISHLIST VIEW
  const renderWishlist = () => (
    <div className="space-y-md">
      <div>
        <h2 className="font-headline-sm text-headline-sm text-primary mb-1">My Wishlist</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Your bookmarked pieces of design curation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-base">
        {wishlistProducts.length === 0 ? (
          <div className="col-span-full bg-surface-container-lowest p-16 rounded-xl border border-outline-variant/30 text-center text-on-surface-variant/65">
            <Heart size={36} className="mx-auto mb-2 text-on-surface-variant opacity-60" />
            <p className="font-body-md">Your wishlist is empty.</p>
            <Link to="/products" className="mt-4 inline-block px-6 py-2 bg-primary text-white text-xs font-button rounded-xl hover:opacity-90">
              Browse Collection
            </Link>
          </div>
        ) : (
          wishlistProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/products/${p.id}`)}
              className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex items-center group cursor-pointer hover:shadow-md transition-all duration-300 relative"
            >
              <div className="w-20 h-24 bg-surface-container-high rounded overflow-hidden flex-shrink-0 border border-outline-variant/10">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="ml-4 flex-1 pr-8">
                <h4 className="font-body-md text-body-md font-bold text-primary leading-tight group-hover:underline">{p.title}</h4>
                <p className="text-on-surface-variant font-label-caps text-[9px] mb-2 tracking-widest mt-1 uppercase">
                  {p.brand.split(' ')[0]}
                </p>
                <p className="font-body-sm text-body-sm font-bold text-primary">${p.price.toFixed(2)}</p>
              </div>
              <button
                onClick={(e) => handleRemoveWishlist(e, p.id)}
                className="absolute right-4 top-4 text-outline hover:text-error transition-colors p-1"
                title="Remove from Wishlist"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // 4. ADDRESSES VIEW
  const renderAddresses = () => (
    <div className="space-y-md">
      <div>
        <h2 className="font-headline-sm text-headline-sm text-primary mb-1">Addresses</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Update default delivery locations for fast checkouts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="space-y-3">
          {addresses.map((address) => <article key={address._id} className="bg-white p-lg rounded-xl border border-outline-variant/30 shadow-xs">
            <div className="flex justify-between items-start gap-3"><h3 className="font-bold text-primary"><MapPin size={16} className="inline mr-2" />{address.label}{address.isDefault ? ' · Default' : ''}</h3>
              <div className="flex gap-3 text-xs"><button onClick={() => setAddressForm({ ...address, id: address._id })} className="underline">Edit</button><button onClick={() => deleteAddress(address._id)} className="text-error underline">Delete</button></div></div>
            <p className="mt-3">{address.firstName} {address.lastName} - {address.phone}</p><p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p><p>{[address.city, address.state, address.postalCode, address.country].filter(Boolean).join(', ')}</p>
            {!address.isDefault && <button className="mt-3 text-xs underline" onClick={() => updateAddress({ id: address._id, isDefault: true })}>Make default</button>}
          </article>)}
          {!addresses.length && <p className="bg-white p-lg rounded-xl border">No saved addresses yet.</p>}
        </div>
        <div className="bg-white p-lg rounded-xl border border-outline-variant/30 shadow-xs">
          <h3 className="font-headline-sm text-base text-primary mb-4 font-bold">{addressForm.id ? 'Edit address' : 'Add an address'}</h3>
          <form onSubmit={handleUpdateAddress} className="grid grid-cols-2 gap-3">
            {[["label","Label"],["firstName","First name"],["lastName","Last name"],["phone","Phone"],["line1","Address line 1"],["line2","Address line 2"],["city","City"],["state","State / region"],["postalCode","Postal code"],["country","Country"]].map(([key,label]) => <input key={key} required={!['line2','state'].includes(key)} placeholder={label} value={addressForm[key] || ''} onChange={(e) => setAddressForm({ ...addressForm, [key]: e.target.value })} className="w-full px-3 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-body-sm" />)}
            <label className="col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(addressForm.isDefault)} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} /> Set as default</label>
            <div className="col-span-2 flex gap-3"><button type="submit" disabled={addressSaving} className="flex-1 py-3 bg-primary text-white rounded-xl font-button text-xs">{addressSaving ? 'Saving…' : 'Save address'}</button>{addressForm.id && <button type="button" onClick={() => setAddressForm({ label:'Home', firstName:auth.user?.firstName || '', lastName:auth.user?.lastName || '', phone:'', line1:'', line2:'', city:'', state:'', postalCode:'', country:'', isDefault:false })} className="px-4 border rounded-xl">Cancel</button>}</div>
          </form>
        </div>
      </div>
    </div>
  );

  // 5. SETTINGS VIEW
  const renderSettings = () => (
    <div className="space-y-md">
      <div>
        <h2 className="font-headline-sm text-headline-sm text-primary mb-1">Account Settings</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Update contact details and edit passwords.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Profile Info Form */}
        <div className="bg-white p-lg rounded-xl border border-outline-variant/30 shadow-xs space-y-md">
          <h3 className="font-headline-sm text-base text-primary flex items-center gap-xs font-bold">
            <User size={18} />
            Personal Details
          </h3>
          <form onSubmit={handleUpdateProfile} className="space-y-base">
            <div className="grid grid-cols-2 gap-base">
              <div>
                <label className="font-label-caps text-[10px] text-on-surface-variant tracking-wider block mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.firstName}
                  onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-body-sm"
                />
              </div>
              <div>
                <label className="font-label-caps text-[10px] text-on-surface-variant tracking-wider block mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.lastName}
                  onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-body-sm"
                />
              </div>
            </div>
            <div>
              <label className="font-label-caps text-[10px] text-on-surface-variant tracking-wider block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-body-sm"
              />
            </div>
            <button
              type="submit"
              disabled={profileUpdating}
              className="w-full py-3 bg-primary text-white rounded-xl font-button text-xs hover:opacity-90 transition-opacity"
            >
              {profileUpdating ? "Saving Details..." : "Update Details"}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-lg rounded-xl border border-outline-variant/30 shadow-xs space-y-md">
          <h3 className="font-headline-sm text-base text-primary flex items-center gap-xs font-bold">
            <Key size={18} />
            Change Password
          </h3>
          <form onSubmit={handleUpdatePassword} className="space-y-base">
            <div>
              <label className="font-label-caps text-[10px] text-on-surface-variant tracking-wider block mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-body-sm"
              />
            </div>
            <div>
              <label className="font-label-caps text-[10px] text-on-surface-variant tracking-wider block mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-body-sm"
              />
            </div>
            <div>
              <label className="font-label-caps text-[10px] text-on-surface-variant tracking-wider block mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-body-sm"
              />
            </div>
            <button
              type="submit"
              disabled={passwordUpdating}
              className="w-full py-3 bg-primary text-white rounded-xl font-button text-xs hover:opacity-90 transition-opacity"
            >
              {passwordUpdating ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // Selector routing logic for tabs
  switch (activeTab) {
    case "My Orders":
      return renderOrders();
    case "Wishlist":
      return renderWishlist();
    case "Addresses":
      return renderAddresses();
    case "Settings":
      return renderSettings();
    case "Overview":
    default:
      return renderOverview();
  }
};

export default Dashboard;
