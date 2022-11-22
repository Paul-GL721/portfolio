#!/bin/bash

#### CHECK VERSIONS OF DOCKER AND COMPOSE ###
docker-compose --version
docker version
echo Building the docker container

#  With 'sed commad' replace the jversion variable with the jenkins build number
sed  -i -e 's/JVERSION/$VERSION/g' ./$BASE_DIRECTORY/docker-compose.yml

## With docker-compose build a taged image
docker-compose -f ./$BASE_DIRECTORY/docker-compose.yml build

#sh '''sed  -i -e 's/JVERSION/$VERSION/g' ./${BASE_DIRECTORY}/docker-compose.yml'''
#sh '''docker-compose -f ./${BASE_DIRECTORY}/docker-compose.yml build'''