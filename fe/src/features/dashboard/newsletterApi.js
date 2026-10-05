import { baseApi } from '../../app/api/baseApi';

export const newsletterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    subscribeNewsletter: builder.mutation({
      query: (email) => ({ url: '/newsletter', method: 'POST', body: { email } }),
      transformResponse: (response) => response,
    }),
  }),
});

export const { useSubscribeNewsletterMutation } = newsletterApi;
