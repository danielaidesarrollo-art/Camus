# Optimized for current environment constraints
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# We use preview/dev mode because production build is failing in this environment
EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--port", "8080", "--host", "0.0.0.0"]
