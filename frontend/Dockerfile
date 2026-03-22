# ── STAGE 1: BUILD ─────────────────────────────────────────────
# Use Node.js to install dependencies and build the React app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install ALL dependencies including devDependencies (Vite needs them to build)
RUN npm install

# Copy all source code
COPY . .

# Build the React app into static files
# This creates a /app/dist folder with index.html, JS bundles, CSS
RUN npm run build

# ── STAGE 2: SERVE ─────────────────────────────────────────────
# Use tiny Nginx to serve the built static files
# This stage does NOT include Node.js or source code
FROM nginx:alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add our custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy ONLY the built files from Stage 1
# Nothing else from Stage 1 comes over
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
