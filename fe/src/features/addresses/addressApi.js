import { baseApi } from '../../app/api/baseApi';

export const addressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query({
      query: () => '/addresses',
      transformResponse: (response) => response.data.addresses,
      providesTags: ['Address'],
    }),
    createAddress: builder.mutation({
      query: (body) => ({ url: '/addresses', method: 'POST', body }),
      transformResponse: (response) => response.data.address,
      invalidatesTags: ['Address'],
    }),
    updateAddress: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/addresses/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data.address,
      invalidatesTags: ['Address'],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({ url: `/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Address'],
    }),
  }),
});

export const { useGetAddressesQuery, useCreateAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation } = addressApi;
