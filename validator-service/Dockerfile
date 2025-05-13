FROM node:18-alpine

WORKDIR /app

COPY validator-service/package*.json ./

RUN npm install

COPY validator-service/ ./
COPY shared /app/shared

CMD ["node", "index.js"]
