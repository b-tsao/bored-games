#! /bin/bash
name="closed-beta"

env_file="../.env"

if [ -f $env_file ]
then
  export $(cat $env_file | sed 's/#.*//g' | xargs)
fi

./build.sh
docker rm -vf $name
docker run -d -p 3000:$REACT_APP_PORT -p 8000:$REACT_APP_BGIO_PORT --name $name bored-games
docker image prune -f