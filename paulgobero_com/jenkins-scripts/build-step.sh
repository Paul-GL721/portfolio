#!/bin/bash

#### CHECK VERSIONS OF DOCKER AND COMPOSE ###
docker-compose --version
docker version
echo Building the docker container

#  With 'sed commad' replace the jversion variable with the jenkins build number
sed  -i -e 's/JVERSION/$VERSION/g' ./portfolio/paulgobero_com/docker-compose.yml

## With docker-compose build a taged image
docker-compose build