FROM docker.io/node:12.16.1

USER node
WORKDIR /home/node

COPY package.json .
RUN npm install

COPY tmp .
ENTRYPOINT ["node", "server.js"]
