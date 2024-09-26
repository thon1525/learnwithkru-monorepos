# # Stage 1: Development Stage
# FROM node:21-alpine3.18

# # Set the working directory inside the container
# WORKDIR /app

# # Copy package.json and package-lock.json (or yarn.lock)
# COPY package*.json ./
# COPY tsconfig*.json ./
# COPY tsconfig.build*.json ./
# COPY webpack.config*.js ./
# COPY nest-cli*.json ./
# # Install all dependencies including dev dependencies
# RUN npm install

# # Copy the rest of the project files into the container
# COPY src ./src
# #COPY . .
# # Install global webpack-cli
# RUN npm install -g webpack webpack-cli

# # Set environment variables for development
# ENV NODE_ENV=development
# ENV PORT=3003

# # Expose the application port
# EXPOSE 3003

# # Start the NestJS app with nodemon for hot-reload
# CMD ["npm", "run", "start:dev"]

# # # Stage 2: Build Stage for Production
# # FROM node:21-alpine3.18 AS builder

# # # Set the working directory inside the container
# # WORKDIR /app

# # # Copy package.json and package-lock.json (or yarn.lock)
# # COPY package*.json ./

# # # Install only production dependencies
# # RUN npm install --production

# # # Copy the rest of the project files
# # COPY . .

# # # Build the app for production
# # RUN npm run build

# # # Stage 3: Production Stage
# # FROM node:21-alpine3.18

# # # Set the working directory inside the container
# # WORKDIR /app

# # # Copy production build and node_modules from the builder stage
# # COPY --from=builder /app/dist ./dist
# # COPY --from=builder /app/package*.json ./
# # COPY --from=builder /app/node_modules ./node_modules

# # # Set environment variables for production
# # ENV NODE_ENV=production
# # ENV PORT=3003

# # # Expose the application port
# # EXPOSE 3003

# # # Start the NestJS app in production mode
# # CMD ["npm", "run", "start:prod"]








# # Stage 1: Development Stage
# FROM node:21-alpine3.18 AS development

# # Set the working directory
# WORKDIR /app

# # Copy package files and install dependencies
# COPY package*.json ./
# RUN  npm install -g @nestjs/cli

# # Copy necessary config files
# COPY tsconfig*.json ./
# COPY webpack.config*.js ./
# COPY nest-cli*.json ./

# # Copy source files
# COPY src ./src

# # Install global webpack-cli
# RUN npm install -g webpack webpack-cli

# # Set environment variables for development
# ENV NODE_ENV=development
# ENV PORT=3003

# # Expose port
# EXPOSE 3003

# # Start the NestJS app with nodemon for hot-reload
# CMD ["npm", "run", "start:dev"]



# Stage 1: Development Stage
FROM node:21-alpine3.18 AS development

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy necessary config files
COPY tsconfig*.json ./
COPY webpack.config*.js ./
COPY nest-cli*.json ./

# Copy source files
COPY src ./src

# Install global webpack-cli
RUN npm install -g webpack webpack-cli

# Set environment variables for development
ENV NODE_ENV=development
ENV PORT=3003

# Expose port
EXPOSE 3003

# Start the NestJS app with Webpack for HMR
CMD ["npm", "run", "start:dev"]
