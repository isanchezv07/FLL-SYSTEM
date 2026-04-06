# Stage 1: Build Astro
FROM node:22-alpine AS build
WORKDIR /app

# Install build dependencies for native modules (like bcryptjs if needed, or other native dependencies)
RUN apk add --no-cache python3 make g++ alsa-lib-dev

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
# Prune dev dependencies to keep the runtime stage small
RUN npm prune --production --legacy-peer-deps

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app

# Install runtime dependencies for audio (needed for node-mic and node-record-lpcm16)
RUN apk add --no-cache alsa-lib sox alsa-utils

# Copy node_modules from build stage
COPY --from=build /app/node_modules ./node_modules
# Copy built assets and source
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/server ./src/server
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/start-server.js ./

# Ensure data directory exists
RUN mkdir -p src/server/data

# Expose ports for Astro (4321) and Express (3000)
EXPOSE 4321 3000

ENV NODE_ENV=production
# Set Astro's port explicitly
ENV PORT=4321
ENV HOST=0.0.0.0

CMD ["node", "start-server.js"]
