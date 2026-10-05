import { baseApi } from '../../app/api/baseApi';

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    downloadOrdersCsv: builder.query({
      query: () => ({ url: '/admin/reports/orders.csv', responseHandler: 'text' }),
    }),
  }),
});

export const { useLazyDownloadOrdersCsvQuery } = reportsApi;
