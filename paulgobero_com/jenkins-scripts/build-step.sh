#!/bin/bash

#### CHECK VERSIONS OF DOCKER AND COMPOSE ###
docker-compose --version
docker version
echo Building the docker container

# With 'sed commad' replace the jversion variable with the jenkins build number
sed  -i -e 's/JVERSION/$VERSION/g' ./$BASE_DIRECTORY/stagedocker-compose.yml

## With docker-compose build a taged image
docker-compose -f ./$BASE_DIRECTORY/stagedocker-compose.yml build
whoami
echo usr=$USER

# Switch user and login and push image to docker hub 
#(credentials are in the pass credsStore) 
sudo su ubuntu <<HERE
whoami
echo usr=$USER
docker image push -a
HERE
#docker push paulgl721/nodejs-portfolio:stagingV$VERSION

#sh '''sed  -i -e 's/JVERSION/$VERSION/g' ./${BASE_DIRECTORY}/docker-compose.yml'''
#sh '''docker-compose -f ./${BASE_DIRECTORY}/docker-compose.yml build'''

# echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin