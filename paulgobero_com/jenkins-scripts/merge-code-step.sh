#!/bin/bash
set -e
set -o pipefail

############################################
# Safe merge: development → staging
############################################

git config --global user.name "server2"
git config --global user.email "lwangapaul23@gmail.com"

echo "=== Fetching branches ==="
git fetch origin staging development

echo "=== Checking out staging ==="
git checkout -f staging
git pull origin staging

############################################
# Allowed application paths (repo-relative)
############################################

APP_FOLDERS=(
  "paulgobero_com/bin"
  "paulgobero_com/configs"
  "paulgobero_com/controllers"
  "paulgobero_com/routes"
  "paulgobero_com/uploads"
  "paulgobero_com/models"
  "paulgobero_com/views"
  "paulgobero_com/public"
  "paulgobero_com/utils"
)

FILES=(
  "paulgobero_com/app.js"
  "paulgobero_com/package.json"
  "paulgobero_com/package-lock.json"
  "paulgobero_com/Jenkinsfile"
  "paulgobero_com/.gitattributes"
  "paulgobero_com/wait-for"
  ".gitignore"
)

############################################
# Dev-only paths (NEVER MERGE)
############################################

DEV_ONLY_PATHS=(
  "paulgobero_com/__tests__"
  "paulgobero_com/__e2e__"
  "paulgobero_com/jest.config.js"
  "paulgobero_com/jest.e2e.config.js"
  "paulgobero_com/jest.globalSetup.js"
  "paulgobero_com/jest.globalTeardown.js"
  "paulgobero_com/jest-mongodb-config.js"
  "paulgobero_com/devdocker-compose.yml"
  "paulgobero_com/devdockerfile"
  "paulgobero_com/testdocker-compose.yml"
  "paulgobero_com/testdockerfile"
  "paulgobero_com/mongodb"
  "paulgobero_com/jenkins-scripts"
)

############################################
# Staging-only paths (ALWAYS KEEP)
############################################

STAGING_ONLY_PATHS=(
  "paulgobero_com/jenkins-scripts/build-step.sh"
  "paulgobero_com/jenkins-scripts/merge-code-step.sh"
  "paulgobero_com/stagedocker-compose.yml"
  "paulgobero_com/stagedockerfile"
  "paulgobero_com/ansible"
)

############################################
# Build exclude arguments
############################################

EXCLUDE_ARGS=()
for path in "${DEV_ONLY_PATHS[@]}"; do
  EXCLUDE_ARGS+=( ":(exclude)$path" )
done

############################################
# Collect SAFE commits only
############################################

echo "=== Collecting safe commits ==="

COMMITS=$(git log --reverse --pretty=format:"%H" \
  staging..origin/development \
  -- "${APP_FOLDERS[@]}" "${FILES[@]}" "${EXCLUDE_ARGS[@]}")

if [[ -z "$COMMITS" ]]; then
  echo "No safe commits to merge."
  exit 0
fi

echo "=== Commits to cherry-pick ==="
echo "$COMMITS"

############################################
# Cherry-pick with safety guards
############################################

for commit in $COMMITS; do
  echo "Cherry-picking $commit"

  if ! git cherry-pick "$commit"; then
    echo "Conflict detected — resolving safely"

    # Jenkinsfile → always from development
    git checkout origin/development -- paulgobero_com/Jenkinsfile 2>/dev/null || true
    git add paulgobero_com/Jenkinsfile 2>/dev/null || true

    # Restore staging-only paths
    for path in "${STAGING_ONLY_PATHS[@]}"; do
      git checkout origin/staging -- "$path" 2>/dev/null || true
      git add "$path" 2>/dev/null || true
    done

    # Remove dev-only paths if staged
    for path in "${DEV_ONLY_PATHS[@]}"; do
      git rm -rf --cached "$path" 2>/dev/null || true
      rm -rf "$path" 2>/dev/null || true
    done

    git cherry-pick --continue
  fi
done

############################################
# Final safety cleanup
############################################

echo "=== Final cleanup of dev-only paths ==="
for path in "${DEV_ONLY_PATHS[@]}"; do
  rm -rf "$path" 2>/dev/null || true
  git rm -rf --cached "$path" 2>/dev/null || true
done

############################################
# Commit
############################################

echo "=== Merge summary ==="
git status

if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "chore(staging): merge safe application changes from development"
fi

echo "✅ Development successfully merged into staging (safe mode)"
