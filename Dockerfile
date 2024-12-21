# Stage 1: Build the React application
FROM node:18 AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the source code and build the app
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine AS production
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for the React app
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
