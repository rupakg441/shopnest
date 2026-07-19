import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Retrieving URL from env variables (configured in Vite)
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: () => ({}), // Injected dynamically in features
});
