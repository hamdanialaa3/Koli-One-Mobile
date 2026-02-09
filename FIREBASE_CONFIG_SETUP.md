# 📱 Firebase Config Setup for Mobile App

**IMPORTANT:** Firebase config files should NEVER be committed to Git. They contain sensitive API keys.

## Setup Instructions

### Step 1: Get Firebase Config Files

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select the **fire-new-globul** project
3. Click **Project Settings** (gear icon)

### Step 2: Generate Android Config

1. Click **Your Apps** tab
2. Find the Android app (package: `com.kolioneauction.app`)
3. Click the app name
4. Click **google-services.json** to download
5. Save it as `google-services.json` (NOT in version control)

**File Location:**
```
mobile_new/google-services.json
```

### Step 3: Generate iOS Config

1. In the same **Your Apps** tab
2. Find the iOS app
3. Click the app name
4. Scroll down to **GoogleService-Info.plist**
5. Click to download
6. Save it as `GoogleService-Info.plist` (NOT in version control)

**File Location:**
```
mobile_new/GoogleService-Info.plist
```

### Step 4: Verify Files Are Ignored

Check `.gitignore` includes:
```gitignore
google-services.json
GoogleService-Info.plist
```

If not, they'll be automatically ignored (already configured).

### Step 5: Verify Files Exist Before Build

```bash
cd mobile_new/

# Check Android config
if [ -f google-services.json ]; then
  echo "✓ google-services.json found"
else
  echo "✗ google-services.json missing - download from Firebase Console"
fi

# Check iOS config
if [ -f GoogleService-Info.plist ]; then
  echo "✓ GoogleService-Info.plist found"
else
  echo "✗ GoogleService-Info.plist missing - download from Firebase Console"
fi
```

## ✅ Security Checklist

- [ ] `google-services.json` is in `.gitignore`
- [ ] `GoogleService-Info.plist` is in `.gitignore`
- [ ] Real config files are NOT committed
- [ ] Only `.template` files are in version control
- [ ] Config files are stored locally (`.gitignore` protected)
- [ ] Never share config files via chat/email

## 🚨 If Config Was Accidentally Committed

1. **Immediately regenerate all Firebase API keys** via Firebase Console
2. Follow [Git History Cleanup](./GIT_CLEANUP_MANUAL.sh) to remove from history
3. New keys will replace old ones automatically

## Using Template Files

Templates (`google-services.template.json`, `GoogleService-Info.template.plist`) are provided as references only. To use them:

1. Copy from template
2. Fill in your actual values from Firebase Console
3. Save as real file name (without `.template`)
4. Verify `.gitignore` protects them
5. Never commit the real files

