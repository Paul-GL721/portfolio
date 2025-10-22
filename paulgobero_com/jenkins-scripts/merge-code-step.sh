#!/bin/bash

###Script to merge devlopment code into the staging_code branch###

#set git username and email
git config --global user.name "server2"
git config --global user.email lwangapaul23@gmail.com
echo The branches are:
git branch
git checkout -f staging

#If any of these files or folder changes in the development branch
#merge them into the staging branch
git checkout origin/development $BASE_DIRECTORY/bin $BASE_DIRECTORY/configs/loadb.js $BASE_DIRECTORY/models $BASE_DIRECTORY/mongodb/Dockerfile $BASE_DIRECTORY/public $BASE_DIRECTORY/routes $BASE_DIRECTORY/controllers $BASE_DIRECTORY/views $BASE_DIRECTORY/app.js $BASE_DIRECTORY/Jenkinsfile $BASE_DIRECTORY/package-lock.json $BASE_DIRECTORY/package.json $BASE_DIRECTORY/.gitignore $BASE_DIRECTORY/testdocker-compose.yml $BASE_DIRECTORY/testdockerfile $BASE_DIRECTORY/wait-for $BASE_DIRECTORY/utils


git status
#git remote -v

 

