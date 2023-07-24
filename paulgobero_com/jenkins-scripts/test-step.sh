#!/bin/bash

set -e

echo "Starting test-step.sh"

docker-compose --version
docker version
echo Using docker-compose to build and test

echo "Starting docker-compose"

docker-compose -f ./paulgobero_com/testdocker-compose.yml up --build -d
#npm install 
#npm run test

echo "Waiting for docker-compose to finish"

until docker-compose -f ./paulgobero_com/testdocker-compose.yml ps | grep testapp; do
sleep 1
done

echo "Running tests"

docker-compose -f ./paulgobero_com/testdocker-compose.yml run testapp npm run test:unit-inside-docker

echo "Finished test-step.sh"