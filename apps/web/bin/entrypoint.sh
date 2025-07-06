#!/bin/bash

# if you are using windows, you may need to convert the file to unix format
# you can use the Ubuntu terminal to convert this file to unix format
# otherwise, you may get the error after running the docker container

# sudo apt-get install dos2unix
# dos2unix entrypoint.sh

set -e

pnpm add next pg prettier

export PORT=30001

export NEXT_APP_WECHAT_APIKEY=ak1_357238484fe90544c9c8_de37ef62d7fab76fb738
#export CORPID=
#export DIRECTORY_SECRET=

pm2 start ./pm2.json --no-daemon