# syntax=docker/dockerfile:1

# Imagen para Railway (build con Dockerfile).
# Se usa Node 24 porque es la versión con la que se probó la API.
ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-slim

WORKDIR /app

ENV NODE_ENV=production

# Solo dependencias de producción: no se necesitan nodemon ni herramientas de
# desarrollo dentro del contenedor.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Código de la aplicación
COPY . .

# Railway inyecta PORT=8080 en tiempo de ejecución; la app la lee con
# process.env.PORT y escucha en 0.0.0.0. El dominio público del servicio apunta
# a este mismo puerto (8080).
ENV PORT=8080
EXPOSE 8080

# Ejecutar como usuario sin privilegios (la imagen oficial de Node lo incluye).
USER node

# "node" directo en vez de "npm start": npm no reenvía bien SIGTERM y añade un
# proceso extra en el contenedor.
CMD ["node", "src/index.js"]
