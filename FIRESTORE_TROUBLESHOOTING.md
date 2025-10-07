# Firestore Connection Troubleshooting

## ⚠️ LATEST ERROR (2025-10-05)
**Error:** `[firestore/unavailable] The service is currently unavailable`
**Location:** `HomeScreen.js:369` in `loadActiveProgramsAndQueue()`

**Quick Fix:** See detailed guide in `FIRESTORE_UNAVAILABLE_FIX.md`

---

## Current Status
✅ Firestore database exists (confirmed from screenshot)
✅ Collections created: `users`, `userProgress`, `workoutSessions`
✅ User data exists with email: `robinallainmkg@gmail.com`
✅ Retry logic implemented (5 retries with exponential backoff)
✅ Offline persistence enabled
✅ Enhanced error handling added
✅ Diagnostic tool created

## Recent Updates (2025-10-05)

### Code Improvements
1. **Enhanced error handling** in `HomeScreen.js`:
   - Better error messages
   - Specific error code logging
   - Fallback values to prevent UI crashes

2. **Increased retry resilience** in `firestoreRetry.js`:
   - Retry attempts: 3 → 5
   - Exponential backoff: 1s, 2s, 4s, 8s, 16s

3. **New diagnostic tool** (`firestoreDiagnostic.js`):
   - Tests authentication
   - Tests read permissions
   - Tests write permissions
   - Provides recommendations

---

## Error Being Experienced
`[firestore/unavailable] The service is currently unavailable`

## Most Likely Causes

### 1. **Security Rules Are Too Restrictive** (Most Common)
Your Firestore rules might be blocking access even for authenticated users.

**How to Fix:**
1. Go to Firebase Console → Firestore Database
2. Click **"Rules"** tab
3. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow user to access their companion sub-collection
      match /companion/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Allow authenticated users to access user progress
    match /userProgress/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to access workout sessions
    match /workoutSessions/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **"Publish"**

### 2. **Network/Connectivity Issues**
Sometimes Firebase servers have temporary outages or network issues.

**Solutions Applied:**
- ✅ Added retry logic with exponential backoff (3 retries)
- ✅ Added offline persistence to Firestore
- ✅ HomeScreen now uses `getWithRetry()`
- ✅ ProgressScreen now uses `getWithRetry()`

### 3. **Authentication Token Expired**
If the user's auth token is expired, Firestore requests may fail.

**How to Test:**
1. Log out completely
2. Log back in
3. Try accessing data again

### 4. **Firebase App Not Properly Initialized**
Sometimes the Firebase app needs to be explicitly initialized.

**Already Fixed:**
- ✅ Firestore settings configured in `src/config/firebase.js`
- ✅ Offline persistence enabled

## What To Check Now

### A. Check Your Firestore Rules
1. Open Firebase Console
2. Go to Firestore Database → Rules
3. **Share your current rules** so we can verify they're correct

### B. Check Firebase Console for Errors
1. Go to Firebase Console → Firestore Database
2. Look for any error messages or warnings

### C. Test Connection
Try this in your app:
1. Log out if logged in
2. Sign up with a new account (or log in with existing)
3. Check if data loads

## Expected Behavior After Fixes
- App will retry Firestore operations up to 3 times with increasing delays
- If network is temporarily down, it will succeed on retry
- Offline persistence allows viewing cached data while offline
- Better error messages in console

## Next Steps
1. **Check and update your Firestore security rules** (see above)
2. **Rebuild the app**: `npx expo run:android --device`
3. **Test login/signup**
4. If still failing, share the console logs so we can diagnose further
