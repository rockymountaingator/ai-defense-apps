FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY server.js ./
COPY services/ ./services/

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "server.js"]
