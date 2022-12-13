#!/bin/bash

###Script to merge devlopment code into the staging_code branch###

#set git username and email
git config --global user.name "server2"
git config --global user.email paul@paulgobero.com
echo The branches are:
git branch
git checkout -b tmpstagingV$VERSION staging
git checkout -f tmpstagingV$VERSION

#If any of these files or folder changes in the development branch
#merge them into the staging branch
git checkout origin/staging paulgobero_com/bin paulgobero_com/configs paulgobero_com/models paulgobero_com/mongodb/Dockerfile paulgobero_com/public paulgobero_com/routes paulgobero_com/views paulgobero_com/app.js paulgobero_com/Jenkinsfile paulgobero_com/package-lock.json paulgobero_com/package.json

git push --set-upstream origin tmpstagingV$VERSION

git status
#git remote -v