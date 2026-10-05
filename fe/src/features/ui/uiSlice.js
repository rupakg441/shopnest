import { createSlice } from '@reduxjs/toolkit';

const loadWishlist = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('shopnest_wishlist') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const saveWishlist = (ids) => {
  try { localStorage.setItem('shopnest_wishlist', JSON.stringify(ids)); } catch { /* storage may be unavailable */ }
};

const initialState = {
  mobileMenuOpen: false,
  wishlist: loadWishlist(),
  searchQuery: "",
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleWishlist: (state, action) => {
      const productId = action.payload;
      const index = state.wishlist.indexOf(productId);
      if (index >= 0) {
        state.wishlist.splice(index, 1);
      } else {
        state.wishlist.push(productId);
      }
      saveWishlist(state.wishlist);
    },
    setWishlist: (state, action) => {
      state.wishlist = action.payload;
      saveWishlist(state.wishlist);
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    }
  }
});

export const { toggleMobileMenu, setMobileMenuOpen, toggleWishlist, setWishlist, setSearchQuery } = uiSlice.actions;
export default uiSlice.reducer;
