FROM node:20-slim

# Install OpenSSL (required for Prisma on Debian if not present)
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including devDependencies for nodemon/prisma if needed, strictly production would use --omit=dev)
# Using regular install to ensure prisma CLI is available for migrations if needed
RUN npm install

# Copy prisma schema specifically for generation
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
