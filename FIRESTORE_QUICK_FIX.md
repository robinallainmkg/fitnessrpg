# 🚨 IMMEDIATE FIX FOR FIRESTORE ERROR

## The Problem
Your app shows: `[firestore/unavailable] The service is currently unavailable`

## The Solution (Most Likely)
**Your Firestore Security Rules are blocking access.**

---

## 🔥 FIX NOW (5 minutes)

### Step 1: Update Firebase Security Rules

1. **Open**: https://console.firebase.google.com/
2. **Select project**: `hybridrpg-53f62`
3. **Navigate**: Firestore Database → Rules (tab at top)
4. **Replace** current rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - each user can only access their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Companion sub-collection
      match /companion/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // User progress
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workout sessions
    match /workoutSessions/{sessionId} {
      allow read, write: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Programs (read-only)
    match /programs/{programId} {
      allow read: if request.auth != null;
    }
  }
}
```

5. **Click**: "Publish" button
6. **Wait**: 10 seconds for changes to propagate

---

### Step 2: Rebuild Your App

```powershell
# Stop Metro (Ctrl+C in terminal)

# Clear cache and restart
npx expo start --clear

# In a NEW terminal window, rebuild Android
npx expo run:android --device
```

---

### Step 3: Test the App

1. **Open app** on your device/emulator
2. **Log in** with your account
3. **Watch Metro terminal** for these messages:

**✅ SUCCESS - You should see:**
```
✅ Firestore offline persistence enabled
✅ User authenticated: <your-uid>
✅ Can read own user document
🔍 Active program IDs from Firestore: [...]
📊 Active programs data: [...]
```

**❌ STILL FAILING - You'll see:**
```
❌ Cannot read user document: firestore/permission-denied
🔥 FIRESTORE UNAVAILABLE
```

---

## 🧪 Test Firestore Connection (Optional)

Add this test button to any screen:

```javascript
import FirestoreTestButton from '../components/FirestoreTestButton';

// In your screen's render:
<FirestoreTestButton />
```

This will show:
- ✅ Authentication status
- ✅ Read permissions
- ✅ Write permissions
- ❌ Any errors

---

## 📝 What Changed in Your Code

### Files Modified:
1. ✅ `src/screens/HomeScreen.js` - Better error handling
2. ✅ `src/utils/firestoreRetry.js` - More retries (3→5)
3. ✅ Created `src/utils/firestoreDiagnostic.js` - Test tool
4. ✅ Created `src/components/FirestoreTestButton.js` - UI test component

### What It Does:
- **More resilient**: 5 retry attempts instead of 3
- **Better errors**: Shows specific error codes in logs
- **Fallback**: Sets empty arrays instead of crashing
- **Diagnostic**: New tool to test connectivity

---

## 🆘 Still Not Working?

### Check These:

1. **Did rules publish?**
   - Go back to Firebase Console → Firestore → Rules
   - Make sure you see "Last updated: just now"

2. **Are you logged in?**
   - Log out completely
   - Force close app
   - Log back in

3. **Network issues?**
   - Check your internet connection
   - Try restarting your router
   - Try mobile data instead of WiFi

4. **Emulator issues?**
   - Try on a real Android device
   - Restart emulator

---

## 📞 Get More Help

If still not working, run the diagnostic and share the output:

```javascript
import { printDiagnosticReport } from '../utils/firestoreDiagnostic';

// In a useEffect or button press
await printDiagnosticReport();
```

Then copy the console output and we can debug further.

---

## Summary

**Root cause**: Firestore security rules blocking your app  
**Fix**: Update rules in Firebase Console  
**Test**: Rebuild app and check Metro logs  
**Time**: ~5 minutes total  

Good luck! 🚀
