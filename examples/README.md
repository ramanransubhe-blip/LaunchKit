# DevLaunchKit Examples

Production-ready example projects demonstrating real-world integrations with DevLaunchKit packages. Each example is a standalone application with its own README, configuration, and source code.

## Examples

| Example | Description | Key Packages |
|---|---|---|
| [**AI SaaS**](./ai-saas/) | AI chat & image generation platform | `ai`, `auth`, `payments`, `storage`, `rate-limit` |
| [**CRM**](./crm/) | Customer relationship manager | `database`, `auth`, `search`, `api`, `permissions`, `emails` |
| [**Subscription SaaS**](./subscription-saas/) | Subscription billing & management | `payments`, `auth`, `communication`, `feature-flags`, `storage` |
| [**Internal Dashboard**](./internal-dashboard/) | Operations metrics & monitoring | `database`, `cache`, `queue`, `analytics`, `observability`, `logger` |
| [**Marketplace**](./marketplace/) | Multi-vendor marketplace | `payments`, `auth`, `storage`, `search`, `feature-flags`, `notifications` |
| [**Developer Tool**](./developer-tool/) | API gateway & developer console | `rate-limit`, `api`, `queue`, `auth`, `cache`, `logger` |
| [**Knowledge Base**](./knowledge-base/) | AI-powered semantic search platform | `ai`, `search`, `database`, `storage`, `auth`, `cache` |

## Getting Started

Each example is self-contained. To run any example:

```bash
# Navigate to the example directory
cd examples/<example-name>

# Install dependencies
pnpm install

# Copy and configure environment variables
cp ../../.env.example .env

# Start the development server
pnpm dev
```

Refer to each example's README for specific environment variables, database setup, and deployment instructions.

## Architecture Patterns

These examples showcase common SaaS architecture patterns:

- **Authentication** — Better Auth (JWT sessions) and Clerk (managed auth)
- **Payments** — Stripe and Dodo Payments with webhook processing
- **Background Jobs** — Queue workers for aggregation, indexing, and webhook delivery
- **Caching** — Redis cache-aside pattern for API response and search caching
- **Rate Limiting** — Tiered API rate limiting with standard headers
- **Vector Search** — pgvector-powered semantic search with OpenAI embeddings
- **AI Integration** — LLM completions (OpenAI/Anthropic/Gemini) and document summarization
- **Observability** — Structured logging, health checks, and metrics collection
