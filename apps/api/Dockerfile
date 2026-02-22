# Multi-stage Docker build for NestJS API
# Optimized for production deployment with security and performance

# Stage 1: Base image with dependencies
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init curl
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

# Stage 2: Dependencies installation
FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client
RUN npm run db:generate

# Stage 3: Build stage
FROM base AS builder
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run db:generate

# Build the application
RUN npm run build

# Stage 4: Production image
FROM base AS runner

# Install production dependencies and Prisma
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy necessary files
COPY --from=builder /app/package*.json ./

# Create directories and set permissions
RUN mkdir -p /app/uploads /app/logs && \
    chown -R nestjs:nestjs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check (uses PORT so compose can override)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD ["sh", "-c", "curl -fsS http://127.0.0.1:${PORT:-3000}/health || exit 1"]

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application (Nest outputs to dist/ or dist/src/ depending on config)
CMD ["sh", "-c", "node dist/src/main.js 2>/dev/null || node dist/main.js"]