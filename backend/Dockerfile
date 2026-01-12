# Dockerfile for Strapi v5 Production
FROM node:20-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine for details
# regarding check-compatibility with libc6-compat
# glibc needed for some native modules if required (e.g. sharp)
RUN apk add --no-cache libc6-compat build-base gcc autoconf automake zlib-dev libwing pngquant nasm vips-dev
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/app

# Install dependencies based on specific package manager
COPY package.json yarn.lock ./
RUN yarn config set network-timeout 600000 -g && yarn install --production --frozen-lockfile

# Rebuild sharp or other native modules
# RUN yarn rebuild sharp

# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /opt/app
COPY --from=deps /opt/app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
# Build the Strapi admin panel
RUN yarn build

# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /opt/app
ENV NODE_ENV=production

# Copy built artifacts and modules
COPY --from=builder /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/dist ./dist
COPY --from=builder /opt/app/public ./public
COPY --from=builder /opt/app/package.json ./package.json
COPY --from=builder /opt/app/src ./src
COPY --from=builder /opt/app/config ./config
COPY --from=builder /opt/app/favicon.png ./favicon.png

# Copy other necessary files
# COPY --from=builder /opt/app/database ./database 

EXPOSE 1337
CMD ["yarn", "start"]
