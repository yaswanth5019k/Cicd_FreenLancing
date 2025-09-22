# Multi-stage Dockerfile for Next.js (production)

# 1) Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# 2) Build the app
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Provide safe defaults for build-time to prevent db.js and jwt.js from exiting
ENV MONGO_URL="mongodb://localhost:27017/dummy"
ENV ACCESS_TOKEN="dev-access-token"
ENV REFRESH_TOKEN="dev-refresh-token"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) Run the app
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
EXPOSE 3000

# Copy only the files needed to run
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

CMD ["npm", "start"]


