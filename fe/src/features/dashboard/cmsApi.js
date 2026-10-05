import { baseApi } from '../../app/api/baseApi';

export const cmsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicBanners: builder.query({ query: (placement = 'home_hero') => ({ url: '/content/banners', params: { placement } }), transformResponse: (response) => response.data }),
    getPublicPage: builder.query({ query: (slug) => `/content/pages/${encodeURIComponent(slug)}`, transformResponse: (response) => response.data }),
    getAdminBanners: builder.query({ query: () => '/admin/banners', transformResponse: (response) => response.data, providesTags: ['CMS'] }),
    createBanner: builder.mutation({ query: (body) => ({ url: '/admin/banners', method: 'POST', body }), invalidatesTags: ['CMS'] }),
    updateBanner: builder.mutation({ query: ({ id, ...body }) => ({ url: `/admin/banners/${id}`, method: 'PUT', body }), invalidatesTags: ['CMS'] }),
    disableBanner: builder.mutation({ query: (id) => ({ url: `/admin/banners/${id}`, method: 'DELETE' }), invalidatesTags: ['CMS'] }),
    getAdminPages: builder.query({ query: () => '/admin/pages', transformResponse: (response) => response.data, providesTags: ['CMS'] }),
    createPage: builder.mutation({ query: (body) => ({ url: '/admin/pages', method: 'POST', body }), invalidatesTags: ['CMS'] }),
    updatePage: builder.mutation({ query: ({ id, ...body }) => ({ url: `/admin/pages/${id}`, method: 'PUT', body }), invalidatesTags: ['CMS'] }),
    unpublishPage: builder.mutation({ query: (id) => ({ url: `/admin/pages/${id}`, method: 'DELETE' }), invalidatesTags: ['CMS'] }),
  }),
});

export const { useGetPublicBannersQuery, useGetPublicPageQuery, useGetAdminBannersQuery, useCreateBannerMutation, useUpdateBannerMutation, useDisableBannerMutation, useGetAdminPagesQuery, useCreatePageMutation, useUpdatePageMutation, useUnpublishPageMutation } = cmsApi;
