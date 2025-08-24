@echo off
REM GitRaven Publishing Script for Windows
setlocal enabledelayedexpansion

echo 🚀 Starting GitRaven publishing process...

REM Check if we're logged into npm
npm whoami >nul 2>&1
if errorlevel 1 (
    echo ❌ Not logged into npm. Please run: npm login
    exit /b 1
)

for /f %%i in ('npm whoami') do set NPM_USER=%%i
echo ✅ Logged into npm as: %NPM_USER%

REM Check for uncommitted changes
git status --porcelain >nul 2>&1
if not errorlevel 1 (
    for /f %%i in ('git status --porcelain') do (
        echo ❌ You have uncommitted changes. Please commit or stash them first.
        exit /b 1
    )
)

echo ✅ Working directory is clean

REM Get current version
for /f %%i in ('node -p "require('./package.json').version"') do set CURRENT_VERSION=%%i
echo 📦 Current version: %CURRENT_VERSION%

REM Ask for version bump type
echo 🔢 What type of version bump?
echo 1) patch (bug fixes)
echo 2) minor (new features)
echo 3) major (breaking changes)
echo 4) custom
echo 5) skip version bump

set /p choice="Enter choice [1-5]: "

if "%choice%"=="1" (
    echo 🔧 Bumping patch version...
    call npm version patch
) else if "%choice%"=="2" (
    echo 🔧 Bumping minor version...
    call npm version minor
) else if "%choice%"=="3" (
    echo 🔧 Bumping major version...
    call npm version major
) else if "%choice%"=="4" (
    set /p custom_version="Enter new version (e.g., 1.2.3): "
    echo 🔧 Setting version to !custom_version!...
    call npm version !custom_version!
) else if "%choice%"=="5" (
    echo ⏭️ Skipping version bump...
) else (
    echo ❌ Invalid choice
    exit /b 1
)

for /f %%i in ('node -p "require('./package.json').version"') do set NEW_VERSION=%%i
echo 📦 New version: %NEW_VERSION%

REM Run tests
echo 🧪 Running tests...
call bun test
if errorlevel 1 (
    echo ❌ Tests failed
    exit /b 1
)

REM Build the package
echo 🔨 Building package...
call bun run build:all
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)

REM Test the package locally
echo 📋 Testing package locally...
call npm pack

REM Ask for confirmation
echo 📤 Ready to publish GitRaven v%NEW_VERSION% to npm
set /p confirm="Continue with publishing? (y/N): "

if /i "%confirm%"=="y" (
    echo 🚀 Publishing to npm...
    call npm publish
    if errorlevel 1 (
        echo ❌ Publishing failed
        del gitraven-*.tgz 2>nul
        exit /b 1
    )
    
    echo ✅ Successfully published GitRaven v%NEW_VERSION%!
    echo 🌐 Package URL: https://www.npmjs.com/package/gitraven
    echo 📥 Install with: npm install -g gitraven
    echo 🔍 Test with: npx gitraven@%NEW_VERSION%
    
    REM Clean up
    del gitraven-*.tgz 2>nul
    
    REM Push git changes if version was bumped
    if not "%choice%"=="5" (
        echo 📤 Pushing git changes...
        git push
        git push --tags
    )
) else (
    echo ❌ Publishing cancelled
    del gitraven-*.tgz 2>nul
    exit /b 1
)

echo 🎉 All done!
