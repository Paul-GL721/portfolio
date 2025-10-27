#!/bin/bash
set -e
set -o pipefail

### Safe merge script: merges selected files from 'staging' into 'production'
### Preserves prod-only files and removes staging-only ones.

git config --global user.name "server2"
git config --global user.email "lwangapaul23@gmail.com"

echo "=== Checking out staging branch ==="
git fetch origin production staging
git checkout -f production
git pull origin production

# Ensure our merge strategy for .gitattributes works
git config merge.ours.driver true


# === Define folders and files ===
APP_FOLDERS=("bin" "configs" "controllers" "routes" "uploads" "models" "views" "public" "utils")
FILES=("app.js" "package.json" "package-lock.json" "Jenkinsfile" ".gitignore" ".gitattributes" "wait-for")

# === Staging-only files (never merge to production) ===
STAGE_ONLY_FILES=(
    "$BASE_DIRECTORY/jenkins-scripts/merge-code-step.sh"
    "$BASE_DIRECTORY/jenkins-scripts/build-step.sh"
    "$BASE_DIRECTORY/stagedocker-compose.yml"
    "$BASE_DIRECTORY/stagedockerfile"
    "$BASE_DIRECTORY/ansible"
    "$BASE_DIRECTORY/jenkins-scripts/test-step.sh"
    "$BASE_DIRECTORY/jenkins-scripts/merge-code.sh"
    "$BASE_DIRECTORY/jenkins-scripts/pull-request-step.sh"
    "$BASE_DIRECTORY/devdocker-compose.yml"
    "$BASE_DIRECTORY/jest-mongodb-config.js"
    "$BASE_DIRECTORY/jest.config.js"
    "$BASE_DIRECTORY/devdockerfile"
    "$BASE_DIRECTORY/testdocker-compose.yml"
    "$BASE_DIRECTORY/testdockerfile"
    "$BASE_DIRECTORY/mongodb"
    "$BASE_DIRECTORY/e2e"
    "$BASE_DIRECTORY/__tests__"
)

# === Staging-only files (preserve them) ===
PROD_ONLY_FILES=(
    "$BASE_DIRECTORY/jenkins-scripts/pr-branches.sh"
    "$BASE_DIRECTORY/jenkins-scripts/build-step.sh"
    "$BASE_DIRECTORY/docker-compose.yml"
    "$BASE_DIRECTORY/prodDockerfile"
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

echo "=== Allowed merge paths ==="
printf '  - %s\n' "${PATHS[@]}"

# === Get commits from staging not yet in production ===
COMMITS=$(git log --reverse --pretty=format:"%H" production..origin/staging -- "${PATHS[@]}")
echo "=== Commits to cherry-pick ==="
echo "$COMMITS"

# === Cherry-pick commits ===
for commit in $COMMITS; do
    echo "Cherry-picking commit $commit"
    if ! git cherry-pick -n "$commit"; then
        echo "Conflict detected — resolving automatically..."

        # Keep production version of .gitattributes
        if [ -f "$BASE_DIRECTORY/.gitattributes" ]; then
            git checkout --ours "$BASE_DIRECTORY/.gitattributes"
            git add "$BASE_DIRECTORY/.gitattributes"
        fi

        # Preserve production-only files
        for path in "${PROD_ONLY_FILES[@]}"; do
            echo "Preserving production-only: $path"
            git checkout origin/production -- "$path" 2>/dev/null || git checkout --ours "$path" 2>/dev/null || true
            git add "$path" || true
        done

        # Exclude stage-only files
        for path in "${STAGE_ONLY_FILES[@]}"; do
            echo "Ignoring stage-only: $path"
            if git ls-tree -r --name-only HEAD | grep -q "^${path#$BASE_DIRECTORY/}$"; then
                git checkout --ours "$path" 2>/dev/null || true
            else
                git rm -rf --cached "$path" 2>/dev/null || true
                rm -rf "$path" 2>/dev/null || true
            fi
            git add -A "$path" 2>/dev/null || true
        done

        # Prefer stage versions for allowed paths
        for path in "${PATHS[@]}"; do
            [ -e "$path" ] && git checkout --theirs "$path" && git add "$path"
        done

        git cherry-pick --continue || true
    fi
done

# === Final restore for production-only files ===
echo "=== Restoring production-only files to last known good state ==="
for path in "${PROD_ONLY_FILES[@]}"; do
    git checkout origin/production -- "$path" 2>/dev/null || true
    git add "$path" || true
done

# === Cleanup stage-only files just in case ===
echo "=== Cleaning up any stray stage-only files ==="
for path in "${STAGE_ONLY_FILES[@]}"; do
    rm -rf "$path" 2>/dev/null || true
    git rm -rf --cached "$path" 2>/dev/null || true
done

# === Commit changes ===
echo "=== Merge summary ==="
git status

CHANGED_FILES=$(git diff --cached --numstat | wc -l)
echo "They are $CHANGED_FILES staged files"

echo "Staging branch successfully merged into production (safe mode)."