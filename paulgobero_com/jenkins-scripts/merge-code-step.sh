#!/bin/bash

### Script to merge selected files from development branch into staging with commit history ###

# Set git username and email
git config --global user.name "server2"
git config --global user.email "lwangapaul23@gmail.com"

echo "Branches in repo:"
git branch
git checkout -f production

# Ensure merge driver is configured (optional for .gitattributes)
git config merge.ours.driver true

# Define Express app files and folders to include
APP_FOLDERS=("bin" "configs" "controllers" "routes" "uploads" "models" "views" "public" "utils")
FILES=("app.js" "package.json" "package-lock.json" "Jenkinsfile" ".gitignore" ".gitattributes" "wait-for")


# Combine paths that exist
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

# Get commits from development not in staging touching only allowed files
COMMITS=$(git log --reverse --pretty=format:"%H" staging..origin/development -- "${PATHS[@]}")
echo "Commits to cherry-pick (not in staging yet):"
echo "$COMMITS"

# Cherry-pick commits
for commit in $COMMITS; do
    echo "Cherry-picking commit $commit"
    if ! git cherry-pick -n $commit; then
        echo "Conflict detected in commit $commit. Resolving automatically..."

        # Keep staging version of .gitattributes
        if [ -f "$BASE_DIRECTORY/.gitattributes" ]; then
            git checkout --ours "$BASE_DIRECTORY/.gitattributes"
            git add "$BASE_DIRECTORY/.gitattributes"
        fi

        #Drop files specific to staging or production branches from the commit so they remain untouched
        BRANCH_SPECIFIC_FILES=(
            "$BASE_DIRECTORY/stagedocker-compose.yml"
            "$BASE_DIRECTORY/stagedockerfile"
            "$BASE_DIRECTORY/pull-request-step.sh"
            "$BASE_DIRECTORY/docker-compose.yml"
            "$BASE_DIRECTORY/prodDockerfile"
            "$BASE_DIRECTORY/pr-branches.sh"
        )

        for path in "${BRANCH_SPECIFIC_FILES[@]}"; do
            if [ -e "$path" ]; then
                git rm -rf --cached "$path" || true
                git add -u "$path" || true
            fi
        done

        # Prefer development version for allowed PATHS
        for path in "${PATHS[@]}"; do
            if [ -e "$path" ]; then
                git checkout --theirs "$path"
                git add "$path"
            fi
        done

        git cherry-pick --continue || true
    fi
done

# Add only allowed files that exist
for path in "${PATHS[@]}"; do
    if [ -e "$path" ]; then
        git add "$path"
    fi
done

git status