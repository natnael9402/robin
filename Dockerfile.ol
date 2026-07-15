FROM node:20-slim AS base
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY ol/package.json ol/package-lock.json ./
RUN npm ci --omit=dev

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY ol/dist ./dist
COPY ol/prisma ./prisma
RUN sed -i 's|output.*=.*"../src/generated/prisma"|output = "../dist/generated/prisma"|' prisma/schema.prisma
RUN npx prisma generate
EXPOSE 4000
CMD ["node", "dist/index.js"]
