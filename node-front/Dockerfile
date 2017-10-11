FROM node:8.4.0-alpine

WORKDIR /app

COPY ./package.json /app/package.json
RUN npm install
COPY ./public /app/public
COPY ./index.js /app/index.js

CMD ["npm", "start"]