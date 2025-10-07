# Firestore "Unavailable" Error - Troubleshooting Guide

## Error Message
```
[firestore/unavailable] The service is currently unavailable. This is a most likely a transient condition and may be corrected by retrying with a backoff.
```

## What This Error Means
This error occurs when your app cannot connect to Firestore. Even with retry logic (5 retries with exponential backoff), the connection is failing.

## Most Common Causes & Solutions

### 🔴 CAUSE 1: Firestore Security Rules (80% of cases)

Your Firestore security rules are likely blocking access. 

**How to Fix:**

1. Open Firebase Console: https://console.firebase.google.com/
2. Select project: `hybridrpg-53f62`
3. Go to **Firestore Database** → **Rules** tab
4. Replace your current rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Allow authenticated users to read/write their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Companion sub-collection
      match /companion/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // User progress collection
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workout sessions
    match /workoutSessions/{sessionId} {
      allow read, write: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Programs (read-only for all authenticated users)
    match /programs/{programId} {
      allow read: if request.auth != null;
    }
  }
}
```

5. Click **Publish**
6. Rebuild your app

---

### 🔴 CAUSE 2: Network Issues (Emulator vs Device)

**If using Android Emulator:**
- Firestore connects to real Firebase servers, not localhost
- Emulator needs internet access
- Check your computer's internet connection

**Solution:**
```powershell
# Restart Metro bundler
npx expo start --clear

# Rebuild app
npx expo run:android --device
```

---

### 🔴 CAUSE 3: Authentication Token Expired

**Solution:**
1. Log out of the app completely
2. Force close the app
3. Reopen and log back in
4. Try again

---

### 🔴 CAUSE 4: Firebase Configuration Mismatch

**Verify Configuration:**

1. Check `android/app/google-services.json`:
   ```powershell
   Get-Content android\app\google-services.json | Select-String "project_id"
   ```
   Should show: `"project_id": "hybridrpg-53f62"`

2. Check `android/app/build.gradle`:
   ```powershell
   Get-Content android\app\build.gradle | Select-String "applicationId"
   ```
   Should show: `applicationId 'com.fitnessrpg.app'`

3. Verify these match in Firebase Console → Project Settings → Your apps

---

## Testing & Diagnostics

### Run Firestore Diagnostic Test

Add this to your `HomeScreen.js` or any screen to test connectivity:

```javascript
import { printDiagnosticReport } from '../utils/firestoreDiagnostic';

// Add this in a useEffect or button press
useEffect(() => {
  printDiagnosticReport();
}, []);
```

This will print a detailed report in your console showing:
- ✅ Authentication status
- ✅ Read permissions
- ✅ Write permissions  
- ❌ Any errors encountered

---

## Step-by-Step Fix Procedure

### Step 1: Update Security Rules
1. Go to Firebase Console
2. Update Firestore Rules (see above)
3. Publish rules

### Step 2: Verify Firebase Config
```powershell
# Check project ID
Get-Content android\app\google-services.json | Select-String "project_id"

# Should show: hybridrpg-53f62
```

### Step 3: Clean Build
```powershell
# Clear Metro cache
npx expo start --clear

# Clean Android build
cd android
.\gradlew clean
cd ..

# Rebuild
npx expo run:android --device
```

### Step 4: Test App
1. Open app on device/emulator
2. Log in with existing account
3. Check Metro logs for diagnostic messages
4. Look for:
   - ✅ "User authenticated"
   - ✅ "Can read own user document"
   - ✅ "Can write to own user document"

---

## Updates Made to Your Code

### ✅ Enhanced Error Handling
- Better error messages in `HomeScreen.js`
- Specific error codes displayed
- Fallback values to prevent UI crashes

### ✅ Increased Retry Resilience  
- Retry attempts increased from 3 → 5
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Located in: `src/utils/firestoreRetry.js`

### ✅ New Diagnostic Tool
- Created: `src/utils/firestoreDiagnostic.js`
- Tests authentication, read, and write permissions
- Provides actionable recommendations

---

## What to Check in Metro Logs

After rebuilding, look for these messages:

**Good signs:**
```
✅ Firestore offline persistence enabled
✅ User authenticated: <uid>
✅ Can read own user document
✅ Can write to own user document
🔍 Active program IDs from Firestore: [...]
📊 Active programs data: [...]
```

**Bad signs:**
```
❌ User not authenticated
❌ Cannot read user document: firestore/permission-denied
❌ Cannot write user document: firestore/unavailable
🔥 FIRESTORE UNAVAILABLE - Vérifiez: ...
```

---

## Emergency Fallback Rules (Testing Only)

**⚠️ ONLY FOR TESTING - NOT FOR PRODUCTION**

If you need to quickly test if it's a rules issue:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This allows all authenticated users to read/write everything. Use ONLY for testing!

---

## Still Not Working?

If after all these steps it still doesn't work:

1. **Check Firebase Status**: https://status.firebase.google.com/
2. **Verify your Firebase project is active** (not disabled)
3. **Check Firebase Billing** (Firestore requires Blaze plan for production)
4. **Try a different network** (corporate/school networks may block Firebase)
5. **Test on a real device** (not just emulator)

---

## Quick Reference Commands

```powershell
# Clear and restart Metro
npx expo start --clear

# Rebuild Android
npx expo run:android --device

# Check Firebase project ID
Get-Content android\app\google-services.json | Select-String "project_id"

# View Android logs
adb logcat *:S ReactNative:V ReactNativeJS:V
```

---

## Next Steps

1. ✅ Update Firestore Security Rules in Firebase Console
2. ✅ Rebuild the app
3. ✅ Test with the diagnostic tool
4. ✅ Monitor Metro logs for errors
5. ✅ Report back with any new error messages
