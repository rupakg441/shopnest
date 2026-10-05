import { baseApi } from '../../app/api/baseApi';

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    chatWithAI: builder.mutation({
      query: (body) => ({
        url: '/ai/chat',
        method: 'POST',
        body,
      }),
    }),
    executeToolAction: builder.mutation({
      query: (body) => ({
        url: '/ai/tool-action',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart', 'Order'],
    }),
    getAIRecommendations: builder.query({
      query: (params) => ({
        url: '/ai/recommendations',
        params,
      }),
      providesTags: ['Product'],
    }),
    generateAdminAIContent: builder.mutation({
      query: (body) => ({
        url: '/ai/admin/generate-content',
        method: 'POST',
        body,
      }),
    }),
    getAIAnalytics: builder.query({
      query: () => '/ai/admin/analytics',
    }),
    fetchKnowledgeDocs: builder.query({
      query: (category) => ({
        url: '/ai/admin/knowledge',
        params: category ? { category } : undefined,
      }),
    }),
    saveKnowledgeDoc: builder.mutation({
      query: (body) => ({
        url: '/ai/admin/knowledge',
        method: 'POST',
        body,
      }),
    }),
    deleteKnowledgeDoc: builder.mutation({
      query: (id) => ({
        url: `/ai/admin/knowledge/${id}`,
        method: 'DELETE',
      }),
    }),
    reindexCatalog: builder.mutation({
      query: () => ({
        url: '/ai/admin/reindex-catalog',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useChatWithAIMutation,
  useExecuteToolActionMutation,
  useGetAIRecommendationsQuery,
  useGenerateAdminAIContentMutation,
  useGetAIAnalyticsQuery,
  useFetchKnowledgeDocsQuery,
  useSaveKnowledgeDocMutation,
  useDeleteKnowledgeDocMutation,
  useReindexCatalogMutation,
} = aiApi;
