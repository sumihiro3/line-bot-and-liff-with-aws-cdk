#!/bin/sh

# .env ファイルにある環境変数を読み込んでexport
. .env
export ACCESS_TOKEN=${ACCESS_TOKEN}
export CHANNEL_SECRET=${CHANNEL_SECRET}

# build and deploy
yarn build && cdk deploy
