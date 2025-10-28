# Challenge du Jour Documentation

## Overview

The **Challenge du Jour** (Daily Challenge) system is a gamification feature that offers users daily fitness challenges with video submission and admin validation. Users record their performance, submit videos, and earn XP rewards upon approval.

## Architecture

### Core Components

```
src/
├── contexts/
│   └── ChallengeContext.tsx          # Challenge state management
├── screens/
│   ├── ChallengeScreen.tsx           # User submission interface
│   └── AdminReviewScreen.tsx         # Admin validation interface
├── services/
│   ├── ChallengeService.ts           # Firestore operations
│   └── StorageService.ts             # Firebase Storage (video uploads)
├── hooks/
│   └── useVideoPicker.ts             # Native camera integration
└── data/
    └── challenges.ts                 # Challenge definitions
```

### Data Flow

```
┌──────────────┐
│  User Opens  │
│  Challenge   │
└──────┬───────┘
       │
       v
┌────────────────────┐
│ Load Today's       │
│ Challenge (daily)  │
└──────┬─────────────┘
       │
       v
┌────────────────────┐
│ Record Video       │
│ (Native Camera)    │
└──────┬─────────────┘
       │
       v
┌────────────────────┐
│ Upload to          │
│ Firebase Storage   │
└──────┬─────────────┘
       │
       v
┌────────────────────┐
│ Create Submission  │
│ (Firestore)        │
└──────┬─────────────┘
       │
       v
┌────────────────────┐      ┌──────────────┐
│ Status: pending    │────>│ Admin Review │
└────────────────────┘      └──────┬───────┘
                                   │
                    ┌──────────────┴──────────────┐
                    v                             v
            ┌───────────────┐           ┌────────────────┐
            │   Approved    │           │   Rejected     │
            │   +100 XP     │           │   No XP        │
            └───────────────┘           └────────────────┘
```

## Challenge System

### Challenge Structure

**File:** `src/data/challenges.ts`

```typescript
interface Challenge {
  id: string;                // Unique identifier
  title: string;             // Challenge name
  description: string;       // Instructions
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;          // XP given on approval
  requirements: string[];    // List of requirements
  videoRequired: boolean;    // Always true
  category: string;          // 'strength' | 'endurance' | 'flexibility'
  estimatedTime: number;     // Minutes
}
```

**Example Challenge:**

```typescript
{
  id: '1min_planche',
  title: '1 Minute de Planche',
  description: 'Tenez une position de planche parfaite pendant 1 minute',
  difficulty: 'medium',
  xpReward: 100,
  requirements: [
    'Position droite du dos',
    'Coudes à 90 degrés',
    'Pas de pause'
  ],
  videoRequired: true,
  category: 'strength',
  estimatedTime: 2
}
```

### Daily Challenge Selection

Challenges rotate daily based on date:

```typescript
function getTodayChallenge() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const challengeIndex = hashDate(today) % challenges.length;
  return challenges[challengeIndex];
}
```

## Video Submission Flow

### 1. Native Camera Integration

**Hook:** `src/hooks/useVideoPicker.ts`

Uses `expo-image-picker` for native OS camera:

```typescript
import * as ImagePicker from 'expo-image-picker';

export function useVideoPicker() {
  const recordVideo = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée');
      return null;
    }

    // Launch native camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 60,  // 60 seconds max
      quality: 0.8,          // Balance quality/size
      allowsEditing: false,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  return { recordVideo };
}
```

**Benefits:**
- ✅ Native OS camera UI (familiar to users)
- ✅ Automatic permission handling
- ✅ Video compression built-in
- ✅ Works on iOS and Android
- ✅ No custom camera UI to maintain

### 2. Video Upload

**Service:** `src/services/StorageService.ts`

Uploads video to Firebase Storage with progress tracking:

```typescript
import * as FileSystem from 'expo-file-system/legacy';
import storage from '@react-native-firebase/storage';

async function uploadChallengeVideo(
  userId: string,
  challengeId: string,
  videoUri: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Generate unique filename
  const timestamp = Date.now();
  const filename = `challenges/${userId}/${challengeId}_${timestamp}.mp4`;
  
  // Read file as blob
  const fileInfo = await FileSystem.getInfoAsync(videoUri);
  const blob = await FileSystem.readAsStringAsync(videoUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  // Upload to Firebase Storage
  const ref = storage().ref(filename);
  const task = ref.putString(blob, 'base64', {
    contentType: 'video/mp4',
  });
  
  // Track progress
  task.on('state_changed', (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    onProgress?.(progress);
  });
  
  await task;
  
  // Get download URL
  const downloadURL = await ref.getDownloadURL();
  return downloadURL;
}
```

**Note:** Uses `expo-file-system/legacy` to avoid deprecation warnings in Expo SDK 54+.

### 3. Submission Creation

**Service:** `src/services/ChallengeService.ts`

Creates submission document in Firestore:

```typescript
async function submitChallenge(
  userId: string,
  challengeId: string,
  videoURL: string
): Promise<void> {
  await firestore()
    .collection('challengeSubmissions')
    .add({
      userId: userId,
      challengeId: challengeId,
      videoURL: videoURL,
      status: 'pending',           // 'pending' | 'approved' | 'rejected'
      submittedAt: FieldValue.serverTimestamp(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
    });
}
```

## Admin Validation System

### Admin Access Control

**Phone-Based Admin Detection:**

File: `src/screens/ProfileScreen.js`

```javascript
const loadUserStats = async () => {
  const userData = await firestore()
    .collection('users')
    .doc(userId)
    .get();
  
  // Check if user is admin
  const isAdmin = userData.phoneNumber === '+33679430759';
  
  setUserStats({
    ...stats,
    isAdmin: isAdmin
  });
};
```

**UI Visibility:**

```javascript
{userStats.isAdmin && (
  <Button 
    title="🔍 Validation Défis" 
    onPress={() => navigation.navigate('AdminReview')}
  />
)}
```

### AdminReviewScreen

**File:** `src/screens/AdminReviewScreen.tsx`

#### Features

1. **Pending Submissions List**
   - Fetches all `status === 'pending'` submissions
   - Displays user info, challenge name, submission time
   - Manual sorting by date (newest first)

2. **Video Player Integration**
   - Uses `react-native-video` for playback
   - Full-screen modal overlay
   - Playback controls (play/pause, seek, volume)
   - Error handling for video load failures

3. **Approval/Rejection Actions**
   - Approve: Awards XP to user, updates status
   - Reject: Captures reason, no XP awarded
   - Updates Firestore document atomically

#### Implementation

**Video Modal:**

```tsx
import Video from 'react-native-video';

const [showVideoModal, setShowVideoModal] = useState(false);
const [videoToPlay, setVideoToPlay] = useState<string | null>(null);
const videoRef = useRef<any>(null);

const handleViewVideo = (submission: Submission) => {
  setVideoToPlay(submission.videoURL);
  setShowVideoModal(true);
};

<Modal visible={showVideoModal} transparent animationType="fade">
  <View style={styles.videoModalOverlay}>
    <View style={styles.videoModalContainer}>
      {/* Close button */}
      <TouchableOpacity 
        style={styles.videoCloseButton} 
        onPress={() => setShowVideoModal(false)}
      >
        <Text style={styles.videoCloseText}>✕ Fermer</Text>
      </TouchableOpacity>
      
      {/* Video Player */}
      <Video
        ref={videoRef}
        source={{ uri: videoToPlay }}
        style={styles.video}
        controls={true}
        resizeMode="contain"
        paused={false}
        onError={(error) => {
          Alert.alert('Erreur', 'Impossible de lire la vidéo.');
        }}
      />
    </View>
  </View>
</Modal>
```

**Styles:**

```typescript
const styles = StyleSheet.create({
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoModalContainer: {
    width: width * 0.9,
    height: width * 0.9 * 16 / 9,  // 16:9 aspect ratio
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
  },
});
```

**Approval Logic:**

```typescript
const handleApprove = async (submission: Submission) => {
  try {
    // Update submission status
    await ChallengeService.approveSubmission(submission.id);
    
    // Award XP to user
    const challenge = challenges.find(c => c.id === submission.challengeId);
    await firestore()
      .collection('users')
      .doc(submission.userId)
      .update({
        totalXP: FieldValue.increment(challenge.xpReward),
        completedChallenges: FieldValue.arrayUnion(submission.challengeId),
      });
    
    // Refresh list
    loadPendingSubmissions();
    
    Alert.alert('✅ Approuvé', `+${challenge.xpReward} XP attribués`);
  } catch (error) {
    Alert.alert('Erreur', error.message);
  }
};
```

**Rejection Logic:**

```typescript
const handleReject = async (submission: Submission) => {
  Alert.prompt(
    'Raison du rejet',
    'Pourquoi refusez-vous cette soumission ?',
    async (reason) => {
      if (!reason) return;
      
      try {
        await ChallengeService.rejectSubmission(submission.id, reason);
        loadPendingSubmissions();
        Alert.alert('❌ Rejeté', 'Soumission refusée');
      } catch (error) {
        Alert.alert('Erreur', error.message);
      }
    }
  );
};
```

### Pending Submissions Query

**Issue:** Firestore composite index required for `.where() + .orderBy()`

**Original Query (requires index):**
```typescript
// ❌ Requires Firestore index
const snapshot = await firestore()
  .collection('challengeSubmissions')
  .where('status', '==', 'pending')
  .orderBy('submittedAt', 'desc')
  .get();
```

**Current Solution (manual sorting):**
```typescript
// ✅ No index required
const snapshot = await firestore()
  .collection('challengeSubmissions')
  .where('status', '==', 'pending')
  .get();

// Manual sorting
const submissions = snapshot.docs
  .map(doc => ({ id: doc.id, ...doc.data() }))
  .sort((a, b) => {
    const dateA = a.submittedAt?.toDate() || new Date(0);
    const dateB = b.submittedAt?.toDate() || new Date(0);
    return dateB - dateA;  // Newest first
  });
```

**Future:** Once Firestore index builds (5-10 minutes), can revert to `.orderBy()` for better performance.

## Firestore Data Model

### Collection: `challengeSubmissions`

```typescript
interface ChallengeSubmission {
  id: string;                    // Auto-generated document ID
  userId: string;                // User who submitted
  challengeId: string;           // Challenge ID from challenges.ts
  videoURL: string;              // Firebase Storage download URL
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp;        // Submission time
  reviewedAt: Timestamp | null;  // Review time
  reviewedBy: string | null;     // Admin user ID
  rejectionReason: string | null; // Why rejected (if status=rejected)
}
```

**Indexes:**
```
Single field indexes (auto-created):
- status
- userId
- challengeId

Composite index (manual):
- status (Ascending) + submittedAt (Descending)
  Purpose: Efficient pending submissions query
```

### Collection: `users` (Challenge-related fields)

```typescript
interface User {
  // ... other fields
  totalXP: number;                    // Includes challenge XP
  completedChallenges: string[];      // Array of challenge IDs
  challengeStreak: number;            // Consecutive days
  lastChallengeDate: Timestamp;       // Last submission date
}
```

## User Experience Flow

### Submission Flow

1. **User opens ChallengeScreen**
   - Today's challenge loads automatically
   - Shows challenge description, requirements, XP reward

2. **User taps "Enregistrer une vidéo"**
   - Permission check (CAMERA, RECORD_AUDIO)
   - Native camera launches
   - User records video (max 60 seconds)

3. **Video preview**
   - User can review recorded video
   - Options: Submit, Re-record, Cancel

4. **Upload process**
   - Progress bar displays upload percentage
   - Video uploads to Firebase Storage
   - Submission document created in Firestore

5. **Confirmation**
   - Success message: "Défi soumis !"
   - Status: "En attente de validation"
   - User can see submission in profile

### Admin Review Flow

1. **Admin opens AdminReviewScreen**
   - List of pending submissions loads
   - Sorted by newest first
   - Shows user name, challenge, submission time

2. **Admin taps "🎥 Voir la vidéo"**
   - Video modal opens
   - Video plays automatically
   - Full playback controls available

3. **Admin makes decision**
   - **Approve:** Tap "✅ Approuver" → XP awarded → Submission archived
   - **Reject:** Tap "❌ Rejeter" → Reason prompt → No XP → Submission archived

4. **Feedback**
   - Success alert confirms action
   - List refreshes automatically
   - Submission disappears from pending list

## Permissions

### Android Manifest

**File:** `app.json`

```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ]
    }
  }
}
```

### Runtime Permissions

Handled automatically by `expo-image-picker`:

```typescript
const { status } = await ImagePicker.requestCameraPermissionsAsync();
if (status !== 'granted') {
  Alert.alert(
    'Permission refusée',
    'Veuillez autoriser l\'accès à la caméra pour enregistrer votre défi.'
  );
  return;
}
```

## Firebase Storage Rules

**File:** `storage.rules`

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Challenge videos
    match /challenges/{userId}/{videoFile} {
      // Users can upload their own videos
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Only admins can delete videos
      allow delete: if request.auth != null && isAdmin(request.auth.uid);
      
      // Videos are publicly readable (for admin review)
      allow read: if true;
    }
  }
  
  function isAdmin(userId) {
    // Check if user is admin (implement based on your auth system)
    return exists(/databases/$(database)/documents/admins/$(userId));
  }
}
```

## Firestore Security Rules

**File:** `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Challenge submissions
    match /challengeSubmissions/{submissionId} {
      // Users can create their own submissions
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.status == 'pending';
      
      // Users can read their own submissions
      allow read: if request.auth != null 
        && (resource.data.userId == request.auth.uid || isAdmin());
      
      // Only admins can update (approve/reject)
      allow update: if request.auth != null && isAdmin();
      
      // Only admins can delete
      allow delete: if request.auth != null && isAdmin();
    }
    
    function isAdmin() {
      let userData = get(/databases/$(database)/documents/users/$(request.auth.uid));
      return userData.data.phoneNumber == '+33679430759';
    }
  }
}
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| **Permission denied** | User denied camera access | Request permission again with explanation |
| **Video too large** | Video exceeds size limit | Compress video, reduce quality setting |
| **Upload failed** | Network issue | Retry with exponential backoff |
| **Submission exists** | User already submitted today | Check for existing submission before allowing |
| **Video player error** | Corrupted file, unsupported format | Handle with error callback, show message |

### Error Handling Examples

**Camera Permission:**
```typescript
try {
  const uri = await recordVideo();
  if (!uri) {
    Alert.alert('Annulé', 'Enregistrement annulé');
    return;
  }
} catch (error) {
  if (error.code === 'E_PERMISSION_MISSING') {
    Alert.alert(
      'Permission requise',
      'Veuillez autoriser l\'accès à la caméra dans les paramètres'
    );
  } else {
    Alert.alert('Erreur', error.message);
  }
}
```

**Upload Error:**
```typescript
try {
  const videoURL = await uploadChallengeVideo(
    userId,
    challengeId,
    videoUri,
    (progress) => setUploadProgress(progress)
  );
} catch (error) {
  if (error.code === 'storage/canceled') {
    Alert.alert('Annulé', 'Upload annulé');
  } else if (error.code === 'storage/quota-exceeded') {
    Alert.alert('Erreur', 'Quota de stockage dépassé');
  } else {
    Alert.alert('Erreur d\'upload', error.message);
  }
}
```

## Testing

### Test Challenges

Create test challenges with shorter videos for faster testing:

```typescript
{
  id: 'test_10sec_planche',
  title: 'Test: 10 secondes planche',
  difficulty: 'easy',
  xpReward: 10,
  videoRequired: true,
  estimatedTime: 1,
}
```

### Admin Testing

Use test admin phone number in development:

```javascript
// ProfileScreen.js
const isAdmin = userData.phoneNumber === '+33600000001'; // Test number
```

### Video Upload Testing

Use small test videos to avoid long upload times:

```bash
# Create 5-second test video (480p, low bitrate)
ffmpeg -f lavfi -i testsrc=duration=5:size=854x480:rate=30 \
  -c:v libx264 -preset ultrafast -crf 28 test_video.mp4
```

## Performance Optimization

### Video Compression

Balance quality and file size:

```typescript
// In useVideoPicker.ts
const result = await ImagePicker.launchCameraAsync({
  quality: 0.8,  // 80% quality (good balance)
  videoMaxDuration: 60,
  // Native compression handles the rest
});
```

### Lazy Loading

Load submissions on-demand:

```typescript
const [submissions, setSubmissions] = useState([]);
const [page, setPage] = useState(0);
const PAGE_SIZE = 10;

const loadMore = async () => {
  const snapshot = await firestore()
    .collection('challengeSubmissions')
    .where('status', '==', 'pending')
    .limit(PAGE_SIZE)
    .startAfter(lastDoc)
    .get();
  
  setSubmissions([...submissions, ...snapshot.docs]);
};
```

### Video Preloading

Preload video in background before modal opens:

```typescript
const preloadVideo = (uri: string) => {
  // react-native-video handles caching automatically
  // Just set paused=true initially
};
```

## Future Enhancements

- [ ] **Leaderboards**: Top performers for each challenge
- [ ] **Challenge streaks**: Consecutive days bonus XP
- [ ] **Social features**: Share videos, like/comment
- [ ] **Challenge categories**: Filter by strength/cardio/flexibility
- [ ] **Custom challenges**: User-created challenges
- [ ] **Video compression**: Client-side compression before upload
- [ ] **Offline support**: Queue submissions when offline
- [ ] **Push notifications**: Daily challenge reminders
- [ ] **Achievement badges**: Complete X challenges in a row
- [ ] **AI validation**: Automatic form checking with ML

## Troubleshooting

### Video doesn't play in AdminReviewScreen

**Check:**
1. Video URL is valid (Firebase Storage download URL)
2. Network connectivity (videos stream from cloud)
3. Video format supported (MP4 recommended)
4. react-native-video installed correctly

**Debug:**
```typescript
<Video
  onError={(error) => {
    console.log('Video error:', error);
    Alert.alert('Erreur vidéo', JSON.stringify(error));
  }}
  onLoad={() => console.log('Video loaded successfully')}
/>
```

### Upload progress stuck at 0%

**Causes:**
- File system permission issue
- Incorrect URI format
- Network connectivity

**Solution:**
```typescript
console.log('Video URI:', videoUri);
console.log('File info:', await FileSystem.getInfoAsync(videoUri));
```

### Firestore permission denied on approval

**Cause:** User is not admin or security rules too restrictive

**Solution:**
```javascript
// Check admin status
console.log('Is admin?', userStats.isAdmin);
console.log('Phone:', userData.phoneNumber);

// Update Firestore rules to allow admin updates
```

---

**Last Updated:** 2024-01-XX  
**Version:** 1.0  
**Maintainer:** Robin Allain
