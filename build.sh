#!/bin/bash



# Remove existing production folder
rm -rf ./build/ ./tmp/



### Bundle FrontEnd ###

# Build React code
npm run build:app

# Rename the folder
mv build tmp



### Build BackEnd ###

# Transpile .ts to .js
npm run build:server

# Move the contains to the build/ dir
mv tmp build/public