

# # Stage 1: Development Stage
# FROM node:21-alpine3.18 AS development

# # Set the working directory
# WORKDIR /app

# # Copy package files and install dependencies
# COPY package*.json ./
# RUN npm install

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

# # Start the NestJS app with Webpack for HMR
# CMD ["npm", "run", "start:dev"]





# Use official Node.js runtime image as a parent image
FROM node:21-alpine3.18

# Set the working directory inside the container
WORKDIR /app

# Install dependencies only for production
COPY package*.json ./
COPY tsconfig*.json ./
COPY webpack.config*.js ./
COPY nest-cli*.json ./
RUN yarn install

# Install development dependencies (Webpack, etc.)
COPY yarn.lock ./
RUN yarn add webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin

# Copy the rest of the application code
COPY src ./src
# Install nodemon globally
RUN yarn global add @nestjs/cli nodemon


ENV NODE_ENV=development
ENV PORT=3003
# Expose application port
EXPOSE  3003

# Default command to run when container starts
CMD ["npm", "run", "start:dev"]
