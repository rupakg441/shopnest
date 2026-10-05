import { baseApi } from '../../app/api/baseApi';

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query({
      query: (productId) => `/products/${productId}/reviews`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, productId) => [{ type: 'Review', id: productId }],
    }),
    createProductReview: builder.mutation({
      query: ({ productId, ...body }) => ({ url: `/products/${productId}/reviews`, method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: productId },
        { type: 'Product', id: productId },
      ],
    }),
    getAdminReviews: builder.query({
      query: (status = '') => `/admin/reviews${status ? `?status=${encodeURIComponent(status)}` : ''}`,
      transformResponse: (response) => response.data,
      providesTags: ['Review'],
    }),
    moderateReview: builder.mutation({
      query: ({ id, status }) => ({ url: `/admin/reviews/${id}/status`, method: 'PUT', body: { status } }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Review', 'Product'],
    }),
    deleteAdminReview: builder.mutation({
      query: (id) => ({ url: `/admin/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Review', 'Product'],
    }),
  }),
});

export const { useGetProductReviewsQuery, useCreateProductReviewMutation, useGetAdminReviewsQuery, useModerateReviewMutation, useDeleteAdminReviewMutation } = reviewApi;
