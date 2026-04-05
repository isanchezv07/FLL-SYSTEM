# Stage 1: Build Astro
FROM node:22-alpine AS build
WORKDIR /app

# Install build dependencies for native modules (if any)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app

# Install runtime dependencies for audio if needed (optional but good practice)
RUN apk add --no-cache alsa-lib

COPY package*.json ./
RUN npm install --omit=dev

# Copy necessary files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/server ./src/server
COPY --from=build /app/public ./public
COPY --from=build /app/start-server.js ./

# Ensure data directory exists
RUN mkdir -p src/server/data

EXPOSE 4321 3000

ENV NODE_ENV=production
CMD ["node", "start-server.js"]
