# Use the official Node.js runtime as the base image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that the application runs on
EXPOSE 8082

# Set environment variables for Cloud Run
# The PORT environment variable is used by Cloud Run to specify which port your app should listen on
ENV PORT=8082
ENV NODE_ENV=development
ENV JSON_LOGGING=true

# Start the application with npm run dev
CMD ["npm", "run", "dev"]
