import { baseApi } from '../../app/api/baseApi';

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => '/categories',
      transformResponse: (response) => response.data,
      providesTags: ['Category'],
    }),
    getAdminCategories: builder.query({
      query: () => '/categories/admin',
      transformResponse: (response) => response.data,
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation({
      query: (body) => ({ url: '/categories', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Category'],
    }),
    disableCategory: builder.mutation({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Category'],
    }),
    uploadCategoryImage: builder.mutation({
      query: (body) => ({ url: '/uploads/categories', method: 'POST', body }),
      transformResponse: (response) => response.data.image,
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDisableCategoryMutation,
  useUploadCategoryImageMutation,
} = categoryApi;
