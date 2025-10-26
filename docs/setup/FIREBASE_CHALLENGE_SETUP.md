# Firebase Configuration for Challenge System

This document provides the Firebase setup steps for the Challenge System (video submissions, daily challenges, admin review).

## 1. Activate Firebase Storage

### Console Steps:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Storage** in left sidebar
4. Click **Get Started**
5. Choose **Production mode** or **Test mode** (will configure rules manually)
6. Select your preferred region (same as Firestore for consistency)
7. Click **Done**

### Verify Storage Bucket:
- Your bucket URL should be: `gs://<your-project-id>.appspot.com`
- This is automatically used by `StorageService.ts`

---

## 2. Configure Security Rules

### Storage Rules (for video uploads)

Navigate to **Storage > Rules** tab and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Allow authenticated users to upload their own challenge videos
    match /submissions/{userId}/{videoFile} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 50 * 1024 * 1024  // Max 50MB
                   && request.resource.contentType.matches('video/.*');
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow admins to delete any submission video (optional)
    match /submissions/{userId}/{videoFile} {
      allow delete: if request.auth != null 
                    && get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

**Key Points:**
- Users can only upload videos to their own folder (`/submissions/{userId}/`)
- Max file size: 50MB
- Only video MIME types allowed
- Admins can delete any video (requires `isAdmin: true` in user document)

---

### Firestore Rules (for submissions & dailyChallenges)

Navigate to **Firestore Database > Rules** tab and **ADD** these rules to your existing configuration:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ... your existing rules ...
    
    // Challenge Submissions Collection
    match /submissions/{submissionId} {
      // Anyone authenticated can read (for leaderboards/peer review)
      allow read: if request.auth != null;
      
      // Users can create submissions for themselves
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.status == 'pending';
      
      // Only admins can update (approve/reject)
      allow update: if request.auth != null 
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      
      // Users can delete their own pending submissions
      allow delete: if request.auth != null 
                    && resource.data.userId == request.auth.uid
                    && resource.data.status == 'pending';
    }
    
    // Daily Challenges Collection (date-based subcollections)
    match /dailyChallenges/{date}/users/{userId} {
      // Users can read their own daily challenges
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can create/update their own daily challenge entry
      allow create, update: if request.auth != null && request.auth.uid == userId;
      
      // No deletion allowed (preserve history)
      allow delete: if false;
    }
  }
}
```

**Key Points:**
- Submissions are readable by all authenticated users (for community/leaderboard features)
- Only submission owner can create (status must be 'pending')
- Only admins can approve/reject (`isAdmin: true` field required)
- Daily challenges are private (users only see their own)
- Daily challenges cannot be deleted (preserves integrity)

---

## 3. Add Admin Flag to User Documents

For admin review functionality, you need to mark certain users as admins.

### Firestore Console Steps:
1. Navigate to **Firestore Database**
2. Go to `users` collection
3. Select your admin user document
4. Click **Add field**
   - Field name: `isAdmin`
   - Type: `boolean`
   - Value: `true`
5. Save

### Programmatic Method (from Firebase Admin SDK):
```javascript
// If you have Firebase Admin SDK setup
await admin.firestore()
  .collection('users')
  .doc('YOUR_ADMIN_UID')
  .update({
    isAdmin: true
  });
```

**⚠️ Security Note:** 
- Only add `isAdmin: true` to trusted users
- Consider implementing proper role-based access control (RBAC) for production
- Admin flag cannot be self-assigned due to Firestore rules (must be done via Admin SDK or Console)

---

## 4. Test the Configuration

### Test Video Upload:
1. Run the app on a device/emulator
2. Navigate to Challenge Screen
3. Grant camera permissions
4. Record a short video
5. Submit the challenge
6. Check Firebase Storage Console → `submissions/{yourUserId}/` folder should contain the video

### Test Firestore Writes:
1. After submission, check Firestore Console:
   - `submissions` collection should have a new document with status `pending`
   - `dailyChallenges/{today's date}/users/{yourUserId}` should exist with `submitted: true`

### Test Admin Review:
1. Add `isAdmin: true` to your user document (via Console)
2. Navigate to Admin Review Screen
3. You should see the pending submission
4. Approve/Reject should update the submission status and reward XP

### Test Security Rules:
1. Try uploading a file >50MB (should fail)
2. Try accessing another user's daily challenge (should be denied)
3. Try approving a submission without admin flag (should fail)

---

## 5. Troubleshooting

### Storage Upload Fails:
- **Check permissions:** Ensure camera/media-library permissions are granted
- **Check file size:** Videos >50MB will be rejected (error in StorageService)
- **Check network:** Requires internet connection, uploads can fail on poor connections
- **Check Storage Rules:** Verify userId path matches authenticated user

### Firestore Write Fails:
- **Check authentication:** User must be signed in (not guest mode)
- **Check rules:** Verify Firestore rules were published successfully
- **Check indexes:** Some queries may require composite indexes (Firebase will prompt with link)

### Admin Review Not Visible:
- **Check isAdmin flag:** Must be `true` (boolean, not string)
- **Check submissions:** Must have at least one submission with `status: 'pending'`
- **Check authentication:** Admin must be signed in

### XP Not Awarded:
- **Check approval:** XP only awarded when admin approves submission
- **Check user document:** Verify `totalXP` field exists and updates
- **Check ChallengeService:** Ensure `rewardUserXP()` is called after approval

---

## 6. Data Migration (Existing Users)

If you have existing users in production, they won't have the new challenge stat fields. You can:

### Option A: Let it happen organically
- New fields are initialized to 0/null when AuthContext creates new users
- Existing users will get fields added when ChallengeService.updateUserStats() runs (uses FieldValue.increment)

### Option B: Batch migration script
```javascript
// Run this once via Firebase Functions or Admin SDK
const users = await admin.firestore().collection('users').get();
const batch = admin.firestore().batch();

users.docs.forEach(doc => {
  if (!doc.data().totalChallengesSubmitted) {
    batch.update(doc.ref, {
      totalChallengesSubmitted: 0,
      totalChallengesApproved: 0,
      lastSubmissionDate: null
    });
  }
});

await batch.commit();
console.log(`Migrated ${users.size} users`);
```

---

## 7. Production Considerations

### Storage Costs:
- Videos are stored permanently (unless manually deleted)
- Consider implementing cleanup policy for old/rejected submissions
- Monitor storage usage in Firebase Console → Storage → Usage tab

### Firestore Costs:
- Each submission = 1 write, each approval/rejection = 1 write
- Daily challenges = 1 write per user per day
- User stats update = 1 write per submission
- Monitor usage in Firebase Console → Firestore → Usage tab

### Performance:
- Storage uploads can be slow on poor networks (implement retry logic if needed)
- Consider compressing videos client-side before upload (currently 50MB max)
- Implement pagination for AdminReviewScreen if >100 pending submissions

### Security:
- Regularly audit admin users (isAdmin flag)
- Consider adding IP whitelisting for admin actions
- Implement video content moderation (manual or automated)
- Add rate limiting for submissions (e.g., max 1 per day per user)

---

## Next Steps

After completing this setup:
1. ✅ Test all flows (submission, admin review, XP rewards)
2. ✅ Verify all Security Rules work as expected
3. ✅ Add admin flag to at least one user
4. ⏭️ Proceed with navigation integration (add screens to app routing)
