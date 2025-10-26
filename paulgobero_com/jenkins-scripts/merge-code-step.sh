#!/bin/bash
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

# ensure custom merge strategy works for .gitattributes
git config merge.ours.driver true

# === Define folders and files ===
APP_FOLDERS=("bin" "configs" "controllers" "routes" "uploads" "models" "views" "public" "utils")
FILES=("app.js" "package.json" "package-lock.json" "Jenkinsfile" ".gitignore" ".gitattributes" "wait-for")

DEV_ONLY_FILES=(
    "$BASE_DIRECTORY/jenkins-scripts"
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
    "$BASE_DIRECTORY/jenkins-scripts"
    "$BASE_DIRECTORY/stagedocker-compose.yml"
    "$BASE_DIRECTORY/stagedockerfile"
    "$BASE_DIRECTORY/ansible"
)

# === Build allowed merge path list ===
PATHS=()
for folder in "${APP_FOLDERS[@]}"; do
    [[ -d "$BASE_DIRECTORY/$folder" ]] && PATHS+=("$BASE_DIRECTORY/$folder")
done
for file in "${FILES[@]}"; do
    [[ -f "$BASE_DIRECTORY/$file" ]] && PATHS+=("$BASE_DIRECTORY/$file")
done

echo "Allowed merge paths:"
printf '  - %s\n' "${PATHS[@]}"

# === Get commits from development not yet in staging ===
COMMITS=$(git log --reverse --pretty=format:"%H" staging..origin/development -- "${PATHS[@]}")
echo "Commits to cherry-pick:"
echo "$COMMITS"

# === Cherry-pick commits ===
for commit in $COMMITS; do
    echo "Cherry-picking commit $commit"
    if ! git cherry-pick -n $commit; then
        echo "Conflict detected — resolving automatically..."

        # Keep staging version of .gitattributes
        if [ -f "$BASE_DIRECTORY/.gitattributes" ]; then
            git checkout --ours "$BASE_DIRECTORY/.gitattributes"
            git add "$BASE_DIRECTORY/.gitattributes"
        fi

        # Preserve staging-only files
        for path in "${STAGING_ONLY_FILES[@]}"; do
            echo "Preserving staging-only: $path"
            git checkout origin/staging -- "$path" 2>/dev/null || git checkout --ours "$path" 2>/dev/null || true
            git add "$path" || true
        done

        # Exclude dev-only files from staging
        for path in "${DEV_ONLY_FILES[@]}"; do
            echo "Ignoring dev-only: $path"
            git checkout --ours "$path" 2>/dev/null || true
            git add "$path" || true
        done

        # Prefer development versions for allowed paths
        for path in "${PATHS[@]}"; do
            [ -e "$path" ] && git checkout --theirs "$path" && git add "$path"
        done

        git cherry-pick --continue || true
    fi
done

# === Final staging restore ===
echo "Restoring staging-only files to last known good state..."
for path in "${STAGING_ONLY_FILES[@]}"; do
    git checkout origin/staging -- "$path" 2>/dev/null || true
    git add "$path" || true
done

echo "Merge summary:"
git status
echo "Development branch successfully merged into staging (safe mode)."
