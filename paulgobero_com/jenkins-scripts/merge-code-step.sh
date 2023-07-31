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
git checkout origin/staging paulgobero_com/bin paulgobero_com/configs paulgobero_com/controllers paulgobero_com/models paulgobero_com/mongodb/Dockerfile paulgobero_com/public paulgobero_com/routes paulgobero_com/uploads paulgobero_com/utils paulgobero_com/views paulgobero_com/.dockerignore paulgobero_com/.gitignore paulgobero_com/app.js paulgobero_com/Jenkinsfile paulgobero_com/package-lock.json paulgobero_com/package.json paulgobero_com/wait-for 

git status
#git remote -v

 

