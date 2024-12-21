# Stage 1: Build the React application
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine AS production

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ensure locales directory is included
COPY public/locales /usr/share/nginx/html/locales

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
