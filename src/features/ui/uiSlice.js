import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mobileMenuOpen: false,
  wishlist: ["p11", "p27"], // Sandstone Vase, Monolith Chair pre-saved in mock details
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
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    }
  }
});

export const { toggleMobileMenu, setMobileMenuOpen, toggleWishlist, setSearchQuery } = uiSlice.actions;
export default uiSlice.reducer;
