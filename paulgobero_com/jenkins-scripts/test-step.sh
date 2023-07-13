#!/bin/bash

set -e

echo "Starting test-step.sh"

docker-compose --version
docker version
echo Using docker-compose to build and test

#sudo apt-get install -y ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils


echo "Starting docker-compose"

docker-compose -f ./paulgobero_com/testdocker-compose.yml up --build -d
#npm install 
#npm run test

echo "Waiting for docker-compose to finish"

until docker-compose -f ./paulgobero_com/testdocker-compose.yml ps | grep testapp; do
sleep 1
done

echo "Running tests"

docker-compose -f ./paulgobero_com/testdocker-compose.yml run testapp npm run test

echo "Finished test-step.sh"