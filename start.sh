#!/bin/sh


echo '---------------------'
echo '@Running ENV'
echo '---------------------'

env

echo '---------------------'
echo '@Running Gulp Production'
echo '---------------------'

gulp production

echo '@Done...'
echo '@Deploying...'