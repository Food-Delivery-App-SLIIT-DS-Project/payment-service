# === Build Stage ===
FROM node:22-alpine AS builder

WORKDIR /app

# Use package-lock for deterministic builds
COPY package*.json ./
RUN npm ci

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

COPY . . 
RUN npm run build

# === Production Stage ===
FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy generated Prisma client files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma  
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# App code and config
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# COPY .env .env

# Optional: Clean up cache
RUN npm cache clean --force

EXPOSE 50056

CMD ["npm", "run", "start:prod"]
