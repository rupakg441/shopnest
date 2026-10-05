import { baseApi } from '../../app/api/baseApi';

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    validateCoupon: builder.mutation({
      query: (code) => ({ url: '/coupons/validate', method: 'POST', body: { code } }),
      transformResponse: (response) => response.data,
    }),
    getAdminCoupons: builder.query({
      query: () => '/admin/coupons',
      transformResponse: (response) => response.data,
      providesTags: ['Coupon'],
    }),
    createCoupon: builder.mutation({
      query: (body) => ({ url: '/admin/coupons', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Coupon'],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/coupons/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Coupon'],
    }),
    disableCoupon: builder.mutation({
      query: (id) => ({ url: `/admin/coupons/${id}`, method: 'DELETE' }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Coupon'],
    }),
  }),
});

export const { useValidateCouponMutation, useGetAdminCouponsQuery, useCreateCouponMutation, useUpdateCouponMutation, useDisableCouponMutation } = couponApi;
