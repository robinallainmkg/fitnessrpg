# Keystore Issue Tracking - Oct 21, 2025

## Problem
- Attempted to upload signed AAB to Play Store
- Play Store rejected with wrong signing key error
- Expected SHA1: `1B:43:9D:DD:17:AC:62:45:30:C1:84:4B:AE:7D:BF:0B:34:99:A3:F8`
- Our build SHA1: `87:07:BB:52:7C:81:54:11:AD:A3:E8:C9:C6:5D:D5:EF:3C:35:ED:16`

## Root Cause Analysis
1. Previous build was submitted to Play Store with original keystore
2. Original keystore file is NOT found anywhere on system:
   - ❌ Not in git (ignored by `.gitignore` - line: `android/app/*.keystore`)
   - ❌ Not in backups
   - ❌ Not in Android Studio config
   - ❌ Not in Documents/Downloads/Desktop
3. New keystore was created Oct 21, 2025 at 21:31:28 CEST

## Current Keystore Details

**File:** `android/app/hybridrpg-release.keystore`  
**Store Password:** `12031990Robin!`  
**Key Alias:** `hybridrpg`  
**Key Password:** `12031990Robin!`  
**Valid:** Oct 21, 2025 - Mar 08, 2053 (27 years)

**SHA1 Fingerprint:** `87:07:BB:52:7C:81:54:11:AD:A3:E8:C9:C6:5D:D5:EF:3C:35:ED:16`  
**SHA256 Fingerprint:** `3A:03:39:6D:4C:70:EE:21:86:B0:9B:C6:99:33:FB:95:65:79:AF:9B:F4:B0:79:A4:04:7F:00:8E:91:13:15:90`

## Solutions Attempted
- ✅ Searched entire Windows file system for old keystore
- ✅ Searched git history for old keystore
- ✅ Checked Android Studio configuration
- ✅ Verified .gitignore is blocking keystore files
- ❌ Unable to locate original keystore

## Recommended Action
Contact Google Play Support to:
1. Reset signing key for app (valid for first submission)
2. Use new keystore SHA1: `87:07:BB:52:7C:81:54:11:AD:A3:E8:C9:C6:5D:D5:EF:3C:35:ED:16`
3. Re-submit build with explanation

**Support Link:** https://support.google.com/googleplay/contact/help

## CRITICAL: Future Prevention
⚠️ **BACKUP THIS KEYSTORE NOW:**
- Save `hybridrpg-release.keystore` to secure location
- Add to password manager
- NEVER lose it - you need it for ALL future app updates
- Store separately from git repository
