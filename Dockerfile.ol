FROM node:20-slim AS base
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY ol/package.json ol/package-lock.json ./
RUN npm ci --omit=dev

FROM base AS builder
COPY ol/package.json ol/package-lock.json ./
RUN npm ci
COPY ol/tsconfig.json ./
COPY ol/src ./src
COPY ol/prisma ./prisma
RUN npx prisma generate
RUN npx tsc

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 4000
CMD ["node", "dist/index.js"]
