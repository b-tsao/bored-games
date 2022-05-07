#!/bin/bash

cd .. && \
./build.sh && \
docker build -t bored-games --file Docker/Dockerfile .