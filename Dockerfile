# Stage 1: Build Astro
FROM node:22-alpine AS build
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

COPY package*.json ./
# Install ALL dependencies (including dev) to build the project
RUN npm install --legacy-peer-deps

COPY . .
# Build the project (Astro, etc.)
RUN npm run build

# Remove development dependencies to keep the runtime small
# We do this here because we have the build tools if any dependency needs them
RUN npm prune --production --legacy-peer-deps

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app

# Install runtime dependencies for audio and other native requirements
RUN apk add --no-cache alsa-lib libc6-compat

# Copy package.json for metadata and potential runtime scripts
COPY package*.json ./

# Copy pre-installed node_modules and built assets from the build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/server ./src/server
COPY --from=build /app/public ./public
COPY --from=build /app/start-server.js ./

# Ensure data directory exists for the backend
RUN mkdir -p src/server/data

EXPOSE 4321 3000

ENV NODE_ENV=production
ENV IS_DOCKER=true

CMD ["node", "start-server.js"]
