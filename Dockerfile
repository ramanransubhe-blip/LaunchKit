FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/packages/ ./packages/packages/
COPY packages/api/package.json ./packages/api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/cache/package.json ./packages/cache/
COPY packages/communication/package.json ./packages/communication/
COPY packages/config/package.json ./packages/config/
COPY packages/constants/package.json ./packages/constants/
COPY packages/emails/package.json ./packages/emails/
COPY packages/errors/package.json ./packages/errors/
COPY packages/events/package.json ./packages/events/
COPY packages/feature-flags/package.json ./packages/feature-flags/
COPY packages/logger/package.json ./packages/logger/
COPY packages/middleware/package.json ./packages/middleware/
COPY packages/observability/package.json ./packages/observability/
COPY packages/payments/package.json ./packages/payments/
COPY packages/permissions/package.json ./packages/permissions/
COPY packages/queue/package.json ./packages/queue/
COPY packages/rate-limit/package.json ./packages/rate-limit/
COPY packages/security/package.json ./packages/security/
COPY packages/storage/package.json ./packages/storage/
COPY packages/ui/package.json ./packages/ui/
COPY packages/validation/package.json ./packages/validation/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps ./apps
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1002 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "apps/web/server.js"]
