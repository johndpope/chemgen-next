FROM node:9

RUN npm install -g pm2 nodemon loopback-connector-mysql
ENV NODE_ENV=dev

CMD cd /home/node/app
CMD sleep 60 && \
  ./wait-for-it.sh chemgen_next_dev_mysql_db:3306 -- "source chemgen_docker_vars.sh && nodemon server/server.js"
