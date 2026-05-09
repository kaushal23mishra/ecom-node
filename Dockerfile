# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (Caching layer)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install Tini (Init process)
RUN apk add --no-cache tini

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app .

# Security: Run as non-root
USER node

EXPOSE 5000

# Use Tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npm", "start"]