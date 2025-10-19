import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/**
 * Écran de diagnostic Firebase Firestore
 * 
 * Tests effectués:
 * 1. Firebase Auth initialisé
 * 2. Utilisateur connecté
 * 3. Firestore accessible
 * 4. Test lecture document
 * 5. Test écriture document
 */
const FirestoreDiagnosticScreen = ({ navigation }) => {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);

  const addResult = (test, status, message, details = null) => {
    setResults(prev => [...prev, {
      test,
      status, // 'success', 'error', 'warning'
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runDiagnostic = async () => {
    setResults([]);
    setRunning(true);

    try {
      // TEST 1: Firebase Auth initialisé
      addResult('1. Firebase Auth', 'info', 'Vérification Firebase Auth...');
      const currentUser = auth().currentUser;
      
      if (currentUser) {
        addResult('1. Firebase Auth', 'success', 'Utilisateur connecté', {
          email: currentUser.email,
          uid: currentUser.uid
        });
      } else {
        addResult('1. Firebase Auth', 'error', 'Aucun utilisateur connecté', {
          suggestion: 'Connectez-vous avant de tester Firestore'
        });
        setRunning(false);
        return;
      }

      // TEST 2: Firestore initialisé
      addResult('2. Firestore Init', 'info', 'Vérification Firestore...');
      try {
        const firestoreInstance = firestore();
        addResult('2. Firestore Init', 'success', 'Firestore SDK initialisé');
      } catch (error) {
        addResult('2. Firestore Init', 'error', 'Échec initialisation Firestore', {
          error: error.message
        });
        setRunning(false);
        return;
      }

      // TEST 3: Test lecture collection _test
      addResult('3. Read Test', 'info', 'Tentative lecture collection _test...');
      try {
        const startRead = Date.now();
        const testDoc = await firestore()
          .collection('_test')
          .doc('diagnostic')
          .get();
        
        const readTime = Date.now() - startRead;
        
        if (testDoc.exists) {
          addResult('3. Read Test', 'success', `Document lu en ${readTime}ms`, {
            data: testDoc.data()
          });
        } else {
          addResult('3. Read Test', 'warning', `Document inexistant (${readTime}ms)`, {
            suggestion: 'Créez un document _test/diagnostic dans Firebase Console'
          });
        }
      } catch (error) {
        addResult('3. Read Test', 'error', 'Échec lecture Firestore', {
          code: error.code,
          message: error.message,
          suggestion: error.code === 'firestore/unavailable' 
            ? 'Firestore n\'est pas activé dans votre projet Firebase'
            : 'Vérifiez les Security Rules Firestore'
        });
      }

      // TEST 4: Test lecture document utilisateur
      addResult('4. User Document', 'info', 'Tentative lecture document utilisateur...');
      try {
        const startRead = Date.now();
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();
        
        const readTime = Date.now() - startRead;
        
        if (userDoc.exists) {
          addResult('4. User Document', 'success', `Document utilisateur lu en ${readTime}ms`, {
            data: userDoc.data()
          });
        } else {
          addResult('4. User Document', 'warning', `Document utilisateur inexistant (${readTime}ms)`, {
            suggestion: 'Le document sera créé au premier signup'
          });
        }
      } catch (error) {
        addResult('4. User Document', 'error', 'Échec lecture document utilisateur', {
          code: error.code,
          message: error.message
        });
      }

      // TEST 5: Test écriture (si pas d'erreur lecture)
      addResult('5. Write Test', 'info', 'Tentative écriture document test...');
      try {
        const startWrite = Date.now();
        await firestore()
          .collection('_test')
          .doc('diagnostic')
          .set({
            lastTest: firestore().FieldValue.serverTimestamp(),
            testBy: currentUser.email,
            status: 'success'
          }, { merge: true });
        
        const writeTime = Date.now() - startWrite;
        addResult('5. Write Test', 'success', `Document écrit en ${writeTime}ms`);
      } catch (error) {
        addResult('5. Write Test', 'error', 'Échec écriture Firestore', {
          code: error.code,
          message: error.message,
          suggestion: error.code === 'firestore/permission-denied'
            ? 'Les Security Rules bloquent l\'écriture'
            : 'Vérifiez la configuration Firestore'
        });
      }

      // TEST 6: Test query
      addResult('6. Query Test', 'info', 'Tentative query collection users...');
      try {
        const startQuery = Date.now();
        const usersSnapshot = await firestore()
          .collection('users')
          .limit(1)
          .get();
        
        const queryTime = Date.now() - startQuery;
        addResult('6. Query Test', 'success', `Query exécutée en ${queryTime}ms`, {
          documentsFound: usersSnapshot.size
        });
      } catch (error) {
        addResult('6. Query Test', 'error', 'Échec query Firestore', {
          code: error.code,
          message: error.message
        });
      }

    } catch (error) {
      addResult('Diagnostic', 'error', 'Erreur inattendue', {
        error: error.message
      });
    } finally {
      setRunning(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '◽';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Diagnostic Firestore</Text>
      
      <TouchableOpacity
        style={[styles.button, running && styles.buttonDisabled]}
        onPress={runDiagnostic}
        disabled={running}
      >
        <Text style={styles.buttonText}>
          {running ? '⏳ Test en cours...' : '▶️ Lancer le diagnostic'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>{getStatusIcon(result.status)}</Text>
              <Text style={styles.resultTest}>{result.test}</Text>
              <Text style={styles.resultTime}>{result.timestamp}</Text>
            </View>
            
            <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
              {result.message}
            </Text>
            
            {result.details && (
              <View style={styles.resultDetails}>
                <Text style={styles.resultDetailsText}>
                  {JSON.stringify(result.details, null, 2)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  resultTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  resultMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  resultDetails: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  resultDetailsText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  backButton: {
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FirestoreDiagnosticScreen;
