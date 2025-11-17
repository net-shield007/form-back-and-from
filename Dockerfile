# -----------------------
# 1. Base Builder Image
# -----------------------
FROM node:18-alpine AS builder
WORKDIR /app

# Install required OS packages for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install

# Copy project files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Apply migrations (optional but recommended for prod)
RUN npx prisma migrate deploy

# Build Next.js
RUN npm run build

# -----------------------
# 2. Production Runner
# -----------------------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

# Copy node_modules, .next, public, prisma schema
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]
