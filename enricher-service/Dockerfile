FROM node:18-alpine

WORKDIR /app

COPY enricher-service/package*.json ./

RUN npm install

COPY enricher-service/ ./
COPY ../shared/ /app/shared/

CMD ["node", "index.js"]
