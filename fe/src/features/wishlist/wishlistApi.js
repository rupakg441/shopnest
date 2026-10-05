import { baseApi } from '../../app/api/baseApi';

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query({
      query: () => '/wishlist',
      transformResponse: (response) => response.data,
      providesTags: ['Wishlist'],
    }),
    addWishlistItem: builder.mutation({
      query: (productId) => ({ url: '/wishlist/items', method: 'POST', body: { productId } }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Wishlist'],
    }),
    removeWishlistItem: builder.mutation({
      query: (productId) => ({ url: `/wishlist/items/${encodeURIComponent(productId)}`, method: 'DELETE' }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const { useGetWishlistQuery, useAddWishlistItemMutation, useRemoveWishlistItemMutation } = wishlistApi;
