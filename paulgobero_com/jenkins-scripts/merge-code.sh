#!/bin/bash

###Script to merge devlopment code into the staging_code branch###

#set git username and email
git config --global user.name "server2"
git config --global user.email paul@paulgobero.com
echo The branches are:
git branch
git checkout -f staging

#If any of these files changes in the development branch
#merge the following files and folders into the staging branch
git checkout origin/development bin configs models mongodb/Dockerfile node_modules public routes views app.js Jenkinsfile package-lock.json package.json testdocker-compose.yml testdockerfile 

git status
#git remote -v

 

