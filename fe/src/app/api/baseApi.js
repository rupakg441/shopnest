import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Retrieving URL from env variables (configured in Vite)
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithRefresh = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const requestUrl = typeof args === 'string' ? args : args.url;
  const isAuthRequest = requestUrl?.startsWith('/auth/');

  if (result.error?.status === 401 && !isAuthRequest) {
    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    );
    if (refreshResult.data?.data) {
      api.dispatch({ type: 'auth/login', payload: refreshResult.data.data });
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch({ type: 'auth/logout' });
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['Product', 'Category', 'Order', 'User', 'Review', 'Cart', 'Wishlist', 'Address', 'Inventory', 'Coupon', 'CMS', 'Settings'],
  endpoints: () => ({}), // Injected dynamically in features
});
