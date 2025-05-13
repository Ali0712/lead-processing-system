FROM node:18-alpine

WORKDIR /app

COPY api-gateway/package*.json ./

RUN npm install

COPY api-gateway/ ./
COPY shared /app/shared

EXPOSE 3000

CMD ["node", "server.js"]
