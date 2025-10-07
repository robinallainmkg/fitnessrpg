# Guest Mode Implementation Guide

## 🎯 Overview

This document describes the implementation of guest mode authentication flow that allows users to navigate the app and select programs without creating an account upfront. Account creation is deferred until the user wants to save their selected program.

## 📊 Flow Comparison

### Before (Old Flow)
```
App Launch → Onboarding → Auth Screen (Login/Signup) → ProgramSelection → App
```

### After (New Flow)
```
App Launch → Onboarding → ProgramSelection (Guest Mode) → [Signup Modal on Save] → App
                                                        ↓
                                              [Continue as Guest] → App (Limited)
```

## 🔧 Implementation Details

### 1. AuthContext Enhancements

**File**: `src/contexts/AuthContext.js`

**New State Variables**:
- `isGuest` (boolean): Indicates if user is in guest mode
- `guestData` (object): Stores temporary guest data before account creation

**New Functions**:

```javascript
// Activate guest mode
setGuestMode() → { success: boolean }

// Save temporary data for guest users
saveGuestData(data) → { success: boolean }

// Convert guest to authenticated user
convertGuestToUser(email, password) → { success: boolean, user?, error? }
```

**Key Features**:
- Guest mode state persists in AsyncStorage (`@fitnessrpg:guest_mode`)
- Guest data stored in AsyncStorage (`@fitnessrpg:guest_data`)
- Automatic data migration when converting guest to user
- Cleanup of temporary data after conversion

### 2. OnboardingScreen Updates

**File**: `src/screens/OnboardingScreen.js`

**Changes**:
- Import `useAuth` hook
- Call `setGuestMode()` when completing onboarding
- Navigate directly to `ProgramSelection` instead of Auth screen

**Code**:
```javascript
const handleFinish = async () => {
  await AsyncStorage.setItem('@fitnessrpg:onboarding_completed', 'true');
  await setGuestMode(); // Activate guest mode
  navigation.replace('ProgramSelection');
};
```

### 3. SignupModal Component (NEW)

**File**: `src/components/SignupModal.js`

**Features**:
- Beautiful modal UI with gradient header
- Email and password validation
- Password confirmation
- Info box explaining benefits of creating account
- "Continue as guest" option
- Calls `convertGuestToUser()` from AuthContext
- Automatic data migration on successful signup

**Props**:
```javascript
{
  visible: boolean,          // Show/hide modal
  onClose: function,         // Called when user cancels
  onSuccess: function,       // Called after successful signup
  guestData: object         // Data to migrate (optional)
}
```

### 4. ProgramSelectionScreen Updates

**File**: `src/screens/ProgramSelectionScreen.js`

**New State**:
- `showSignupModal` (boolean): Controls modal visibility
- `pendingProgramData` (object): Stores program selection for migration

**Flow Changes**:

```javascript
handleValidate() {
  // Check if guest mode
  if (isGuest) {
    // 1. Save program data to AsyncStorage
    await AsyncStorage.setItem('@fitnessrpg:guest_programs', JSON.stringify(programsData));
    
    // 2. Prepare data for migration
    const guestDataToSave = {
      programs: programsData,
      selectedPrograms: selectedPrograms,
      activePrograms: selectedPrograms.slice(0, 2),
      onboardingCompleted: true,
    };
    
    // 3. Save to AuthContext
    await saveGuestData(guestDataToSave);
    
    // 4. Show signup modal
    setShowSignupModal(true);
    return;
  }
  
  // Regular authenticated flow...
}
```

**Guest Data Loading**:
- On mount, check `isGuest` flag
- If guest, load programs from AsyncStorage instead of Firestore
- Pre-select previously chosen programs

### 5. App.js Navigation Logic

**File**: `App.js`

**Changes**:

```javascript
const AppNavigator = () => {
  const { user, isGuest } = useAuth(); // Added isGuest
  
  // Check onboarding for ALL users (authenticated, guest, anonymous)
  useEffect(() => {
    checkOnboarding();
  }, [user, isGuest]); // Added isGuest dependency
  
  // Updated navigation logic
  if (!user && !isGuest && !isOnboardingCompleted) {
    // Show Auth screen only if no user AND no guest AND no onboarding
    return <AuthScreen />;
  }
  
  if (!isOnboardingCompleted) {
    // Show onboarding (can be guest or anonymous)
    return <OnboardingScreen + ProgramSelection stack>;
  }
  
  // Show main app (authenticated OR guest)
  return <MainApp />;
}
```

**Key Points**:
- Guest users can access the full app
- Navigation doesn't require authenticated user anymore
- Onboarding completion is the main gate

### 6. ProfileScreen Updates

**File**: `src/screens/ProfileScreen.js`

**Guest Mode UI**:

For guests, show:
1. **Warning Banner**: Yellow warning explaining guest mode limitations
2. **Create Account Button**: Prominent CTA to convert to full user

```javascript
{isGuest ? (
  <View style={styles.logoutCard}>
    {/* Guest Warning */}
    <View style={styles.guestWarning}>
      <Text style={styles.guestWarningIcon}>⚠️</Text>
      <View>
        <Text style={styles.guestWarningTitle}>Mode invité</Text>
        <Text style={styles.guestWarningSubtitle}>
          Tes données ne sont pas sauvegardées de façon permanente
        </Text>
      </View>
    </View>
    
    {/* Create Account Button */}
    <TouchableOpacity onPress={() => setShowSignupModal(true)}>
      <Text>✨ Créer mon compte</Text>
    </TouchableOpacity>
  </View>
) : (
  // Regular logout button for authenticated users
)}
```

## 📦 AsyncStorage Keys

| Key | Purpose | Type |
|-----|---------|------|
| `@fitnessrpg:onboarding_completed` | Tracks onboarding completion | 'true' / null |
| `@fitnessrpg:guest_mode` | Indicates guest mode active | 'true' / null |
| `@fitnessrpg:guest_data` | Stores guest user data | JSON object |
| `@fitnessrpg:guest_programs` | Stores selected programs for guests | JSON object |

## 🔄 Data Migration Flow

When a guest converts to an authenticated user:

1. **User clicks "Create Account"** in ProfileScreen or ProgramSelection
2. **SignupModal appears** with email/password form
3. **User submits credentials**
4. **convertGuestToUser() executes**:
   ```javascript
   - Create Firebase Auth user
   - Retrieve guestData from AuthContext
   - Create Firestore document with merged data:
     {
       email, totalXP, globalLevel, etc.,
       ...guestData // Programs, progress, etc.
     }
   - Clear AsyncStorage guest keys
   - Set isGuest = false
   - Set user to new Firebase user
   ```
5. **Navigation to Main app**
6. **All guest data now persisted in Firestore**

## 🎨 User Experience

### Guest Mode Benefits
✅ Immediate access to app (no signup friction)  
✅ Can explore programs and features  
✅ Can select programs and navigate app  
✅ Data stored locally (temporary)

### Guest Mode Limitations
⚠️ Data not backed up to cloud  
⚠️ Can't access data from other devices  
⚠️ Data lost if app reinstalled  
⚠️ Persistent reminder to create account

### Conversion Incentives
The app prompts account creation at strategic moments:
1. **ProgramSelection**: Modal appears when saving program
2. **ProfileScreen**: Warning banner + CTA button always visible
3. **Future**: Could add prompts after X workouts, achievements, etc.

## 🔐 Security Considerations

- Guest data stored in AsyncStorage (unencrypted but local)
- No sensitive data stored for guests
- Email validation enforced during conversion
- Password minimum 6 characters (Firebase Auth requirement)
- All guest data cleared after successful conversion

## 🧪 Testing Checklist

### Guest Mode Entry
- [ ] Complete onboarding → Should activate guest mode
- [ ] Skip onboarding → Should activate guest mode
- [ ] Check AsyncStorage for `@fitnessrpg:guest_mode = 'true'`
- [ ] Verify navigation to ProgramSelection

### Program Selection (Guest)
- [ ] Select 1-2 programs
- [ ] Click validate → Signup modal should appear
- [ ] Data saved to AsyncStorage `@fitnessrpg:guest_programs`
- [ ] Cancel modal → Can continue as guest
- [ ] Close app and reopen → Programs still selected

### Account Conversion
- [ ] Open SignupModal from ProgramSelection or ProfileScreen
- [ ] Enter valid email + password
- [ ] Submit → Firebase user created
- [ ] Guest data migrated to Firestore
- [ ] AsyncStorage guest keys cleared
- [ ] isGuest flag set to false
- [ ] Navigation to Main app
- [ ] Programs visible in HomeScreen

### Profile Screen
- [ ] Guest mode → Shows warning banner
- [ ] Guest mode → Shows "Create Account" button
- [ ] Authenticated mode → Shows logout button
- [ ] Click create account → Modal appears
- [ ] Successful conversion → UI updates to authenticated state

### Edge Cases
- [ ] Cancel signup modal → Can continue using app
- [ ] Close app before signup → Guest data persists
- [ ] Email already in use → Error message shown
- [ ] Weak password → Error message shown
- [ ] Passwords don't match → Error message shown
- [ ] Network offline during conversion → Error handled gracefully

## 📝 Future Enhancements

### Potential Improvements
1. **Anonymous Auth**: Use Firebase Anonymous Auth instead of custom guest flag
2. **Link Anonymous to Email**: Use Firebase `linkWithCredential()` for seamless upgrade
3. **Social Login**: Add Google/Apple sign-in for guests
4. **Guest Expiration**: Auto-prompt signup after 7 days or X workouts
5. **Data Sync Status**: Show "Not synced" indicators for guest data
6. **Offline Mode**: Better handling of offline state for guests
7. **Guest Analytics**: Track conversion funnel and drop-off points

### Known Limitations
- Guest data not encrypted in AsyncStorage
- No cross-device sync for guests
- Manual data migration (could use Firebase Auth linking)
- Guest stats/progress not shown in ProgressScreen (needs AsyncStorage integration)

## 🐛 Troubleshooting

### Issue: Guest mode not activating
**Check**: `setGuestMode()` called in OnboardingScreen  
**Check**: AsyncStorage key `@fitnessrpg:guest_mode` set  
**Fix**: Verify import of `useAuth` in OnboardingScreen

### Issue: Signup modal not appearing
**Check**: `isGuest` flag correctly set in AuthContext  
**Check**: `showSignupModal` state in ProgramSelectionScreen  
**Fix**: Verify conditional logic in `handleValidate()`

### Issue: Data not migrating
**Check**: `guestData` saved in AuthContext before conversion  
**Check**: Firestore write permissions  
**Fix**: Ensure `saveGuestData()` called before showing modal

### Issue: Guest programs not loading
**Check**: AsyncStorage key `@fitnessrpg:guest_programs` exists  
**Check**: `loadExistingPrograms()` checks `isGuest` flag  
**Fix**: Verify AsyncStorage read in useEffect

## 📚 Related Files

- `src/contexts/AuthContext.js` - Guest mode state management
- `src/screens/OnboardingScreen.js` - Guest activation
- `src/screens/ProgramSelectionScreen.js` - Signup trigger
- `src/screens/ProfileScreen.js` - Conversion CTA
- `src/components/SignupModal.js` - Account creation UI
- `App.js` - Navigation logic

## 🎉 Success Metrics

Track these metrics to measure success:
- % of users completing onboarding as guest vs creating account upfront
- Conversion rate: guest → authenticated user
- Time to conversion (how long users stay in guest mode)
- Drop-off points (where users abandon signup)
- Retention: guest users vs authenticated users

---

**Last Updated**: 2025-10-05  
**Version**: 1.0  
**Author**: GitHub Copilot
