#!/bin/sh


echo '---------------------'
echo '@Running ENV'
echo '---------------------'

env

echo '---------------------'
echo '@Installing Dependencies'
echo '---------------------'

npm install gulp -g

echo '---------------------'
echo '@Running Gulp Production'
echo '---------------------'

gulp production

echo '@Done...'
echo '@Deploying...'

echo '@Starting Web App...'

node ./bin/www