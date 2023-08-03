#!/bin/bash

###Script to merge staging branch into prouction branch###

#set git username and email
git config --global user.name "server2"
git config --global user.email paul@paulgobero.com
echo The branches are:
git branch
git checkout -f production

#If any of these files or folder changes in the staging branch
#merge them into the production branch
git checkout origin/staging $BASE_DIRECTORY/bin $BASE_DIRECTORY/configs $BASE_DIRECTORY/controllers $BASE_DIRECTORY/models $BASE_DIRECTORY/mongodb/Dockerfile $BASE_DIRECTORY/public $BASE_DIRECTORY/routes $BASE_DIRECTORY/uploads $BASE_DIRECTORY/utils $BASE_DIRECTORY/views $BASE_DIRECTORY/.dockerignore $BASE_DIRECTORY/.gitignore $BASE_DIRECTORY/app.js $BASE_DIRECTORY/Jenkinsfile $BASE_DIRECTORY/package-lock.json $BASE_DIRECTORY/package.json $BASE_DIRECTORY/wait-for 

git status
#git remote -v

 

