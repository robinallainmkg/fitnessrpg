# Authentication System Documentation

## Overview

The authentication system uses **Firebase Phone Authentication** as the primary method, with support for guest mode. Admin privileges are granted based on phone number verification.

## Architecture

### Core Components

- **`src/contexts/AuthContext.js`** - React Context managing authentication state
- **`src/components/PhoneAuthModal.js`** - Phone authentication UI
- **Firebase Auth** - Backend authentication service

### Authentication Flow

```
┌─────────────┐
│   App Start │
└──────┬──────┘
       │
       v
┌──────────────────────┐
│ Check Auth State     │
│ (onAuthStateChanged) │
└──────┬───────────────┘
       │
       ├──> Authenticated ──> Load User Data ──> Main App
       │
       └──> Not Authenticated
              │
              ├──> Guest Mode (limited features)
              │
              └──> Phone Login
                    │
                    ├──> Send OTP (6-digit code)
                    │
                    ├──> Verify OTP
                    │
                    └──> Success ──> Create User Document ──> Main App
```

## User Types

### 1. Authenticated Users

Users who sign in with phone number verification.

**Features:**
- Full access to all app features
- Progress saved to Firestore
- Challenge submissions
- XP and level tracking

**Database Structure:**
```javascript
// Firestore: users/{userId}
{
  phoneNumber: "+33679430759",
  createdAt: Timestamp,
  totalXP: 0,
  level: 1,
  activePrograms: [],
  completedChallenges: [],
  avatar: "default_avatar.png"
}
```

### 2. Admin Users

Special authenticated users with admin privileges.

**Detection:** Phone number-based check
```javascript
// In ProfileScreen.js
const isAdmin = userData.phoneNumber === '+33679430759';
```

**Admin-Only Features:**
- Access to AdminReviewScreen
- Challenge submission validation
- Video review and approval/rejection
- User management (future)

### 3. Guest Users

Users without authentication (limited mode).

**Limitations:**
- No progress persistence
- No challenge submissions
- No leaderboards
- Local-only data

## Implementation Details

### AuthContext

The central authentication manager.

**State:**
```javascript
{
  user: null | FirebaseUser,           // Firebase auth user object
  loading: true | false,               // Initial auth check
  isGuest: true | false,               // Guest mode flag
  userData: null | UserDocument        // Firestore user data
}
```

**Methods:**

#### `signInWithPhone(phoneNumber)`
Initiates phone authentication flow.

```javascript
// Usage
await signInWithPhone('+33679430759');
// User receives SMS with 6-digit code
```

#### `verifyOTP(verificationId, code)`
Verifies the OTP code sent via SMS.

```javascript
// Usage
await verifyOTP(verificationId, '123456');
// On success: user is authenticated
```

#### `signInAsGuest()`
Enables guest mode (no Firebase authentication).

```javascript
// Usage
await signInAsGuest();
// User can explore app with limited features
```

#### `logout()`
Signs out the current user.

```javascript
// Usage
await logout();
// Clears auth state and returns to login screen
```

#### `createUserDocument(userId, phoneNumber)`
Creates initial Firestore document for new users.

```javascript
// Auto-called after first successful phone login
{
  phoneNumber: phoneNumber,
  createdAt: FieldValue.serverTimestamp(),
  totalXP: 0,
  level: 1,
  activePrograms: [],
  completedChallenges: [],
  avatar: 'default_avatar.png'
}
```

## Phone Authentication Setup

### Firebase Console Configuration

1. **Enable Phone Authentication**
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable "Phone" provider
   - Add authorized domains

2. **Android SHA-256 Certificate**
   - Generate debug keystore SHA-256:
     ```bash
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
   - Add to Firebase Project Settings > Android apps

3. **reCAPTCHA Configuration** (for web/testing)
   - Automatically handled by Firebase
   - Uses invisible reCAPTCHA on Android

### Code Configuration

**android/app/build.gradle**
```gradle
dependencies {
    implementation(platform("com.google.firebase:firebase-bom:33.0.0"))
    implementation("com.google.firebase:firebase-auth")
}
```

**app.json**
```json
{
  "expo": {
    "android": {
      "package": "com.fitnessrpg.app",
      "googleServicesFile": "./android/app/google-services.json"
    }
  }
}
```

## Security Considerations

### ⚠️ Sensitive Files

**NEVER commit to Git:**
- `android/app/google-services.json` - Contains Firebase project credentials
- `android/app/*.keystore` - App signing keys

**Backup securely:**
- Store in password manager
- External encrypted drive
- Secure cloud storage (encrypted)

### Admin Authorization

Current implementation uses phone-based admin detection:

```javascript
// Simple but not scalable
isAdmin = phoneNumber === '+33679430759'
```

**Future Improvements:**
- Custom Firebase claims
- Firestore-based role system
- Admin dashboard for role management

### Phone Number Validation

Firebase handles validation, but pre-validation is recommended:

```javascript
function isValidPhoneNumber(phone) {
  // E.164 format: +[country][number]
  const regex = /^\+[1-9]\d{1,14}$/;
  return regex.test(phone);
}
```

## User Session Management

### Session Persistence

Firebase Auth automatically persists sessions:

```javascript
// Automatically restored on app restart
auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    loadUserData(user.uid);
  } else {
    // User is signed out
    showLoginScreen();
  }
});
```

### Token Refresh

Firebase handles token refresh automatically. Tokens expire after 1 hour but are refreshed silently.

## Error Handling

### Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/invalid-phone-number` | Invalid format | Validate phone number format |
| `auth/invalid-verification-code` | Wrong OTP | Ask user to re-enter code |
| `auth/too-many-requests` | Rate limit | Implement cooldown timer |
| `auth/network-request-failed` | No internet | Check connectivity |

### Error Handling Example

```javascript
try {
  await signInWithPhone(phoneNumber);
} catch (error) {
  switch (error.code) {
    case 'auth/invalid-phone-number':
      Alert.alert('Erreur', 'Numéro de téléphone invalide');
      break;
    case 'auth/too-many-requests':
      Alert.alert('Erreur', 'Trop de tentatives. Réessayez plus tard.');
      break;
    default:
      Alert.alert('Erreur', error.message);
  }
}
```

## Testing

### Test Phone Numbers (Firebase Console)

For development, add test phone numbers in Firebase Console:

```
Phone: +33 6 00 00 00 01
Code: 123456
```

**Benefits:**
- No SMS charges
- Predictable OTP
- Faster testing

### Testing Guest Mode

```javascript
// In development
<Button title="Mode Invité" onPress={() => signInAsGuest()} />
```

## Migration Guide

### From Guest to Authenticated

When a guest user decides to create an account:

```javascript
async function convertGuestToUser(phoneNumber) {
  // 1. Save guest data locally
  const guestData = await AsyncStorage.getItem('guestUserData');
  
  // 2. Authenticate with phone
  await signInWithPhone(phoneNumber);
  await verifyOTP(verificationId, code);
  
  // 3. Migrate data to Firestore
  const parsedData = JSON.parse(guestData);
  await firestore()
    .collection('users')
    .doc(auth().currentUser.uid)
    .set({
      ...parsedData,
      phoneNumber: phoneNumber,
      migratedFromGuest: true,
      createdAt: FieldValue.serverTimestamp()
    });
  
  // 4. Clear guest flag
  setIsGuest(false);
}
```

## Troubleshooting

### Issue: SMS not received

**Causes:**
- Invalid phone number format
- Carrier blocking automated SMS
- Firebase quota exceeded
- Phone number already registered

**Solutions:**
- Use test phone numbers for development
- Check Firebase quota in console
- Verify phone number format (+33...)
- Check spam/blocked messages

### Issue: Token expired

Firebase tokens expire after 1 hour. Auto-refresh usually handles this, but manual refresh is possible:

```javascript
const refreshedToken = await auth().currentUser.getIdToken(true);
```

### Issue: User document not created

Check Firestore rules allow document creation:

```javascript
// firestore.rules
match /users/{userId} {
  allow create: if request.auth != null && request.auth.uid == userId;
  allow read, update: if request.auth != null && request.auth.uid == userId;
}
```

## Best Practices

1. **Always validate phone numbers** before sending to Firebase
2. **Implement rate limiting** to prevent abuse
3. **Use test phone numbers** during development
4. **Never hardcode admin phone numbers** - use Firestore configuration
5. **Handle all error cases** with user-friendly messages
6. **Implement session timeout** for security
7. **Log authentication events** for debugging

## Code Examples

### Complete Authentication Flow

```javascript
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

function PhoneLogin() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const { signInWithPhone, verifyOTP } = useAuth();

  const handleSendCode = async () => {
    try {
      const vid = await signInWithPhone(phone);
      setVerificationId(vid);
      Alert.alert('Code envoyé', 'Vérifiez vos SMS');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await verifyOTP(verificationId, code);
      // User is now authenticated
    } catch (error) {
      Alert.alert('Code invalide', 'Vérifiez le code et réessayez');
    }
  };

  return (
    // UI implementation
  );
}
```

## Future Enhancements

- [ ] Social authentication (Google, Apple)
- [ ] Email/password authentication
- [ ] Two-factor authentication (2FA)
- [ ] Biometric authentication (Face ID, Touch ID)
- [ ] Role-based access control (RBAC)
- [ ] Admin dashboard for user management
- [ ] Audit logs for authentication events

---

**Last Updated:** 2024-01-XX  
**Version:** 1.0  
**Maintainer:** Robin Allain
