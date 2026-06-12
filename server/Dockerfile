FROM node:22-alpine

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Use PostgreSQL schema for production
COPY prisma/schema.render.prisma prisma/schema.prisma

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start the server with db push
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
