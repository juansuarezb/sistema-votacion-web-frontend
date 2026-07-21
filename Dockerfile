# --- Etapa de Construcción (Build Stage) ---
# Usamos una imagen oficial de Node.js como base.
# 'alpine' es una versión ligera, ideal para CI/CD.
FROM node:20-alpine AS build

# Declara el argumento para que esté disponible en esta etapa de construcción.
ARG VITE_API_URL
ARG VITE_KEYCLOAK_URL

# Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copiamos package.json y package-lock.json para instalar dependencias.
COPY package*.json ./

# Instalamos las dependencias del proyecto.
RUN npm install

# Copiamos el resto del código fuente de la aplicación.
COPY . .

# Construimos la aplicación para producción. Esto creará una carpeta 'dist'.
RUN VITE_API_URL=${VITE_API_URL} VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL} npm run build

# --- Etapa de Producción (Production Stage) ---
# Usamos una imagen de Nginx para servir los archivos estáticos.
FROM nginx:1.25-alpine

# Copiamos los archivos construidos desde la etapa anterior al directorio web de Nginx.
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos el archivo de configuración personalizado de Nginx.
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80, que es el puerto por defecto de Nginx.
EXPOSE 80

# El comando por defecto de la imagen de Nginx ya se encarga de iniciar el servidor.