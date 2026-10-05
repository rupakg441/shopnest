import { baseApi } from '../../app/api/baseApi';

export const assistantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendAssistantMessage: builder.mutation({
      query: (message) => ({
        url: '/ai/chat',
        method: 'POST',
        body: { message }
      }),
      transformResponse: (response) => response.data
    })
  })
});

export const { useSendAssistantMessageMutation } = assistantApi;