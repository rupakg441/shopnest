import { baseApi } from '../../app/api/baseApi';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query({
      query: ({ stock = '', search = '' } = {}) => ({ url: '/admin/inventory', params: { stock, search } }),
      transformResponse: (response) => response.data,
      providesTags: ['Inventory'],
    }),
    adjustStock: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/inventory/${id}/adjust`, method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Inventory', 'Product'],
    }),
    getStockHistory: builder.query({
      query: (id) => `/admin/inventory/${id}/history`,
      transformResponse: (response) => response.data,
      providesTags: ['Inventory'],
    }),
  }),
});

export const { useGetInventoryQuery, useAdjustStockMutation, useGetStockHistoryQuery } = inventoryApi;
