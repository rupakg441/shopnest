import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import productsReducer from '../features/products/productSlice';
import uiReducer from '../features/ui/uiSlice';
import aiReducer from '../features/ai/aiSlice';

export const  store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    ui: uiReducer,
    ai: aiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});
