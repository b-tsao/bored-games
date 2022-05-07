FROM docker.io/node:12.16.1

USER node
WORKDIR /home/node

COPY package.json .
RUN npm install --only=production

COPY build build

ENTRYPOINT ["npm", "start"]

ENV NODE_ENV production