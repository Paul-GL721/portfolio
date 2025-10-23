#!/bin/bash

### Script to merge selected files from development branch into staging with commit history ###
### Safe merge script: merge selected files from 'development' into 'staging' ###
### Preserves staging-only files and ignores dev-only ones. ###

set -e
set -o pipefail

### Safe merge script: merge selected files from 'development' into 'staging'
### Preserves staging-only files and ignores dev-only ones.

git config --global user.name "server2"
git config --global user.email "lwangapaul23@gmail.com"

BASE_DIRECTORY=$(pwd)

echo "Checking out staging branch..."
git fetch origin staging development
git checkout -f staging
git pull origin staging

git config merge.ours.driver true

# Define directories and files to include
APP_FOLDERS=("bin" "configs" "controllers" "routes" "uploads" "models" "views" "public" "utils")
FILES=("app.js" "package.json" "package-lock.json" "Jenkinsfile" ".gitignore" ".gitattributes" "wait-for")

# Define dev-only and staging-only files
DEV_ONLY_FILES=(
    "$BASE_DIRECTORY/jenkins-scripts/test-step.sh"
    "$BASE_DIRECTORY/devdocker-compose.yml"
    "$BASE_DIRECTORY/jest.config.js"
    "$BASE_DIRECTORY/devdockerfile"
    "$BASE_DIRECTORY/testdocker-compose.yml"
    "$BASE_DIRECTORY/testdockerfile"
    "$BASE_DIRECTORY/mongodb"
    "$BASE_DIRECTORY/e2e"
    "$BASE_DIRECTORY/__tests__/"
)

STAGING_ONLY_FILES=(
    "$BASE_DIRECTORY/jenkins-scripts/build-step.sh"
    "$BASE_DIRECTORY/stagedocker-compose.yml"
    "$BASE_DIRECTORY/stagedockerfile"
    "$BASE_DIRECTORY/views"
    "$BASE_DIRECTORY/controllers"
    "$BASE_DIRECTORY/public/images"
)

# Build allowed path list
PATHS=()
for folder in "${APP_FOLDERS[@]}"; do
    [[ -d "$BASE_DIRECTORY/$folder" ]] && PATHS+=("$BASE_DIRECTORY/$folder")
done
for file in "${FILES[@]}"; do
    [[ -f "$BASE_DIRECTORY/$file" ]] && PATHS+=("$BASE_DIRECTORY/$file")
done

COMMITS=$(git log --reverse --pretty=format:"%H" staging..origin/development -- "${PATHS[@]}")
echo "Commits to cherry-pick:"
echo "$COMMITS"

for commit in $COMMITS; do
    echo "Cherry-picking commit $commit"
    if ! git cherry-pick -n $commit; then
        echo "Conflict detected — resolving automatically..."

        # Keep staging version of .gitattributes
        [ -f "$BASE_DIRECTORY/.gitattributes" ] && git checkout --ours "$BASE_DIRECTORY/.gitattributes" && git add "$BASE_DIRECTORY/.gitattributes"

        # Preserve staging-only files
        for path in "${STAGING_ONLY_FILES[@]}"; do
            echo "Preserving staging-only: $path"
            git checkout origin/staging -- "$path" 2>/dev/null || true
            git add "$path" || true
        done

        # Skip dev-only files
        for path in "${DEV_ONLY_FILES[@]}"; do
            echo "Skipping dev-only: $path"
            git checkout --ours "$path" 2>/dev/null || true
            git add "$path" || true
        done

        # Prefer dev version for allowed files
        for path in "${PATHS[@]}"; do
            [ -e "$path" ] && git checkout --theirs "$path" && git add "$path"
        done

        git cherry-pick --continue || true
    fi
done

# Final restore of staging-only files (critical fix)
echo "Restoring staging-only files to last known good state..."
for path in "${STAGING_ONLY_FILES[@]}"; do
    git checkout origin/staging -- "$path" 2>/dev/null || true
    git add "$path" || true
done

git status

echo "🎉 Merge complete. Staging-only files preserved!"





set -e
set -o pipefail

# Basic Git identity for automation
git config --global user.name "server2"
git config --global user.email "lwangapaul23@gmail.com"


echo "Checking out staging branch..."
git fetch origin staging development
git checkout -f staging
git pull origin staging

# Optional merge driver config
git config merge.ours.driver true

# Define directories and files that should be merged from dev
APP_FOLDERS=("bin" "configs" "controllers" "routes" "uploads" "models" "views" "public" "utils")
FILES=("app.js" "package.json" "package-lock.json" "Jenkinsfile" ".gitignore" ".gitattributes" "wait-for")

# Define dev-only and staging-only files
DEV_ONLY_FILES=(
    "$BASE_DIRECTORY/jenkins-scripts/test-step.sh"
    "$BASE_DIRECTORY/devdocker-compose.yml"
    "$BASE_DIRECTORY/jest.config.js"
    "$BASE_DIRECTORY/devdockerfile"
    "$BASE_DIRECTORY/testdocker-compose.yml"
    "$BASE_DIRECTORY/testdockerfile"
    "$BASE_DIRECTORY/mongodb"
    "$BASE_DIRECTORY/e2e"
    "$BASE_DIRECTORY/__tests__/"
)

STAGING_ONLY_FILES=(
    "$BASE_DIRECTORY/jenkins-scripts/build-step.sh"
    "$BASE_DIRECTORY/stagedocker-compose.yml"
    "$BASE_DIRECTORY/stagedockerfile"
)

# Build allowed path list dynamically
PATHS=()
for folder in "${APP_FOLDERS[@]}"; do
    if [[ -d "$BASE_DIRECTORY/$folder" ]]; then
        PATHS+=("$BASE_DIRECTORY/$folder")
    fi
done

for file in "${FILES[@]}"; do
    if [[ -f "$BASE_DIRECTORY/$file" ]]; then
        PATHS+=("$BASE_DIRECTORY/$file")
    fi
done

echo "Allowed merge paths:"
printf '  - %s\n' "${PATHS[@]}"

# Get list of commits in development not yet in staging that touch allowed files
COMMITS=$(git log --reverse --pretty=format:"%H" staging..origin/development -- "${PATHS[@]}")
echo "Commits to cherry-pick:"
echo "$COMMITS"

# Cherry-pick commits one by one
for commit in $COMMITS; do
    echo "Cherry-picking commit $commit"
    if ! git cherry-pick -n $commit; then
        echo "Conflict detected — resolving automatically..."

        # Keep staging version of .gitattributes
        if [ -f "$BASE_DIRECTORY/.gitattributes" ]; then
            git checkout --ours "$BASE_DIRECTORY/.gitattributes"
            git add "$BASE_DIRECTORY/.gitattributes"
        fi

        # Ensure dev-only files stay out of staging
        for path in "${DEV_ONLY_FILES[@]}"; do
            if [ -e "$path" ]; then
                echo "Keeping staging version of dev-only file: $path"
                git checkout --ours "$path" || true
                git add "$path" || true
            fi
        done

        # Ensure staging-only files remain untouched
        for path in "${STAGING_ONLY_FILES[@]}"; do
            if [ -e "$path" ]; then
                echo "Preserving staging-only file: $path"
                git checkout --ours "$path" || true
                git add "$path" || true
            fi
        done

        # Prefer dev version for approved paths
        for path in "${PATHS[@]}"; do
            if [ -e "$path" ]; then
                git checkout --theirs "$path" || true
                git add "$path" || true
            fi
        done

        git cherry-pick --continue || true
    fi
done

# Stage and show status
for path in "${PATHS[@]}"; do
    if [ -e "$path" ]; then
        git add "$path"
    fi
done

echo "Merge summary:"
git status
echo "Development branch successfully merged into staging (safe mode)."
