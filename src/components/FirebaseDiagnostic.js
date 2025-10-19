import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const FirebaseDiagnostic = () => {
  const [logs, setLogs] = useState([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message, status = 'info', duration = null) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3 
    });
    
    setLogs(prev => [...prev, {
      timestamp,
      message,
      status, // 'info', 'success', 'error', 'warning'
      duration,
      id: Date.now() + Math.random()
    }]);
  };

  const clearLogs = () => setLogs([]);

  const measureTime = async (name, fn) => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = (performance.now() - start).toFixed(0);
      addLog(`✅ ${name}`, 'success', duration);
      return { success: true, result, duration };
    } catch (error) {
      const duration = (performance.now() - start).toFixed(0);
      addLog(`❌ ${name}: ${error.message}`, 'error', duration);
      return { success: false, error, duration };
    }
  };

  const runDiagnostics = async () => {
    setTesting(true);
    clearLogs();

    addLog('🔍 DÉMARRAGE DU DIAGNOSTIC FIREBASE', 'info');
    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');

    // 1. Test Firebase Initialization
    addLog('📦 Test 1: Initialisation Firebase', 'info');
    try {
      const app = auth().app;
      addLog(`  → Firebase App: ${app.name}`, 'success');
      addLog(`  → Project ID: ${app.options.projectId || 'N/A'}`, 'info');
    } catch (error) {
      addLog(`  → Erreur init: ${error.message}`, 'error');
    }

    // 2. Test Network (Google)
    addLog('🌐 Test 2: Connexion Internet (Google)', 'info');
    await measureTime('Fetch google.com', async () => {
      const response = await fetch('https://www.google.com', { method: 'HEAD' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    });

    // 3. Test Network (Firebase)
    addLog('🔥 Test 3: Connexion Firebase Servers', 'info');
    await measureTime('Fetch identitytoolkit.googleapis.com', async () => {
      const response = await fetch('https://identitytoolkit.googleapis.com/', { method: 'HEAD' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    });

    // 4. Test fetchSignInMethodsForEmail (RAPIDE)
    addLog('📧 Test 4: fetchSignInMethodsForEmail (doit être rapide)', 'info');
    const emailCheckResult = await measureTime(
      'Check email: test@example.com',
      () => auth().fetchSignInMethodsForEmail('test@example.com')
    );
    
    if (emailCheckResult.duration > 3000) {
      addLog(`  ⚠️ LENT! ${emailCheckResult.duration}ms (devrait être <1000ms)`, 'warning');
    }

    // 5. Test Signup (SANS TIMEOUT ARTIFICIEL)
    addLog('👤 Test 5: Signup natif Firebase (sans timeout)', 'info');
    const testEmail = `test-${Date.now()}@fitnessrpg.app`;
    const testPassword = 'TestPassword123!';
    
    const signupResult = await measureTime(
      `Signup: ${testEmail}`,
      () => auth().createUserWithEmailAndPassword(testEmail, testPassword)
    );

    if (signupResult.success) {
      addLog(`  → User ID: ${signupResult.result.user.uid}`, 'success');
      
      // 6. Test Firestore Write
      addLog('💾 Test 6: Écriture Firestore', 'info');
      await measureTime(
        'Firestore.set()',
        () => firestore()
          .collection('diagnostic')
          .doc(signupResult.result.user.uid)
          .set({
            timestamp: firestore.FieldValue.serverTimestamp(),
            test: true
          })
      );

      // 7. Test Firestore Read
      addLog('📖 Test 7: Lecture Firestore', 'info');
      await measureTime(
        'Firestore.get()',
        () => firestore()
          .collection('diagnostic')
          .doc(signupResult.result.user.uid)
          .get()
      );

      // Cleanup
      addLog('🧹 Nettoyage...', 'info');
      try {
        await signupResult.result.user.delete();
        await firestore().collection('diagnostic').doc(signupResult.result.user.uid).delete();
        addLog('  → User et document supprimés', 'success');
      } catch (cleanupError) {
        addLog(`  → Erreur nettoyage: ${cleanupError.message}`, 'warning');
      }
    } else if (signupResult.duration > 10000) {
      addLog(`  ⚠️ TIMEOUT! ${signupResult.duration}ms`, 'error');
      addLog(`  → Ceci indique un problème réseau ou de config Firebase`, 'error');
    }

    // 8. Résumé
    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
    addLog('📊 RÉSUMÉ DU DIAGNOSTIC', 'info');
    
    const successCount = logs.filter(l => l.status === 'success').length;
    const errorCount = logs.filter(l => l.status === 'error').length;
    const warningCount = logs.filter(l => l.status === 'warning').length;
    
    addLog(`  ✅ Succès: ${successCount}`, 'success');
    addLog(`  ❌ Erreurs: ${errorCount}`, errorCount > 0 ? 'error' : 'info');
    addLog(`  ⚠️  Warnings: ${warningCount}`, warningCount > 0 ? 'warning' : 'info');

    setTesting(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔥 Firebase Diagnostic</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, testing && styles.buttonDisabled]} 
            onPress={runDiagnostics}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>🚀 Lancer le diagnostic</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={clearLogs}
            disabled={testing}
          >
            <Text style={styles.buttonText}>🧹 Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.logContainer}>
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>
            Appuie sur "Lancer le diagnostic" pour commencer
          </Text>
        ) : (
          logs.map(log => (
            <View key={log.id} style={styles.logLine}>
              <Text style={styles.timestamp}>{log.timestamp}</Text>
              <Text style={[styles.logMessage, { color: getStatusColor(log.status) }]}>
                {log.message}
              </Text>
              {log.duration !== null && (
                <Text style={[
                  styles.duration,
                  log.duration > 3000 && styles.durationSlow
                ]}>
                  {log.duration}ms
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonDisabled: {
    backgroundColor: '#64748b',
  },
  clearButton: {
    flex: 0,
    minWidth: 100,
    backgroundColor: '#64748b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logContainer: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  logLine: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  timestamp: {
    color: '#64748b',
    fontSize: 12,
    marginRight: 8,
    minWidth: 90,
    fontFamily: 'monospace',
  },
  logMessage: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  duration: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
    minWidth: 60,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  durationSlow: {
    color: '#ef4444',
  },
});

export default FirebaseDiagnostic;
