#! /bin/bash
name="closed-beta"

./build.sh
docker rm -vf $name
docker run -d -p 3000:8080 -p 8000:8000 --name $name bored-games
docker image prune -f
