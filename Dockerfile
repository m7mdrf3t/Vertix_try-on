# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration (simplified for Cloud Run)
RUN echo 'events { worker_connections 1024; } http { include /etc/nginx/mime.types; server { listen 8080; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } } }' > /etc/nginx/nginx.conf

# Expose port 8080 (Google Cloud Run default)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

