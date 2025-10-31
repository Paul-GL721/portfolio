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
