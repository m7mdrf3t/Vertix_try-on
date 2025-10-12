# Use Node.js 18 with Alpine for smaller image size
FROM node:18-alpine

# Install Sharp dependencies
RUN apk add --no-cache \
    vips-dev \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
