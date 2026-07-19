import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedCategories: [],
  selectedBrands: [],
  maxPrice: 1200,
  sortBy: "Featured",
  currentPage: 1,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    toggleCategoryFilter: (state, action) => {
      const category = action.payload;
      const index = state.selectedCategories.indexOf(category);
      if (index >= 0) {
        state.selectedCategories.splice(index, 1);
      } else {
        state.selectedCategories.push(category);
      }
      state.currentPage = 1;
    },
    toggleBrandFilter: (state, action) => {
      const brand = action.payload;
      const index = state.selectedBrands.indexOf(brand);
      if (index >= 0) {
        state.selectedBrands.splice(index, 1);
      } else {
        state.selectedBrands.push(brand);
      }
      state.currentPage = 1;
    },
    setMaxPrice: (state, action) => {
      state.maxPrice = action.payload;
      state.currentPage = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    resetFilters: (state) => {
      state.selectedCategories = [];
      state.selectedBrands = [];
      state.maxPrice = 1200;
      state.sortBy = "Featured";
      state.currentPage = 1;
    }
  }
});

export const { toggleCategoryFilter, toggleBrandFilter, setMaxPrice, setSortBy, setCurrentPage, resetFilters } = productSlice.actions;
export default productSlice.reducer;
