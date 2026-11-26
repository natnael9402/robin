FROM node:20-slim AS base
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY ol/package.json ol/package-lock.json ./
# prisma is a devDependency locally, but the runtime container needs the CLI to
# apply migrations on startup. Install it without changing the committed lockfile.
RUN npm ci --omit=dev && \
    PRISMA_VERSION=$(node -p "require('./package-lock.json').packages['node_modules/prisma'].version") && \
    npm install --no-save prisma@${PRISMA_VERSION}

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY ol/dist ./dist
COPY ol/prisma ./prisma
RUN sed -i 's|output.*=.*"../src/generated/prisma"|output = "../dist/generated/prisma"|' prisma/schema.prisma
RUN ./node_modules/.bin/prisma generate
EXPOSE 4000
# Apply the email_logs / signup_site migration on every start. Safe to re-run.
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/index.js"]
