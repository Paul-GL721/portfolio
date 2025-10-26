#!/bin/bash

docker-compose --version
docker version
echo Using docker-compose to build and test

<<<<<<< HEAD
docker-compose -f testdocker-compose.yml up --build -d
docker-compose -f testdocker-compose.yml run testapp npm run test
=======
#npm install jest-puppeteer

docker-compose -f ./paulgobero_com/testdocker-compose.yml up --build -d
docker-compose -f ./paulgobero_com/testdocker-compose.yml exec testapp npm run test
>>>>>>> 8831a39... Running tests in jenkins pipeline

 

