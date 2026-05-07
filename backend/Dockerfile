# =============================================================
# Backend Dockerfile
# -------------------------------------------------------------
# This is the ONLY Docker file that matters for production.
# GitHub Actions builds this image, pushes it to Azure Container
# Registry (ACR), and Azure Container Apps pulls + runs it.
# =============================================================

# Stage 1: Install production dependencies only
# Use a named stage so the final image doesn't inherit build tools
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# =============================================================
# Stage 2: Final runtime image
# Starts clean from node:20-alpine — no leftover build cache,
# no devDependencies, smaller attack surface for production.
# =============================================================
FROM node:20-alpine
WORKDIR /app

# Create a non-root user to run the app.
# Running as root inside a container is a security risk —
# if the process is compromised, the attacker gets root.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Switch to non-root user before the process starts
USER appuser

# Azure Container Apps injects PORT as an env var.
# Your server.js should read: const PORT = process.env.PORT || 3000
EXPOSE 3000

# Healthcheck — Azure Container Apps uses this to decide when
# the container is ready to receive traffic, and to restart it
# if it becomes unhealthy. Requires GET /health → 200 in server.js
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Use array form (exec form) — avoids spawning a shell process,
# signals like SIGTERM go directly to node, not a shell wrapper.
CMD ["node", "server.js"]
