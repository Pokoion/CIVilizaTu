# Etapa 1: build de la aplicación React
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# La API y los recursos se sirven bajo https://jonolea.eus/civilizatu
ARG REACT_APP_API_URL=https://jonolea.eus/civilizatu
ARG PUBLIC_URL=/civilizatu
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV PUBLIC_URL=$PUBLIC_URL
ENV CI=false

RUN npm run build

# Etapa 2: servidor estático
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
