# Stage 1: Build Flutter Web
FROM ghcr.io/cirruslabs/flutter:3.24.3 AS build

WORKDIR /app
COPY . .

# Ensure dependencies are fetched and build the web app
RUN flutter pub get
RUN flutter build web --release

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the built web app from the previous stage
COPY --from=build /app/build/web /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
