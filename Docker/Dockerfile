FROM docker.io/node:18.4.0

USER node
WORKDIR /home/node

COPY package.json .
RUN npm install --only=production

COPY log4js.config.json log4js.config.json
COPY .env .env
COPY build build

ENTRYPOINT ["npm", "start"]

ENV NODE_ENV production