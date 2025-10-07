/**
 * Firestore Diagnostic Utility
 * Tests Firestore connectivity and security rules
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

/**
 * Test Firestore connection
 * @returns {Promise<Object>} Diagnostic results
 */
export const testFirestoreConnection = async () => {
  const results = {
    connected: false,
    authenticated: false,
    canReadOwnUser: false,
    canWriteOwnUser: false,
    errors: []
  };

  try {
    // 1. Check if authenticated
    const currentUser = auth().currentUser;
    if (!currentUser) {
      results.errors.push('❌ User not authenticated');
      return results;
    }
    results.authenticated = true;
    console.log('✅ User authenticated:', currentUser.uid);

    // 2. Try to read own user document
    try {
      const userRef = firestore().collection('users').doc(currentUser.uid);
      const userDoc = await userRef.get();
      results.canReadOwnUser = true;
      console.log('✅ Can read own user document');
      console.log('Document exists:', userDoc.exists());
      if (userDoc.exists()) {
        console.log('User data:', userDoc.data());
      }
    } catch (error) {
      results.errors.push(`❌ Cannot read user document: ${error.code} - ${error.message}`);
      console.error('Read error:', error);
    }

    // 3. Try to write to own user document (update timestamp)
    try {
      const userRef = firestore().collection('users').doc(currentUser.uid);
      await userRef.set({ 
        lastDiagnosticTest: firestore.FieldValue.serverTimestamp() 
      }, { merge: true });
      results.canWriteOwnUser = true;
      console.log('✅ Can write to own user document');
    } catch (error) {
      results.errors.push(`❌ Cannot write user document: ${error.code} - ${error.message}`);
      console.error('Write error:', error);
    }

    // 4. Test overall connectivity
    results.connected = results.canReadOwnUser || results.canWriteOwnUser;

  } catch (error) {
    results.errors.push(`❌ General error: ${error.message}`);
    console.error('Diagnostic error:', error);
  }

  return results;
};

/**
 * Print diagnostic report
 */
export const printDiagnosticReport = async () => {
  console.log('\n========================================');
  console.log('🔍 FIRESTORE DIAGNOSTIC REPORT');
  console.log('========================================\n');

  const results = await testFirestoreConnection();

  console.log('📊 Results:');
  console.log('  - Connected:', results.connected ? '✅' : '❌');
  console.log('  - Authenticated:', results.authenticated ? '✅' : '❌');
  console.log('  - Can Read User Doc:', results.canReadOwnUser ? '✅' : '❌');
  console.log('  - Can Write User Doc:', results.canWriteOwnUser ? '✅' : '❌');

  if (results.errors.length > 0) {
    console.log('\n⚠️ Errors:');
    results.errors.forEach(err => console.log('  ' + err));
  }

  console.log('\n========================================');

  // Provide recommendations
  if (!results.authenticated) {
    console.log('💡 RECOMMENDATION: Log in or sign up first');
  } else if (!results.canReadOwnUser && !results.canWriteOwnUser) {
    console.log('💡 RECOMMENDATION: Check Firestore Security Rules');
    console.log('   Go to Firebase Console → Firestore → Rules');
    console.log('   Ensure authenticated users can access their own documents');
  } else if (results.canReadOwnUser && !results.canWriteOwnUser) {
    console.log('💡 RECOMMENDATION: Write permissions may be restricted');
  }

  console.log('========================================\n');

  return results;
};

/**
 * Quick connectivity check (lightweight)
 */
export const quickConnectivityCheck = async () => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) return false;

    const userRef = firestore().collection('users').doc(currentUser.uid);
    await userRef.get();
    return true;
  } catch (error) {
    console.error('Quick connectivity check failed:', error.code);
    return false;
  }
};
