FROM node:18-alpine

WORKDIR /app

COPY cleaner-service/package*.json ./

RUN npm install

COPY cleaner-service/ ./
COPY shared /app/shared

CMD ["node", "index.js"]
