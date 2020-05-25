#!/bin/bash

cd .. && \
npm run prestart && \
mkdir -p tmp/src && \
cp log4js.config.json tmp && \
cp -r public tmp && \
cp -r io tmp && \
cp server.js tmp && \
cp -r src/games tmp/src
docker build -t bored-games --file Docker/Dockerfile . && \
rm -rf tmp
