# Dockerfile for Strapi v5 Production
FROM node:22-alpine AS builder
COPY . .
ENV NODE_ENV=production
# Build the Strapi admin panel
RUN yarn build

# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
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
