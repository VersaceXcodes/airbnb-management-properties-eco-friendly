# Stage 1: Build the Vite React frontend
FROM node:18 AS frontend-build
WORKDIR /app/vitereact
# Copy package files and install dependencies with --legacy-peer-deps
COPY vitereact/package.json  ./
RUN npm install --legacy-peer-deps
RUN npm install --save-dev eslint-plugin-import eslint-plugin-react @typescript-eslint/parser @typescript-eslint/eslint-plugin
RUN npm install --save-dev eslint-import-resolver-typescript
# Copy the rest of the frontend files and build
COPY vitereact ./
# Clear any existing build artifacts to force fresh build
RUN rm -rf dist/ public/ build/
RUN npm run build

# Stage 2: Serve the frontend with a lightweight server
FROM nginx:alpine
# Copy the built frontend from the build stage
COPY --from=frontend-build /app/vitereact/dist /usr/share/nginx/html
# Copy nginx configuration if needed
# COPY nginx.conf /etc/nginx/nginx.conf
# Expose port 80
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]