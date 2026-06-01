FROM node:20-alpine

WORKDIR /app

COPY business/backend/package.json ./
RUN npm install --production

COPY business/backend/server.js ./
COPY business/backend/services/ ./services/
COPY business/backend/utils/ ./utils/

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "server.js"]
