#! /bin/bash
name="closed-beta"

npm run prestart
./build.sh
docker rm -vf $name
docker run -d -p 3000:3000 -p 8000:8000 --name $name bored-games
docker image prune -f
