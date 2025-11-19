# Dockerfile (production multi-stage)

# 1) Builder stage
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# system deps
RUN apk add --no-cache openssl

# copy package manifest first (for caching)
COPY package*.json ./

# install deps but skip lifecycle scripts that might call migrate
RUN npm ci --ignore-scripts

# copy app sources
COPY . .

# generate prisma client (needs schema present)
# FIX for Prisma engine checksum issue
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN npx prisma generate

# disable next eslint during build
ENV NEXT_DISABLE_ESLINT=1

# build production artifacts
RUN npm run build

# 2) Runner stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# runtime deps
RUN apk add --no-cache openssl bash curl

# copy only what runtime needs
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib ./lib

# copy entrypoint
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

# start using entrypoint (runs migrations then start)
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "start"]
