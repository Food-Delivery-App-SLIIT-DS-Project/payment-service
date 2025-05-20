# # === Build Stage ===
# FROM node:22-alpine AS builder

# WORKDIR /app

# # Use package-lock for deterministic builds
# COPY package*.json ./
# RUN npm ci

# COPY . . 
# RUN npm run build

# # === Production Stage ===
# FROM node:22-alpine AS prod

# WORKDIR /app

# COPY package*.json ./
# RUN npm install --omit=dev

# # Only copy the built files
# COPY --from=builder /app/dist ./dist
# COPY .env .env

# # Optional: Clean up cache
# RUN npm cache clean --force

# EXPOSE 50056

# CMD ["npm", "run", "start:prod"]


# ---------- development stage ---------------
FROM node:alpine AS development

WORKDIR /usr/src/app 

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build


# ---------- production stage ---------------
FROM node:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY proto ./proto

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/prisma ./prisma 

# Optional: generate Prisma client again just to be safe
RUN npx prisma generate

EXPOSE 50056

CMD ["node", "dist/src/main"]