import { baseApi } from '../../app/api/baseApi';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicStoreSettings: builder.query({
      query: () => '/content/store-settings',
      transformResponse: (response) => response.data,
    }),
    getStoreSettings: builder.query({
      query: () => '/admin/settings',
      transformResponse: (response) => response.data,
      providesTags: ['Settings'],
    }),
    updateStoreSettings: builder.mutation({
      query: (body) => ({ url: '/admin/settings', method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const { useGetPublicStoreSettingsQuery, useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } = settingsApi;
