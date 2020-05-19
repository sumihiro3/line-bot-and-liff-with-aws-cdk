#!/bin/sh

# .env ファイルにある環境変数を読み込んでexport
. .env
export ACCESS_TOKEN=${ACCESS_TOKEN}
export CHANNEL_SECRET=${CHANNEL_SECRET}
export KINTONE_API_URL=${KINTONE_API_URL}
export KINTONE_APP_ID=${KINTONE_APP_ID}
export KINTONE_API_TOKEN=${KINTONE_API_TOKEN}

# build and deploy
yarn build && cdk deploy
