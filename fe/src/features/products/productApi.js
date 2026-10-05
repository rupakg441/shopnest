import { baseApi } from '../../app/api/baseApi';

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: '/products',
        params
      }),
      transformResponse: (response) => response.data.products || response.data,
      providesTags: ['Product'],
    }),
    getCatalogPage: builder.query({
      query: (params) => ({ url: '/products', params }),
      transformResponse: (response) => response.data,
      providesTags: ['Product'],
    }),
    getProductFilters: builder.query({
      query: () => '/products/filters',
      transformResponse: (response) => response.data,
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    getAdminProducts: builder.query({
      query: (params) => ({ url: '/products/admin', params }),
      transformResponse: (response) => response.data.products,
      providesTags: ['Product'],
    }),
    uploadProductImages: builder.mutation({
      query: (body) => ({ url: '/uploads/products', method: 'POST', body }),
      transformResponse: (response) => response.data.images,
    }),
    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/products',
        method: 'POST',
        body: productData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: productData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetCatalogPageQuery,
  useGetProductFiltersQuery,
  useGetProductByIdQuery,
  useGetAdminProductsQuery,
  useUploadProductImagesMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} = productApi;
