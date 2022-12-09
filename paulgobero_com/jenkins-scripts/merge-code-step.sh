#!/bin/bash

###Script to merge prouction code into the Master branch###

#set git username and email
git config --global user.name "server2"
git config --global user.email paul@paulgobero.com
echo The branches are:
git branch
git checkout -f production

#If any of these files or folder changes in the production branch
#merge them into the master branch
git checkout origin/staging paulgobero_com/ansible paulgobero_com/bin paulgobero_com/configs paulgobero_com/jenkins-scripts paulgobero_com/models paulgobero_com/mongodb/Dockerfile paulgobero_com/public paulgobero_com/routes paulgobero_com/views paulgobero_com/app.js paulgobero_com/Jenkinsfile paulgobero_com/package-lock.json paulgobero_com/package.json 

git status
#git remote -v

 

