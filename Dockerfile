# 1. Build Stage
FROM node:18-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .
RUN npx prisma generate
RUN npm run build

# 2. Runtime Stage
FROM node:18-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# important: tell Coolify which port this app uses
EXPOSE 3000

# run migration AFTER container starts
CMD ["npm", "start"]
