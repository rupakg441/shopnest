import { baseApi } from '../../app/api/baseApi';

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => '/cart',
      transformResponse: (response) => response.data,
      providesTags: ['Cart'],
    }),
    addCartItem: builder.mutation({
      query: (body) => ({ url: '/cart/items', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation({
      query: ({ productId, ...body }) => ({ url: `/cart/items/${encodeURIComponent(productId)}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation({
      query: ({ productId, color = '', size = '' }) => ({
        url: `/cart/items/${encodeURIComponent(productId)}`,
        method: 'DELETE',
        params: { color, size },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({ url: '/cart', method: 'DELETE' }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi;
