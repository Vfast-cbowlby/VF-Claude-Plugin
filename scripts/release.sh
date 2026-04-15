#!/usr/bin/env bash
set -euo pipefail

# Release script for bumping plugin version
# Usage: ./scripts/release.sh VERSION [--ci]
#
# --ci: Skip branch and working-tree checks (for use in GitHub Actions)

VERSION="${1:-}"
CI_MODE=false
for arg in "$@"; do [[ "$arg" == "--ci" ]] && CI_MODE=true; done

ROOT_PACKAGE_JSON="package.json"
PLUGIN_JSON=".claude-plugin/plugin.json"
MARKETPLACE_JSON=".claude-plugin/marketplace.json"
OPENCODE_PACKAGE_JSON=".opencode/package.json"

# Function to show usage
usage() {
  echo "Usage: $0 VERSION [--ci]"
  echo "Example: $0 1.5.0"
  exit 1
}

# Validate VERSION is provided
if [[ -z "$VERSION" ]]; then
  echo "Error: VERSION argument is required"
  usage
fi

# Validate VERSION is semver format (X.Y.Z)
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: VERSION must be in semver format (e.g., 1.5.0)"
  exit 1
fi

if [[ "$CI_MODE" == false ]]; then
  # Check current branch is main (local only — CI checkout is detached or named by runner)
  CURRENT_BRANCH=$(git branch --show-current)
  if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo "Error: Must be on main branch (currently on $CURRENT_BRANCH)"
    exit 1
  fi

  # Check working tree is clean
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Error: Working tree is not clean. Commit or stash changes first."
    exit 1
  fi
fi

# Verify versioned manifests exist
for FILE in "$ROOT_PACKAGE_JSON" "$PLUGIN_JSON" "$MARKETPLACE_JSON" "$OPENCODE_PACKAGE_JSON"; do
  if [[ ! -f "$FILE" ]]; then
    echo "Error: $FILE not found"
    exit 1
  fi
done

# Read current version from plugin.json
OLD_VERSION=$(grep -oE '"version": *"[^"]*"' "$PLUGIN_JSON" | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
if [[ -z "$OLD_VERSION" ]]; then
  echo "Error: Could not extract current version from $PLUGIN_JSON"
  exit 1
fi
echo "Bumping version: $OLD_VERSION -> $VERSION"

# Build and verify the packaged OpenCode payload before mutating any manifest
# versions or creating a tag. This keeps a broken npm artifact from being
# released via the manual script path.
echo "Verifying OpenCode build and npm pack payload..."
node scripts/build-opencode.js
node tests/scripts/build-opencode.test.js

update_version() {
  local file="$1"
  local pattern="$2"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "$pattern" "$file"
  else
    sed -i "$pattern" "$file"
  fi
}

# Update all shipped package/plugin manifests
update_version "$ROOT_PACKAGE_JSON" "s|\"version\": *\"[^\"]*\"|\"version\": \"$VERSION\"|"
update_version "$PLUGIN_JSON" "s|\"version\": *\"[^\"]*\"|\"version\": \"$VERSION\"|"
update_version "$MARKETPLACE_JSON" "0,/\"version\": *\"[^\"]*\"/s|\"version\": *\"[^\"]*\"|\"version\": \"$VERSION\"|"
update_version "$OPENCODE_PACKAGE_JSON" "s|\"version\": *\"[^\"]*\"|\"version\": \"$VERSION\"|"

# Regenerate lock files so npm ci in CI does not fail on version mismatch
echo "Regenerating package-lock.json..."
npm install --package-lock-only --no-audit --no-fund 2>/dev/null
echo "Regenerating .opencode/package-lock.json..."
npm install --package-lock-only --no-audit --no-fund --prefix .opencode 2>/dev/null

# Stage, commit, tag, and push
git add "$ROOT_PACKAGE_JSON" "$PLUGIN_JSON" "$MARKETPLACE_JSON" "$OPENCODE_PACKAGE_JSON" \
        package-lock.json .opencode/package-lock.json
git commit -m "chore: bump plugin version to $VERSION"
git tag "v$VERSION"
git push origin main "v$VERSION"

echo "Released v$VERSION"
