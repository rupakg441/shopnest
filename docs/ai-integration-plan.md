# ShopNest AI integration audit and plan

## Current architecture

- `fe/` is a Vite, React, and Redux Toolkit application written in JSX. `AppRoutes.jsx` owns routes, `MainLayout.jsx` owns the storefront shell, and feature API files inject endpoints into the shared RTK Query base API.
- `be/` is an ES module Express application. `server.js` connects to MongoDB before listening; `app.js` mounts route groups and centralized error handling. Controllers use Mongoose models, Zod validators, and shared response helpers.
- MongoDB/Mongoose is the source of truth. Product catalog filters and pagination are implemented in `productController.js`; product edits are admin-only. Auth is JWT bearer based, with user authorization in `protect` and admin authorization in `adminOnly`.
- The project is JavaScript/JSX today. `docs/architecture.md` and the package manifests confirm TypeScript migration has not happened.

## Existing reusable modules

| Capability | Existing implementation |
| --- | --- |
| Products and keyword filtering | `Product`, `Category`, `GET /api/products`, `productController.js` |
| Accounts and authorization | `User`, `protect`, `adminOnly`, existing auth routes |
| Cart and validation | `Cart`, authenticated cart endpoints, server-side stock/variant checks |
| Orders | `Order`, customer-scoped order list/detail/cancel routes, admin order operations |
| Wishlist and reviews | `Wishlist`, `Review`, moderated public reviews |
| Published store knowledge | `Page`/CMS admin endpoints; published pages are available through `/api/content/pages/:slug` |
| AI entry point | Authenticated `POST /api/ai/chat`, `aiController.js` |
| AI UI and API client | `ShopNestAssistant.jsx`, `assistantApi.js`, included by the storefront layout |
| LLM providers | `@langchain/core`, `@langchain/openai`, `@langchain/google-genai`; env flags and fallback path already exist |
| AI workflow/tool beginnings | `agentOrchestrator.js`, `mcpTools.js`, `knowledgeBase.js` |

## Findings that shape the integration

- The current assistant is not LangGraph based. It selects a handler with regular expressions and invokes one LangChain chat model.
- Product search remains keyword regex matching in `mcpTools.js`; it now escapes user input and enforces the same active product/category visibility as the storefront. Structured filters and semantic retrieval remain future work.
- The former hard-coded shipping and returns claims have been removed from AI retrieval. Knowledge lookup now searches published CMS pages only; if no page supports a policy answer, the assistant directs the customer to support. Storefront policy copy still needs a separate consistency review.
- The current orchestrator supplies the authenticated user's ID for order lookup. The MCP server factory now requires trusted authenticated context and exposes no user ID argument in the model-facing order tool.
- The chat request accepts one message and the UI keeps history only in component state. There is no persistent conversation/memory model or streaming transport.
- There is no vector database, embedding index, admin AI generation endpoint, AI admin dashboard, or evaluation/observability integration yet.
- Repository status already contains extensive uncommitted and untracked application work. Those existing changes were left intact; review `git status` before any broad refactor.

## Proposed AI integration architecture

Keep the current Express/MongoDB business services authoritative. Add a backend-only `src/ai` layer with provider/config services, retrievers, vector-store adapter, LangGraph workflow, narrowly scoped tools, prompts, conversation storage, and evaluation/telemetry. The graph can call existing catalog/order/cart services through typed and validated adapters. The LLM never receives MongoDB access or credentials. Admin-only generation and indexing routes use existing `protect` + `adminOnly` middleware. AI failures return a controlled fallback/error from the AI endpoint and do not affect normal commerce routes.

Use the existing `Page` CMS records as the initial knowledge source; add an admin knowledge-base model only for content that does not belong in CMS pages. Use existing Product IDs as vector metadata and fetch displayable product records from MongoDB after retrieval. Keep semantic retrieval behind a `VectorStoreService` interface so provider changes do not touch agent or catalog code.

Introduce TypeScript for new AI modules incrementally with an explicit backend runtime/build configuration. Do not convert the working JSX/Express application wholesale as part of the AI integration.

## Files to create

### First implementation increments

- `be/src/ai/services/llmService.js` - provider selection abstraction (created in the first small step; preserve JavaScript until backend TypeScript loading/build support is configured).
- `be/src/ai/graphs/shoppingGraph.ts` — LangGraph workflow after TS runtime and graph dependencies are installed.
- `be/src/ai/tools/*.ts` — validated catalog, current-user order, and later cart action adapters.
- `be/src/ai/embeddings/embeddingService.ts`, `be/src/ai/vector/vectorStoreService.ts`, and a provider adapter under `be/src/ai/vector/`.
- `be/src/ai/rag/knowledgeService.ts` and `be/src/ai/rag/indexingService.ts`.
- `be/src/ai/models/Conversation.js` (or `.ts` once configured) for bounded, user-scoped conversation history.
- `be/src/ai/prompts/`, `be/src/ai/evaluators/`, `be/src/ai/config/` as their features are implemented.
- Admin AI routes/controllers and knowledge-indexing/generation endpoints; frontend admin AI panels and assistant product result presentation as later increments.

### Existing files to modify incrementally

- `be/package.json`, `be/package-lock.json`, and backend scripts/config for LangGraph, vector storage, LangSmith, and TypeScript runtime/build support.
- `be/.env.example` for optional embedding/vector/LangSmith configuration (never commit secrets).
- `be/app.js`, `be/src/routes/aiRoutes.js`, `be/src/controllers/aiController.js` to mount new AI capabilities and keep auth/rate limits/validation at the boundary.
- `be/src/ai/agentOrchestrator.js`, `be/src/ai/mcpTools.js`, `be/src/ai/knowledgeBase.js` to evolve the current prototype while preserving endpoint compatibility.
- Product create/update/disable flows in `productController.js` to enqueue safe index refresh/delete work after persistence.
- `fe/src/components/assistant/ShopNestAssistant.jsx`, `fe/src/features/assistant/assistantApi.js`, `fe/src/routes/AppRoutes.jsx` only for later UI, streaming, and dedicated assistant route work.
- Existing admin screens/routes only when the specific admin capability is implemented.

## Dependencies

Already installed: `@langchain/core`, `@langchain/openai`, `@langchain/google-genai`, `@modelcontextprotocol/sdk`, `zod`.

Add in staged increments:

- `@langchain/langgraph` for graph state, nodes, conditional routing, and tool workflows.
- `@qdrant/js-client-rest` for the Qdrant JavaScript/TypeScript client; implement the thin adapter locally instead of coupling agent logic to provider APIs.
- `langsmith` for tracing/evaluation integration. Keep tracing disabled when credentials are absent.
- `typescript`, `tsx`, and `@types/node` for incremental TypeScript modules and backend execution/build setup. No frontend TypeScript conversion is required for backend AI work.

Install exact compatible versions in the implementation step after checking the package manager and provider integration requirements; do not add dependencies for phases that have not started.

## Implementation sequence

1. Audit and architecture plan (this document), plus isolate LLM provider selection (first small code change completed).
2. Add backend TypeScript execution/build configuration and AI config/provider interfaces. The registry install stalled; offline installation also failed because the npm cache lacks complete metadata, so this dependency step remains pending.
3. Correct grounding/security in existing search and knowledge adapters; use only visible catalog records and published/admin-approved knowledge (initial implementation completed using published CMS pages and storefront-visible products; vector retrieval remains future work).
4. Add embedding provider abstraction, Qdrant adapter, and an admin-triggered/backfillable product indexing job; re-index on product changes.
5. Add hybrid semantic search endpoint and assistant product cards while retaining `/products` behavior.
6. Upgrade CMS-backed lexical retrieval to vector RAG with citations and no-answer behavior when policy sources are missing.
7. Add LangGraph routing and validated, user-scoped read tools; add confirmation gates before any mutation.
8. Add conversation memory, recommendations, and admin copy generation with review-before-save.
9. Add LangSmith tracing, evaluation coverage, rate limits, prompt-injection controls, and AI analytics.

Each increment should preserve existing REST contracts and keep AI optional. Run focused checks after an implementation increment; AI outages must not gate storefront, cart, checkout, or authentication.
