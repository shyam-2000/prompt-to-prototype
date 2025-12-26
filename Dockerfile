# --- Stage 1: Build the App ---
# Use Node 20 on Alpine Linux (a very small, fast OS)
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to install dependencies (makes builds faster)
COPY package*.json ./
RUN npm ci

# Copy the rest of your app files
COPY . .

# DEFINE the variable so Docker knows to expect it
ARG GEMINI_API_KEY

# WRITE the key into a .env.local file so Vite can see it
# Note: Vite usually requires variables to start with VITE_
RUN echo "VITE_GEMINI_API_KEY=$GEMINI_API_KEY" > .env.local

# Build the app (this creates the 'dist' folder)
RUN npm run build

# --- Stage 2: Serve with Nginx ---
# Switch to Nginx (a popular web server)
FROM nginx:alpine

# Copy the custom config file we will create below
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built app from the previous stage to where Nginx serves files
COPY --from=builder /app/dist /usr/share/nginx/html

# Open port 8080 (Google Cloud Run loves this port)
EXPOSE 8080

# Start Nginx in the foreground so the container stays running
CMD ["nginx", "-g", "daemon off;"]