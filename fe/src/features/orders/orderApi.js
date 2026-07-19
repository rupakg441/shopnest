import { baseApi } from '../../app/api/baseApi';
import { mockUserOrders, mockAdminOrders } from '../../data/mockOrders';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserOrders: builder.query({
      query: () => '/orders',
      transformResponse: (response) => response.data,
      providesTags: ['Order'],
    }),
    getAdminOrders: builder.query({
      query: () => '/admin/orders',
      transformResponse: (response) => response.data,
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Order'],
    }),
    cancelOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/cancel`,
        method: 'PUT',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/admin/orders/${orderId}/status`,
        method: 'PUT',
        body: { status },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetUserOrdersQuery,
  useGetAdminOrdersQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useUpdateOrderStatusMutation
} = orderApi;
