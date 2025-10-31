#!/bin/bash
set -e
set -o pipefail

### Script: Merge production branch (with history) into a temporary branch ###

# Config
git config --global user.name "server2"
git config --global user.email "lwangapaul23@gmail.com"

# Ensure we’re up to date
git fetch origin

# Create a new temporary branch from main (or any base you want)
BASE_BRANCH="production"
TMP_BRANCH="tmpproductionV$VERSION"

echo "=== Creating temporary production branch: $TMP_BRANCH ==="
git checkout -b "$TMP_BRANCH" "origin/$BASE_BRANCH"

# Merge full production branch history (not just files)
echo "=== Merging origin/production into $TMP_BRANCH (with history) ==="
git merge --no-ff --no-edit origin/production


# Push branch upstream
git push --set-upstream origin "$TMP_BRANCH"

echo "=== Done ==="
git status





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