#!/bin/bash

docker-compose --version
docker version
echo Using docker-compose to build and test

docker-compose -f ./paulgobero_com/testdocker-compose.yml up --build -d
docker-compose -f ./paulgobero_com/testdocker-compose.yml run testapp npm run test

 

