FROM node:9

RUN npm install -g @angular/cli@6.2.2
ENV NODE_ENV=dev

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app/node_modules

WORKDIR /home/node/app

CMD npm install && \
  bash -c "ng build; ng serve  --host=0.0.0.0"

