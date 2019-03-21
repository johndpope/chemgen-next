FROM node:9

RUN npm install -g pm2 nodemon loopback-connector-mysql
ENV NODE_ENV=dev

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app/node_modules

WORKDIR /home/node/app

CMD sleep 120 && npm install && \
   nodemon server/server.js
