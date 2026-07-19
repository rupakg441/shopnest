import { createSlice } from '@reduxjs/toolkit';

const initialCartItems = [
  {
    id: "p12",
    title: "Serene Sculptural Vase",
    brand: "ShopNest Design",
    category: "Ceramics",
    price: 185.00,
    quantity: 1,
    color: "Matte Bone",
    size: "Large",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA01ytaOTYZkD9Lp4Iy7lYC2xQ4s8XVLAJ3vx2QXfwOM744ZdZXf1AMKfDVLfXT8SJnRz61mle9G1wssnnSLPltRPRoocpaeM5U5SkeOU45u7ujaqlAvQEgkGLQApFCFQlz0Bt5LuY6TmDHjS-8lkFvJyrZ376b7R5tl1sscQxf6iVsdDa8fVoJrWk-7v9qeO29JENCrQj1bmBlNMt9CsP6vqcJQn-M5PIvUukf7q7vdJKIzaWtQEs-"
  },
  {
    id: "p13",
    title: "Textured Wool Throw",
    brand: "ShopNest Home",
    category: "Decor",
    price: 120.00,
    quantity: 1,
    color: "Charcoal",
    size: "Standard",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC37rlGoYEvqLlNU_xPj96qwrPpAAhmUKFspmHjij5Qet-HYugJK0L3GQ-JeAzzKMlQEFQf55XRmMIS9O0wflajcrNGR_883YYOtrtlm5VFjNYxaJQ1XhN7O_8tf2AEo7oPW9UquI9Y-u7T_TQW3KbQ7eIctLCMkoQ1sAggdLKS_9v3rtZYLM1qpURla-ADLt1ncI13q6balm21xxlZnnrkW7Vv-lxpsV1RAffayAZVfPebnQ8LAr2s"
  }
];

const TAX_RATE = 0.08;

const calculateTotals = (items, shippingCost = 0) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + tax + shippingCost).toFixed(2));
  return { subtotal, tax, total };
};

const initialState = {
  items: initialCartItems,
  shippingCost: 0,
  shippingMethod: "Standard",
  promoCode: "",
  promoApplied: false,
  ...calculateTotals(initialCartItems, 0)
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
    },
    removeFromCart: (state, action) => {
      const { id, color, size } = action.payload;
      state.items = state.items.filter(
        item => !(item.id === id && item.color === color && item.size === size)
      );
      Object.assign(state, calculateTotals(state.items, state.shippingCost));
    },
    setShippingMethod: (state, action) => {
      const { method, cost } = action.payload;
      state.shippingMethod = method;
      state.shippingCost = cost;
      Object.assign(state, calculateTotals(state.items, state.shippingCost));
    },
    applyPromo: (state, action) => {
      const code = action.payload.trim().toUpperCase();
      if (code === "WELCOME10" && !state.promoApplied) {
        state.promoCode = code;
        state.promoApplied = true;
        // apply 10% discount to subtotal
        const discountSubtotal = state.subtotal * 0.9;
        state.tax = Number((discountSubtotal * TAX_RATE).toFixed(2));
        state.total = Number((discountSubtotal + state.tax + state.shippingCost).toFixed(2));
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
      state.total = 0;
      state.shippingCost = 0;
      state.promoCode = "";
      state.promoApplied = false;
    }
  }
});

export const { addToCart, updateQuantity, removeFromCart, setShippingMethod, applyPromo, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
