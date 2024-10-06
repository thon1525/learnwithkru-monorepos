# Use an official Node.js runtime as the base image
FROM node:21-alpine3.18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json if available
COPY package.json ./

# Copy other necessary configuration files
COPY tsconfig.json ./
COPY private_key.pem ./

# Copy the source code to the container
COPY src ./src

# Install dependencies and globally install nodemon
RUN npm install && npm install -g nodemon

# Expose the application port
EXPOSE 3001

# Define the command to run your application in development mode
CMD ["npm", "run", "start:dev"]
