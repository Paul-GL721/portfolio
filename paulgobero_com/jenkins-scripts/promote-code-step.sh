#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 3 ]]; then
    echo "Usage: $0 <source-branch> <target-branch> <promotion-branch>" >&2
    exit 2
fi

SOURCE_BRANCH="$1"
TARGET_BRANCH="$2"
PROMOTION_BRANCH="$3"
BASE_DIRECTORY="${BASE_DIRECTORY:-paulgobero_com}"

case "${SOURCE_BRANCH}:${TARGET_BRANCH}" in
    development:staging|staging:production|production:master)
        ;;
    *)
        echo "Unsupported promotion: ${SOURCE_BRANCH} -> ${TARGET_BRANCH}" >&2
        exit 2
        ;;
esac

git config user.name "jenkinsagent2"
git config user.email "lwangapaul23@gmail.com"
git fetch --prune origin "${SOURCE_BRANCH}" "${TARGET_BRANCH}"
git checkout -B "${PROMOTION_BRANCH}" "origin/${TARGET_BRANCH}"

APP_FOLDERS=(bin configs controllers routes uploads models views public utils)
APP_FILES=(app.js package.json package-lock.json Jenkinsfile .gitignore .gitattributes wait-for)
SOURCE_PATHS=()

for folder in "${APP_FOLDERS[@]}"; do
    if git cat-file -e "origin/${SOURCE_BRANCH}:${BASE_DIRECTORY}/${folder}" 2>/dev/null; then
        SOURCE_PATHS+=("${BASE_DIRECTORY}/${folder}")
    fi
done

for file in "${APP_FILES[@]}"; do
    if git cat-file -e "origin/${SOURCE_BRANCH}:${BASE_DIRECTORY}/${file}" 2>/dev/null; then
        SOURCE_PATHS+=("${BASE_DIRECTORY}/${file}")
    fi
done

SOURCE_PATHS+=("${BASE_DIRECTORY}/jenkins-scripts/promote-code-step.sh")

if git cat-file -e "origin/${SOURCE_BRANCH}:README.md" 2>/dev/null; then
    SOURCE_PATHS+=(README.md)
fi

echo "Promoting application code from ${SOURCE_BRANCH} to ${TARGET_BRANCH}:"
printf '  - %s\n' "${SOURCE_PATHS[@]}"

git checkout "origin/${SOURCE_BRANCH}" -- "${SOURCE_PATHS[@]}"
git add --all -- "${SOURCE_PATHS[@]}"
git rm --ignore-unmatch "${BASE_DIRECTORY}/jenkins-scripts/merge-code-step.sh"

echo "Promotion summary:"
git diff --cached --stat
