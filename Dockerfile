# --- Stage 1: The Builder ---
# We use Node 20 (Alpine version is smaller/faster) to build the app
FROM node:20-alpine as builder

# Set the working folder inside the container
WORKDIR /app

# Copy package files first to install dependencies (makes re-building faster)
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of your website code
COPY . .

# --- The API Key Step ---
# We tell Docker to expect an argument called GEMINI_API_KEY
ARG GEMINI_API_KEY

# We write that key into a .env.local file. 
# Note: We add "VITE_" because Vite only reads variables starting with VITE_
RUN echo "VITE_GEMINI_API_KEY=$GEMINI_API_KEY" > .env.local

# Build the app (creates the 'dist' folder)
RUN npm run build

# --- Stage 2: The Server ---
# Now we switch to Nginx (a super fast web server) to serve the files
FROM nginx:alpine

# Copy the built files from Stage 1 into the Nginx folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom configuration file (see below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Tell Google Cloud we are using port 8080
EXPOSE 8080

# Start Nginx in the foreground so the container stays running
CMD ["nginx", "-g", "daemon off;"]
