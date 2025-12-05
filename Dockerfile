# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build   # or: npm run build:prod etc

# ---- Run stage ----
FROM nginx:alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html
#   ^ if using CRA, it will be /app/build instead of /app/dist

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
