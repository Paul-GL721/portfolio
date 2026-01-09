#!/bin/bash
set -e
set -o pipefail

############################################
# Safe merge: development → staging
# - Only allowed app paths are merged
# - Dev-only paths are excluded BEFORE cherry-pick
# - Staging-only paths are preserved
############################################

git config --global user.name "server2"
git config --global user.email "lwangapaul23@gmail.com"

echo "=== Fetching branches ==="
git fetch origin staging development

echo "=== Checking out staging ==="
git checkout -f staging
git pull origin staging

# Define allowed app paths
APP_FOLDERS=(
  "bin"
  "configs"
  "controllers"
  "routes"
  "uploads"
  "models"
  "views"
  "public"
  "utils"
)

FILES=(
  "app.js"
  "package.json"
  "package-lock.json"
  "Jenkinsfile"
  ".gitignore"
  ".gitattributes"
  "wait-for"
)


# Dev-only paths (ABSOLUTELY NEVER MERGE)
DEV_ONLY_PATHS=(
  "$BASE_DIRECTORY/__tests__"
  "$BASE_DIRECTORY/__e2e__"
  "$BASE_DIRECTORY/jest.config.js"
  "$BASE_DIRECTORY/jest.e2e.config.js"
  "$BASE_DIRECTORY/jest.globalSetup.js"
  "$BASE_DIRECTORY/jest.globalTeardown.js"
  "$BASE_DIRECTORY/jest-mongodb-config.js"
  "$BASE_DIRECTORY/devdocker-compose.yml"
  "$BASE_DIRECTORY/devdockerfile"
  "$BASE_DIRECTORY/testdocker-compose.yml"
  "$BASE_DIRECTORY/testdockerfile"
  "$BASE_DIRECTORY/mongodb"
  "$BASE_DIRECTORY/jenkins-scripts"
)


# Staging-only paths (must be preserved)
STAGING_ONLY_PATHS=(
  "$BASE_DIRECTORY/jenkins-scripts/merge-code-step.sh"
  "$BASE_DIRECTORY/jenkins-scripts/build-step.sh"
  "$BASE_DIRECTORY/stagedocker-compose.yml"
  "$BASE_DIRECTORY/stagedockerfile"
  "$BASE_DIRECTORY/ansible"
)

# Build allowed merge paths
ALLOWED_PATHS=()

for folder in "${APP_FOLDERS[@]}"; do
  [[ -d "$BASE_DIRECTORY/$folder" ]] && ALLOWED_PATHS+=("$BASE_DIRECTORY/$folder")
done

for file in "${FILES[@]}"; do
  [[ -f "$BASE_DIRECTORY/$file" ]] && ALLOWED_PATHS+=("$BASE_DIRECTORY/$file")
done

# root .gitignore (outside base dir)
[[ -f ".gitignore" ]] && ALLOWED_PATHS+=(".gitignore")

echo "=== Allowed merge paths ==="
printf '  - %s\n' "${ALLOWED_PATHS[@]}"

# Build git exclude arguments
EXCLUDE_ARGS=()
for path in "${DEV_ONLY_PATHS[@]}"; do
  EXCLUDE_ARGS+=( ":(exclude)$path" )
done

# Collect SAFE commits only
echo "=== Collecting safe commits ==="
COMMITS=$(git log --reverse --pretty=format:"%H" \
  staging..origin/development \
  -- "${ALLOWED_PATHS[@]}" "${EXCLUDE_ARGS[@]}")

if [[ -z "$COMMITS" ]]; then
  echo "No safe commits to merge."
  exit 0
fi

echo "=== Commits to cherry-pick ==="
echo "$COMMITS"

# Cherry-pick safely (no conflicts expected)
for commit in $COMMITS; do
  echo "Cherry-picking $commit"
  git cherry-pick "$commit"
done

# Restore staging-only paths (guaranteed)
echo "=== Restoring staging-only paths ==="
for path in "${STAGING_ONLY_PATHS[@]}"; do
  git checkout origin/staging -- "$path" 2>/dev/null || true
  git add "$path" 2>/dev/null || true
done

# Final safety cleanup: remove dev-only paths
echo "=== Final cleanup of dev-only paths ==="
for path in "${DEV_ONLY_PATHS[@]}"; do
  rm -rf "$path" 2>/dev/null || true
  git rm -rf --cached "$path" 2>/dev/null || true
done

# Commit result
echo "=== Merge summary ==="
git status

if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "chore(staging): merge safe application changes from development"
fi

echo "Development successfully merged into staging (safe mode)"
