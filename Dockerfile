# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

# Install serve globally
RUN npm install -g serve

# Copy built files from builder stage
COPY --from=builder /app/build /app/build

# Expose port 8080 for Railway
EXPOSE 8080

# Start the application
CMD ["serve", "-s", "build", "-l", "8080"]
