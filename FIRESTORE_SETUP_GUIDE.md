# Firestore Setup Guide

## Error: `[firestore/unavailable] The service is currently unavailable`

This error occurs because Firestore is not properly set up in your Firebase Console.

## Solution Steps:

### 1. Go to Firebase Console
- Open: https://console.firebase.google.com/
- Select your project: **hybridrpg-53f62**

### 2. Create Firestore Database
1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **Production mode** or **Test mode**:
   - **Test mode** (recommended for development): Allows all reads/writes for 30 days
   - **Production mode**: Requires security rules (see step 3)
4. Select a location (choose closest to you):
   - Example: `europe-west1` (Belgium) for Europe
   - Example: `us-central` for North America
5. Click **"Enable"**

### 3. Set Security Rules (Important!)

After creating the database, go to the **Rules** tab and set these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read/write their progress
    match /userProgress/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write workout sessions
    match /workoutSessions/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Public read for programs (if needed)
    match /programs/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

**Publish** the rules after adding them.

### 4. Verify Authentication is Enabled
1. Go to **Authentication** in the left sidebar
2. Click **"Get started"** if not already enabled
3. Go to **"Sign-in method"** tab
4. Enable **Email/Password** provider
5. Click **Save**

### 5. Test the Connection

After completing the above steps:
1. Stop the app: `Ctrl+C` in the terminal
2. Rebuild: `npx expo run:android --device`
3. Try to sign up/login again

## Troubleshooting

### If you still get the error:
1. **Wait 1-2 minutes** after creating the database (propagation time)
2. **Check Firebase Console** → Firestore → Data tab - you should see collections being created
3. **Verify internet** on your Android device
4. **Check Firebase status**: https://status.firebase.google.com/

### Verify Firestore is working:
```bash
# In Firebase Console → Firestore → Data tab
# You should see collections like:
# - users
# - workoutSessions (after completing a workout)
```

## Current Firebase Project Info
- **Project ID**: hybridrpg-53f62
- **Project Number**: 195554523219
- **Package Name**: com.fitnessrpg.app

## Next Steps After Setup
Once Firestore is enabled:
1. Users will be able to sign up/login
2. User data will be stored in `/users/{userId}`
3. Workout sessions will be stored in `/workoutSessions`
4. Progress will be tracked in `/userProgress`
