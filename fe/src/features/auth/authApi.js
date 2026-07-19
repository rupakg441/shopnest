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
      transformResponse: (response) => response.data,
      providesTags: ['User']
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
  useRegisterUserMutation,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetDashboardStatsQuery
} = authApi;
