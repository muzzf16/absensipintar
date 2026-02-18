# Stage 1: Build the React Application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
# Note: VITE_API_BASE_URL will be set via build args or environment variables in docker-compose.
# However, best practice for client-side apps is to use runtime configuration or relative paths if proxied.
# We will assume a relative path for API calls, so the Nginx proxy handles them.
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
