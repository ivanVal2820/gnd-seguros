FROM node:20-bookworm AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-bookworm AS builder
WORKDIR /app
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3002

CMD ["npm", "run", "start"]