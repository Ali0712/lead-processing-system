FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./

RUN npm install

COPY frontend/ ./

EXPOSE 3001

ENV PORT=3001

CMD ["npm", "start"]
