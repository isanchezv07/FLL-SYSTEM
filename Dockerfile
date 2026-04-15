# Stage 1: Build Astro
FROM node:20-alpine AS build
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ alsa-lib-dev

# Set production environment for build optimization
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Prune dev dependencies - we keep dependencies needed for runtime
# Note: In Astro SSR, most deps are bundled, but some peer deps or integrations might be needed
RUN npm prune --production --legacy-peer-deps

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Install runtime dependencies for audio and system utilities
RUN apk add --no-cache alsa-lib sox alsa-utils

# Copy node_modules from build stage
COPY --from=build /app/node_modules ./node_modules
# Copy built assets (Astro SSR output)
COPY --from=build /app/dist ./dist
# Copy backend source
COPY --from=build /app/src/server ./src/server
# Copy public assets (sometimes needed by SSR or backend)
COPY --from=build /app/public ./public
# Copy configuration and startup scripts
COPY --from=build /app/package*.json ./
COPY --from=build /app/start-server.js ./
COPY --from=build /app/astro.config.mjs ./

# Ensure data directory exists with proper permissions
RUN mkdir -p src/server/data && chmod 777 src/server/data

# Expose ports for Astro (4321) and Express (3000)
EXPOSE 4321 3000

ENV NODE_ENV=production
ENV PORT=4321
ENV HOST=0.0.0.0

CMD ["node", "start-server.js"]
