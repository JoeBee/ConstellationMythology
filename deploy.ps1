# Heavenly Guidance - Deployment Script for Windows
# Version 1.0.3

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Heavenly Guidance Deployment Script" -ForegroundColor Cyan
Write-Host "   Version 1.0.3" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

$prerequisites = @{
    "Node.js" = "node"
    "npm" = "npm"
    "Capacitor CLI" = "npx"
}

$allPrerequisitesMet = $true
foreach ($prereq in $prerequisites.GetEnumerator()) {
    if (Test-Command $prereq.Value) {
        Write-Host "✅ $($prereq.Key) found" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $($prereq.Key) NOT found" -ForegroundColor Red
        $allPrerequisitesMet = $false
    }
}

Write-Host ""

if (-not $allPrerequisitesMet) {
    Write-Host "❌ Missing prerequisites. Please install required software." -ForegroundColor Red
    exit 1
}

# Ask user what to deploy
Write-Host "🎯 What would you like to deploy?" -ForegroundColor Cyan
Write-Host "1. Both Android and iOS"
Write-Host "2. Android only"
Write-Host "3. iOS only"
Write-Host "4. Just build web assets (no deployment)"
Write-Host ""
$choice = Read-Host "Enter your choice (1-4)"

# Step 1: Install dependencies
Write-Host ""
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Step 2: Build web assets
Write-Host ""
Write-Host "🏗️ Step 2: Building web assets..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web assets built successfully" -ForegroundColor Green

# Check if www folder exists
if (-not (Test-Path "www")) {
    Write-Host "❌ www folder not found. Build may have failed." -ForegroundColor Red
    exit 1
}

# Step 3: Sync Capacitor
Write-Host ""
Write-Host "🔄 Step 3: Syncing Capacitor..." -ForegroundColor Yellow

if ($choice -eq "1" -or $choice -eq "2") {
    Write-Host "Syncing Android..." -ForegroundColor Cyan
    npx cap sync android
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Android sync had issues" -ForegroundColor Yellow
    }
    else {
        Write-Host "✅ Android synced" -ForegroundColor Green
    }
}

if ($choice -eq "1" -or $choice -eq "3") {
    Write-Host "Syncing iOS..." -ForegroundColor Cyan
    npx cap sync ios
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ iOS sync had issues" -ForegroundColor Yellow
    }
    else {
        Write-Host "✅ iOS synced" -ForegroundColor Green
    }
}

if ($choice -eq "4") {
    Write-Host "✅ Web assets built. No platform sync needed." -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Build output location: www/" -ForegroundColor Cyan
    exit 0
}

# Step 4: Open platforms
Write-Host ""
Write-Host "🚀 Step 4: Opening native IDEs..." -ForegroundColor Yellow
Write-Host ""

if ($choice -eq "1" -or $choice -eq "2") {
    Write-Host "Would you like to open Android Studio now? (Y/N)" -ForegroundColor Cyan
    $openAndroid = Read-Host
    if ($openAndroid -eq "Y" -or $openAndroid -eq "y") {
        Write-Host "Opening Android Studio..." -ForegroundColor Cyan
        npx cap open android
        Write-Host ""
        Write-Host "📱 Next steps for Android:" -ForegroundColor Yellow
        Write-Host "1. In Android Studio: Build → Generate Signed Bundle / APK"
        Write-Host "2. Select 'Android App Bundle' (AAB) for Play Store"
        Write-Host "3. Use your signing key (key.properties)"
        Write-Host "4. Select 'release' build variant"
        Write-Host "5. Upload AAB to Google Play Console"
        Write-Host ""
    }
}

if ($choice -eq "1" -or $choice -eq "3") {
    Write-Host "Would you like to open Xcode now? (Y/N)" -ForegroundColor Cyan
    $openIos = Read-Host
    if ($openIos -eq "Y" -or $openIos -eq "y") {
        if ($IsMacOS) {
            Write-Host "Opening Xcode..." -ForegroundColor Cyan
            npx cap open ios
            Write-Host ""
            Write-Host "🍎 Next steps for iOS:" -ForegroundColor Yellow
            Write-Host "1. In Xcode: Update version to 1.0.3 and build number"
            Write-Host "2. Select 'Any iOS Device' as target"
            Write-Host "3. Product → Archive"
            Write-Host "4. Distribute App → App Store Connect"
            Write-Host "5. Complete submission in App Store Connect"
            Write-Host ""
        }
        else {
            Write-Host "⚠️ iOS development requires macOS and Xcode" -ForegroundColor Yellow
            Write-Host "📁 iOS project location: ios/App/App.xcworkspace" -ForegroundColor Cyan
        }
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Version Information:" -ForegroundColor Yellow
Write-Host "Version: 1.0.3" -ForegroundColor White
Write-Host "App ID: bcjj.Heavenly.Myths" -ForegroundColor White
Write-Host "App Name: Heavenly Guidance" -ForegroundColor White
Write-Host ""
Write-Host "📁 Build Outputs:" -ForegroundColor Yellow
Write-Host "Web: www/" -ForegroundColor White
Write-Host "Android AAB: android/app/build/outputs/bundle/release/app-release.aab" -ForegroundColor White
Write-Host "Android APK: android/app/build/outputs/apk/release/app-release.apk" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see DEPLOYMENT-GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️ IMPORTANT: Remember to test the app before submitting!" -ForegroundColor Yellow
Write-Host ""
