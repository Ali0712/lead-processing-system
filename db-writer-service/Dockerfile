FROM node:18-alpine

WORKDIR /app

COPY db-writer-service/package*.json ./

RUN npm install

COPY db-writer-service/ ./
COPY shared /app/shared

CMD ["node", "index.js"]
