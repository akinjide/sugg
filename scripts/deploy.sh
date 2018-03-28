#!/bin/sh


echo '---------------------'
echo '@Running env and version check'
echo '---------------------'

env
node --version
npm --version

echo '---------------------'
echo '@Installing Dependencies'
echo '---------------------'

npm install gulp -g
npm install -g pm2
npm install gulp

echo '---------------------'
echo '@Running Gulp Production'
echo '---------------------'

gulp production

echo '@Done...'
echo '@Deploying...'

echo '@Starting Web App...'

# node ./bin/www
pm2 start ./bin/www