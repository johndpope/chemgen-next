FROM node:9

RUN npm install -g pm2 nodemon loopback-connector-mysql
ENV NODE_ENV=dev

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app/node_modules

WORKDIR /home/node/app

CMD npm install && \
   ./wait-for-it.sh chemgen_next_dev_mysql_db:3306 -- "nodemon server/server.js"

