#!/bin/bash

# if you are using windows, you may need to convert the file to unix format
# you can use the Ubuntu terminal to convert this file to unix format
# otherwise, you may get the error after running the docker container

# sudo apt-get install dos2unix
# dos2unix entrypoint.sh

set -e

pnpm add next pg prettier

export PORT=30002

pm2 start ./pm2.json --no-daemon