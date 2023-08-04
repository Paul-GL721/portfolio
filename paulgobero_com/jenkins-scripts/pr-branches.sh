#!/bin/bash

###Script to merge devlopment code into the staging_code branch###

#set git username and email
git config --global user.name "server2"
git config --global user.email paul@paulgobero.com
echo The branches are:
git branch
git checkout -b tmpproductionV$VERSION

#If any of these files or folder changes in the production branch
#merge them into the temporary production branch
git checkout origin/production $BASE_DIRECTORY/ansible $BASE_DIRECTORY/bin $BASE_DIRECTORY/configs $BASE_DIRECTORY/controllers $BASE_DIRECTORY/jenkins-scripts/build-step.sh $BASE_DIRECTORY/models $BASE_DIRECTORY/mongodb $BASE_DIRECTORY/public $BASE_DIRECTORY/routes $BASE_DIRECTORY/uploads $BASE_DIRECTORY/utils $BASE_DIRECTORY/views $BASE_DIRECTORY/.dockerignore $BASE_DIRECTORY/.gitignore $BASE_DIRECTORY/app.js $BASE_DIRECTORY/docker-compose.yml $BASE_DIRECTORY/prodDockerfile $BASE_DIRECTORY/Jenkinsfile $BASE_DIRECTORY/package-lock.json $BASE_DIRECTORY/package.json $BASE_DIRECTORY/wait-for

git push --set-upstream origin tmpproductionV$VERSION

git status
#git remote -v