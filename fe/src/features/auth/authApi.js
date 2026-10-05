import { baseApi } from '../../app/api/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      }),
      // Automatically store token on success
      transformResponse: (response) => response.data
    }),
    loginAdmin: builder.mutation({
      query: (credentials) => ({
        url: '/auth/admin/login',
        method: 'POST',
        body: credentials
      }),
      transformResponse: (response) => response.data
    }),
    refreshSession: builder.query({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      transformResponse: (response) => response.data
    }),
    logoutUser: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      transformResponse: (response) => response.data
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
      transformResponse: (response) => response.data
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
      transformResponse: (response) => response.data
    }),
    verifyEmail: builder.query({
      query: (token) => ({ url: '/auth/verify-email', method: 'POST', body: { token } }),
      transformResponse: (response) => response.data
    }),
    resendVerification: builder.mutation({
      query: (body) => ({ url: '/auth/resend-verification', method: 'POST', body }),
      transformResponse: (response) => response.data
    }),
    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData
      }),
      transformResponse: (response) => response.data
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/users/me',
        method: 'PUT',
        body: userData
      }),
      transformResponse: (response) => response.data
    }),
    updatePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/users/me/password',
        method: 'PUT',
        body: passwordData
      }),
      transformResponse: (response) => response.data
    }),
    getUsers: builder.query({
      query: () => '/users',
      transformResponse: (response) => response.data.users,
      providesTags: ['User']
    }),
    updateManagedUser: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['User'],
    }),
    getManagedUser: builder.query({
      query: (id) => `/users/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'DELETE'
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['User']
    }),
    getDashboardStats: builder.query({
      query: () => '/admin/dashboard',
      transformResponse: (response) => response.data
    }),
  }),
});

export const {
  useLoginUserMutation,
  useLoginAdminMutation,
  useRefreshSessionQuery,
  useLogoutUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailQuery,
  useResendVerificationMutation,
  useRegisterUserMutation,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useGetUsersQuery,
  useUpdateManagedUserMutation,
  useGetManagedUserQuery,
  useDeleteUserMutation,
  useGetDashboardStatsQuery
} = authApi;
