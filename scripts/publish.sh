#!/bin/bash

# GitRaven Publishing Script
set -e

echo "🚀 Starting GitRaven publishing process..."

# Check if we're logged into npm
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Not logged into npm. Please run: npm login"
    exit 1
fi

echo "✅ Logged into npm as: $(npm whoami)"

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

echo "✅ Working directory is clean"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"

# Ask for version bump type
echo "🔢 What type of version bump?"
echo "1) patch (bug fixes: $CURRENT_VERSION -> $(npm version --no-git-tag-version patch && npm version --no-git-tag-version $CURRENT_VERSION))"
echo "2) minor (new features: $CURRENT_VERSION -> $(npm version --no-git-tag-version minor && npm version --no-git-tag-version $CURRENT_VERSION))"
echo "3) major (breaking changes: $CURRENT_VERSION -> $(npm version --no-git-tag-version major && npm version --no-git-tag-version $CURRENT_VERSION))"
echo "4) custom"
echo "5) skip version bump"

read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo "🔧 Bumping patch version..."
        npm version patch
        ;;
    2)
        echo "🔧 Bumping minor version..."
        npm version minor
        ;;
    3)
        echo "🔧 Bumping major version..."
        npm version major
        ;;
    4)
        read -p "Enter new version (e.g., 1.2.3): " custom_version
        echo "🔧 Setting version to $custom_version..."
        npm version $custom_version
        ;;
    5)
        echo "⏭️ Skipping version bump..."
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

NEW_VERSION=$(node -p "require('./package.json').version")
echo "📦 New version: $NEW_VERSION"

# Run tests
echo "🧪 Running tests..."
bun test

# Build the package
echo "🔨 Building package..."
bun run build:all

# Test the package locally
echo "📋 Testing package locally..."
npm pack

# Ask for confirmation
echo "📤 Ready to publish GitRaven v$NEW_VERSION to npm"
read -p "Continue with publishing? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    echo "🚀 Publishing to npm..."
    npm publish
    
    echo "✅ Successfully published GitRaven v$NEW_VERSION!"
    echo "🌐 Package URL: https://www.npmjs.com/package/gitraven"
    echo "📥 Install with: npm install -g gitraven"
    echo "🔍 Test with: npx gitraven@$NEW_VERSION"
    
    # Clean up
    rm -f gitraven-*.tgz
    
    # Push git changes if version was bumped
    if [[ $choice != "5" ]]; then
        echo "📤 Pushing git changes..."
        git push
        git push --tags
    fi
else
    echo "❌ Publishing cancelled"
    # Clean up
    rm -f gitraven-*.tgz
    exit 1
fi

echo "🎉 All done!"
