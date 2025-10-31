#!/bin/bash
set -e
set -o pipefail

### Safe merge script: merges selected files from 'development' into 'staging'
### Preserves staging-only files and removes dev-only ones.

git config --global user.name "server2"
git config --global user.email "lwangapaul23@gmail.com"

echo "=== Checking out staging branch ==="
git fetch origin staging development
git checkout -f staging
git pull origin staging

# Ensure our merge strategy for .gitattributes works
git config merge.ours.driver true

# === Define base directory (ensure set from Jenkins) ===
BASE_DIRECTORY=${BASE_DIRECTORY:-paulgobero_com}

# === Define folders and files ===
APP_FOLDERS=("bin" "configs" "controllers" "routes" "uploads" "models" "views" "public" "utils")
FILES=("app.js" "package.json" "package-lock.json" "Jenkinsfile" ".gitignore" ".gitattributes" "wait-for")

# === Development-only files (never merge to staging) ===
DEV_ONLY_FILES=(
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
STAGING_ONLY_FILES=(
    "$BASE_DIRECTORY/jenkins-scripts/merge-code-step.sh"
    "$BASE_DIRECTORY/jenkins-scripts/build-step.sh"
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
# Add .gitignore manually (outside base directory)
if [[ -f ".gitignore" ]]; then
    PATHS+=(".gitignore")
fi

echo "=== Allowed merge paths ==="
printf '  - %s\n' "${PATHS[@]}"

# === Get commits from development not yet in staging ===
COMMITS=$(git log --reverse --pretty=format:"%H" staging..origin/development -- "${PATHS[@]}" || true)
echo "=== Commits to cherry-pick ==="
echo "$COMMITS"

# === Cherry-pick commits ===
for commit in $COMMITS; do
    echo "Cherry-picking commit $commit"
    if ! git cherry-pick -n "$commit"; then
        echo "⚠️  Conflict detected — resolving automatically..."

        # Keep staging version of .gitattributes
        if [ -f "$BASE_DIRECTORY/.gitattributes" ]; then
            git checkout --ours "$BASE_DIRECTORY/.gitattributes" || true
            git add "$BASE_DIRECTORY/.gitattributes" || true
        fi

        # Preserve staging-only files
        for path in "${STAGING_ONLY_FILES[@]}"; do
            echo "Preserving staging-only: $path"
            git checkout origin/staging -- "$path" 2>/dev/null || git checkout --ours "$path" 2>/dev/null || true
            git add "$path" || true
        done

        # Exclude dev-only files
        for path in "${DEV_ONLY_FILES[@]}"; do
            echo "Ignoring dev-only: $path"
            if git ls-tree -r --name-only HEAD | grep -q "^${path#$BASE_DIRECTORY/}$"; then
                git checkout --ours "$path" 2>/dev/null || true
            else
                git rm -rf --cached "$path" 2>/dev/null || true
                rm -rf "$path" 2>/dev/null || true
            fi
            git add -A "$path" 2>/dev/null || true
        done

        # Prefer dev versions for allowed paths (even if deleted in staging)
        for path in "${PATHS[@]}"; do
            echo "Preferring dev version for: $path"

            # First try normal checkout of dev version
            git checkout --theirs -- "$path" 2>/dev/null || true

            # If missing (e.g., deleted by us), restore directly from dev
            if [ ! -e "$path" ]; then
                echo "Restoring missing $path from origin/development"
                mkdir -p "$(dirname "$path")" 2>/dev/null || true
                if git show "origin/development:$path" > "$path" 2>/dev/null; then
                    git add "$path"
                else
                    echo "⚠️  Could not restore $path (may not exist in dev branch)."
                fi
            else
                git add "$path" || true
            fi
        done

        git cherry-pick --continue || true
    fi
done

# === Final restore for staging-only files ===
echo "=== Restoring staging-only files to last known good state ==="
for path in "${STAGING_ONLY_FILES[@]}"; do
    git checkout origin/staging -- "$path" 2>/dev/null || true
    git add "$path" || true
done

# === Cleanup dev-only files just in case ===
echo "=== Cleaning up any stray dev-only files ==="
for path in "${DEV_ONLY_FILES[@]}"; do
    rm -rf "$path" 2>/dev/null || true
    git rm -rf --cached "$path" 2>/dev/null || true
done

# === Final force-resolve any remaining merge conflicts ===
if git ls-files -u | grep -q .; then
    echo "=== Force-resolving remaining merge conflicts ==="
    git add -A
fi

# === Merge summary ===
echo "=== Merge summary ==="
git status

CHANGED_FILES=$(git diff --cached --numstat | wc -l)
echo "They are $CHANGED_FILES staged files"

echo "✅ Development branch successfully merged into staging (safe mode)."
