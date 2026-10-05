import { createSlice } from '@reduxjs/toolkit';

const TAX_RATE = 0.08;

const loadSavedItems = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('shopnest_cart') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const persist = (items) => {
  try { localStorage.setItem('shopnest_cart', JSON.stringify(items)); } catch { /* storage may be unavailable */ }
};

const calculateTotals = (items, shippingCost = 0) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + tax + shippingCost).toFixed(2));
  return { subtotal, tax, total };
};

const initialItems = loadSavedItems();

const initialState = {
  items: initialItems,
  shippingCost: 0,
  shippingMethod: "Standard",
  promoCode: "",
  promoApplied: false,
  discount: 0,
  ...calculateTotals(initialItems, 0)
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { id, color, size, quantity = 1 } = action.payload;
      const existingItem = state.items.find(
        item => item.id === id && item.color === color && item.size === size
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push(action.payload);
      }
      Object.assign(state, calculateTotals(state.items, state.shippingCost));
      state.promoCode = '';
      state.promoApplied = false;
      state.discount = 0;
      persist(state.items);
    },
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.shippingCost = action.payload.shippingCost || 0;
      state.subtotal = action.payload.subtotal || 0;
      state.tax = action.payload.tax || 0;
      state.total = action.payload.total || 0;
      state.promoCode = '';
      state.promoApplied = false;
      state.discount = 0;
      persist(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, color, size, quantity } = action.payload;
      const item = state.items.find(
        item => item.id === id && item.color === color && item.size === size
      );
      if (item && quantity > 0) {
        item.quantity = quantity;
      }
      Object.assign(state, calculateTotals(state.items, state.shippingCost));
      state.promoCode = '';
      state.promoApplied = false;
      state.discount = 0;
      persist(state.items);
    },
    removeFromCart: (state, action) => {
      const { id, color, size } = action.payload;
      state.items = state.items.filter(
        item => !(item.id === id && item.color === color && item.size === size)
      );
      Object.assign(state, calculateTotals(state.items, state.shippingCost));
      state.promoCode = '';
      state.promoApplied = false;
      state.discount = 0;
      persist(state.items);
    },
    setShippingMethod: (state, action) => {
      const { method, cost } = action.payload;
      state.shippingMethod = method;
      state.shippingCost = cost;
      Object.assign(state, calculateTotals(state.items, state.shippingCost));
      if (state.discount > 0) {
        state.tax = Number(((state.subtotal - state.discount) * TAX_RATE).toFixed(2));
        state.total = Number((state.subtotal - state.discount + state.tax + state.shippingCost).toFixed(2));
      }
    },
    applyCoupon: (state, action) => {
      state.promoCode = action.payload.code;
      state.promoApplied = true;
      state.discount = action.payload.discount;
      state.tax = Number(((state.subtotal - state.discount) * TAX_RATE).toFixed(2));
      state.total = Number((state.subtotal - state.discount + state.tax + state.shippingCost).toFixed(2));
    },
    clearCoupon: (state) => {
      state.promoCode = '';
      state.promoApplied = false;
      state.discount = 0;
      Object.assign(state, calculateTotals(state.items, state.shippingCost));
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
      state.total = 0;
      state.shippingCost = 0;
      state.promoCode = "";
      state.promoApplied = false;
      state.discount = 0;
      persist(state.items);
    }
  }
});

export const { addToCart, setCart, updateQuantity, removeFromCart, setShippingMethod, applyCoupon, clearCoupon, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
