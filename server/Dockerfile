# Use Node.js 18 with Alpine for smaller image size
FROM node:18-alpine

# Install Sharp dependencies and build tools
RUN apk add --no-cache \
    vips-dev \
    vips \
    python3 \
    make \
    g++ \
    libc6-compat \
    libstdc++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with Sharp support
RUN npm ci --only=production && \
    npm rebuild sharp --platform=linux --arch=x64

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port (Google Cloud Run will set PORT env var)
EXPOSE $PORT

# Start the application
CMD ["node", "server.js"]
