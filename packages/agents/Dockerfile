# CopyZen Agent Server — Multi-stage Docker build
# Story 3.6 — AC-1, AC-2
# Final image: node:20-alpine, ~150MB

# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests
COPY package*.json ./
COPY packages/agents/package*.json ./packages/agents/
COPY packages/core/package*.json ./packages/core/

# Install all deps (including devDeps for build)
RUN npm ci --workspaces --if-present

# Copy source
COPY packages/core/src ./packages/core/src
COPY packages/agents/src ./packages/agents/src
COPY packages/agents/tsconfig*.json ./packages/agents/
COPY tsconfig.json ./

# Build agents package (TypeScript → JS)
RUN npm run build --workspace=packages/agents

# ---- Stage 2: Production ----
FROM node:20-alpine AS production

WORKDIR /app

# Copy only production artifacts
COPY --from=builder /app/packages/agents/dist ./dist
COPY --from=builder /app/packages/agents/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S agents -u 1001
USER agents

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/agents/health || exit 1

CMD ["node", "dist/server.js"]
