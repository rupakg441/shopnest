import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema } from '../../schemas/checkoutSchema';
import { setShippingMethod, clearCart } from '../../features/cart/cartSlice';
import { useCreateOrderMutation } from '../../features/orders/orderApi';
import FormInput from '../../components/forms/FormInput';
import { ShoppingBasket, ArrowLeft, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);
  
  const [createOrder, { isLoading: orderLoading }] = useCreateOrderMutation();

  const defaultUserEmail = auth.user?.email || "";
  const defaultUserName = auth.user?.name ? auth.user.name.split(' ') : ["", ""];

  // Setup form validation resolver with zod
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: defaultUserEmail,
      newsletter: true,
      firstName: defaultUserName[0] || "",
      lastName: defaultUserName[1] || "",
      country: "United States",
      shippingMethod: cart.shippingMethod || "Standard",
    }
  });

  const selectedShipping = watch("shippingMethod");

  const handleShippingChange = (method, cost) => {
    setValue("shippingMethod", method);
    dispatch(setShippingMethod({ method, cost }));
  };

  const onSubmit = async (data) => {
    try {
      const orderPayload = {
        items: cart.items,
        total: cart.total,
        customer: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          address: `${data.address}, ${data.apartment ? data.apartment + ',' : ''} ${data.city}, ${data.country} - ${data.postalCode}`
        }
      };

      await createOrder(orderPayload).unwrap();
      
      // Clear cart
      dispatch(clearCart());
      
      // Navigate to success
      navigate('/order-confirmed');
    } catch (err) {
      console.error("Order creation failed: ", err);
      alert("There was an issue processing your order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Minimal Header */}
      <header className="h-20 bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/30 px-gutter">
        <div className="max-w-container-max mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-xs hover:opacity-80 transition-opacity">
            <ShoppingBasket className="text-primary" size={28} />
            <span className="font-headline-md text-headline-md text-primary tracking-tighter">ShopNest</span>
          </Link>
          <Link
            to="/cart"
            className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs tracking-wider"
          >
            <ArrowLeft size={14} />
            BACK TO SHOP
          </Link>
        </div>
      </header>

      {/* Main Content Checkout form */}
      <main className="max-w-container-max mx-auto px-gutter py-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          
          {/* Left Column: Multi-step checkout details */}
          <div className="lg:col-span-7 space-y-lg">
            {/* Step navigation indicator (Static Visual) */}
            <nav className="flex justify-between border-b border-outline-variant/20 pb-md">
              <div className="flex gap-md">
                <span className="font-label-caps text-label-caps text-primary border-b-2 border-primary pb-base tracking-wider">
                  1. CUSTOMER
                </span>
                <span className="font-label-caps text-label-caps text-primary border-b-2 border-primary pb-base tracking-wider">
                  2. SHIPPING
                </span>
                <span className="font-label-caps text-label-caps text-on-surface-variant/50 pb-base tracking-wider">
                  3. PAYMENT
                </span>
              </div>
            </nav>

            {/* Customer information */}
            <section className="space-y-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-headline-sm text-headline-sm text-primary">Customer Information</h2>
                {!auth.isAuthenticated && (
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Already have an account? <Link to="/login" className="underline font-bold text-primary">Log in</Link>
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-base">
                <FormInput
                  placeholder="Email Address"
                  type="email"
                  error={errors.email}
                  {...register("email")}
                />
                
                <div className="flex items-center gap-xs">
                  <input
                    type="checkbox"
                    id="newsletter"
                    className="rounded border-outline-variant/60 text-primary focus:ring-0 cursor-pointer"
                    {...register("newsletter")}
                  />
                  <label htmlFor="newsletter" className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none">
                    Keep me up to date on news and exclusive offers
                  </label>
                </div>
              </div>
            </section>

            {/* Shipping Address Details */}
            <section className="space-y-md pt-md border-t border-outline-variant/10">
              <h2 className="font-headline-sm text-headline-sm text-primary">Shipping Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <FormInput
                  placeholder="First Name"
                  error={errors.firstName}
                  {...register("firstName")}
                />
                <FormInput
                  placeholder="Last Name"
                  error={errors.lastName}
                  {...register("lastName")}
                />
                <div className="md:col-span-2">
                  <FormInput
                    placeholder="Address"
                    error={errors.address}
                    {...register("address")}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormInput
                    placeholder="Apartment, suite, etc. (optional)"
                    error={errors.apartment}
                    {...register("apartment")}
                  />
                </div>
                <FormInput
                  placeholder="City"
                  error={errors.city}
                  {...register("city")}
                />
                
                <div className="space-y-xs w-full">
                  <select
                    {...register("country")}
                    className="w-full h-12 bg-white border border-outline-variant/60 rounded-lg px-base focus:ring-0 focus:border-primary font-body-sm transition-all"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                  </select>
                  {errors.country && (
                    <span className="text-error font-body-sm text-[12px] block">{errors.country.message}</span>
                  )}
                </div>

                <FormInput
                  placeholder="Postal Code"
                  error={errors.postalCode}
                  {...register("postalCode")}
                />
                <FormInput
                  placeholder="Phone"
                  error={errors.phone}
                  {...register("phone")}
                />
              </div>
            </section>

            {/* Shipping Method Selectors */}
            <section className="space-y-md pt-md border-t border-outline-variant/10">
              <h2 className="font-headline-sm text-headline-sm text-primary">Delivery Method</h2>
              
              <div className="space-y-base">
                <label
                  onClick={() => handleShippingChange("Standard", 0.00)}
                  className={`flex items-center justify-between p-md border rounded-lg cursor-pointer transition-all ${
                    selectedShipping === 'Standard'
                      ? 'border-primary bg-surface-container-low'
                      : 'border-outline-variant/60 hover:border-primary bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-md">
                    <input
                      type="radio"
                      value="Standard"
                      checked={selectedShipping === 'Standard'}
                      readOnly
                      className="text-primary focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <p className="font-body-md text-primary font-bold">Standard Shipping</p>
                      <p className="font-body-sm text-on-surface-variant">3-5 business days</p>
                    </div>
                  </div>
                  <span className="font-body-md text-primary font-bold">$0.00</span>
                </label>
                
                <label
                  onClick={() => handleShippingChange("Express", 15.00)}
                  className={`flex items-center justify-between p-md border rounded-lg cursor-pointer transition-all ${
                    selectedShipping === 'Express'
                      ? 'border-primary bg-surface-container-low'
                      : 'border-outline-variant/60 hover:border-primary bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-md">
                    <input
                      type="radio"
                      value="Express"
                      checked={selectedShipping === 'Express'}
                      readOnly
                      className="text-primary focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <p className="font-body-md text-primary font-bold">Express Shipping</p>
                      <p className="font-body-sm text-on-surface-variant">1-2 business days</p>
                    </div>
                  </div>
                  <span className="font-body-md text-primary font-bold">$15.00</span>
                </label>
              </div>
            </section>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-lg border-t border-outline-variant/10">
              <Link
                to="/cart"
                className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary flex items-center gap-xs group tracking-widest text-[11px] uppercase"
              >
                <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                RETURN TO CART
              </Link>
              
              <button
                type="submit"
                disabled={orderLoading}
                className="bg-primary text-on-primary px-lg py-md rounded-xl font-button text-button hover:opacity-90 transition-opacity flex items-center gap-base uppercase tracking-wider disabled:opacity-50"
              >
                {orderLoading ? "Processing..." : "Place Order"}
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <aside className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-white border border-outline-variant/30 rounded-xl p-md shadow-xs space-y-md">
              <h3 className="font-headline-sm text-headline-sm text-primary pb-base border-b border-outline-variant/20">
                Order Summary
              </h3>
              
              {/* Product thumbnails list */}
              <div className="max-h-80 overflow-y-auto pr-base space-y-md custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-md">
                    <div className="relative w-20 h-24 bg-surface-container rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/10">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-body-md text-primary font-bold leading-tight">{item.title}</h4>
                      <p className="font-body-sm text-on-surface-variant text-[12px]">{item.color} / {item.size}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="font-body-md text-primary font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="space-y-base pt-md border-t border-outline-variant/20">
                <div className="flex justify-between">
                  <span className="font-body-sm text-on-surface-variant">Subtotal</span>
                  <span className="font-body-sm text-primary font-bold">${cart.subtotal.toFixed(2)}</span>
                </div>
                {cart.promoApplied && (
                  <div className="flex justify-between text-green-700">
                    <span className="font-body-sm">Promo Discount (10%)</span>
                    <span className="font-body-sm font-bold">-${(cart.subtotal * 0.1).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-body-sm text-on-surface-variant">Shipping</span>
                  <span className="font-body-sm text-primary font-bold">${cart.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body-sm text-on-surface-variant">Tax</span>
                  <span className="font-body-sm text-primary font-bold">${cart.tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between pt-base border-t border-outline-variant/20">
                  <span className="font-body-lg text-primary font-bold">Total</span>
                  <div className="text-right">
                    <span className="text-xs text-on-surface-variant pr-xs">USD</span>
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">
                      ${cart.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security icons */}
              <div className="pt-md border-t border-outline-variant/10 space-y-md">
                <div className="grid grid-cols-3 gap-base opacity-40 hover:opacity-60 transition-all duration-300">
                  <div className="flex justify-center items-center h-10 border border-outline-variant rounded font-label-caps text-[9px] text-primary font-bold">
                    VISA
                  </div>
                  <div className="flex justify-center items-center h-10 border border-outline-variant rounded font-label-caps text-[9px] text-primary font-bold">
                    MASTERCARD
                  </div>
                  <div className="flex justify-center items-center h-10 border border-outline-variant rounded font-label-caps text-[9px] text-primary font-bold">
                    AMEX
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-xs text-on-surface-variant">
                  <Lock size={12} className="text-primary" />
                  <span className="font-label-caps text-[9px] tracking-wider uppercase">
                    SECURE SSL ENCRYPTED CHECKOUT
                  </span>
                </div>
              </div>

            </div>
          </aside>

        </form>
      </main>

      {/* Simple checkout footer */}
      <footer className="border-t border-outline-variant/30 py-lg px-gutter">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2024 ShopNest. All rights reserved.</p>
          <div className="flex gap-lg">
            <a href="#" className="font-label-caps text-[10px] text-on-surface-variant hover:text-primary tracking-widest uppercase">Refund Policy</a>
            <a href="#" className="font-label-caps text-[10px] text-on-surface-variant hover:text-primary tracking-widest uppercase">Shipping Policy</a>
            <a href="#" className="font-label-caps text-[10px] text-on-surface-variant hover:text-primary tracking-widest uppercase">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
