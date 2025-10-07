import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { printDiagnosticReport } from '../utils/firestoreDiagnostic';

/**
 * Firestore Connection Test Component
 * Add this to any screen to test Firestore connectivity
 * 
 * Usage:
 * import FirestoreTestButton from '../components/FirestoreTestButton';
 * 
 * Then in your render:
 * <FirestoreTestButton />
 */
const FirestoreTestButton = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Running Firestore diagnostic test...');
      const results = await printDiagnosticReport();
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={runTest}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? '⏳ Testing...' : '🔍 Test Firestore Connection'}
        </Text>
      </TouchableOpacity>

      {testResults && (
        <ScrollView style={styles.results}>
          <Text style={styles.resultsTitle}>📊 Test Results:</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Connected:</Text>
            <Text style={testResults.connected ? styles.success : styles.error}>
              {testResults.connected ? '✅' : '❌'}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Authenticated:</Text>
            <Text style={testResults.authenticated ? styles.success : styles.error}>
              {testResults.authenticated ? '✅' : '❌'}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Can Read:</Text>
            <Text style={testResults.canReadOwnUser ? styles.success : styles.error}>
              {testResults.canReadOwnUser ? '✅' : '❌'}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Can Write:</Text>
            <Text style={testResults.canWriteOwnUser ? styles.success : styles.error}>
              {testResults.canWriteOwnUser ? '✅' : '❌'}
            </Text>
          </View>

          {testResults.errors && testResults.errors.length > 0 && (
            <View style={styles.errorsSection}>
              <Text style={styles.errorsTitle}>⚠️ Errors:</Text>
              {testResults.errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>{error}</Text>
              ))}
            </View>
          )}

          <Text style={styles.consoleNote}>
            💡 Check console for full diagnostic report
          </Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    marginTop: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    maxHeight: 300,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultLabel: {
    fontSize: 14,
    color: '#333',
  },
  success: {
    fontSize: 18,
  },
  error: {
    fontSize: 18,
  },
  errorsSection: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 4,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#856404',
  },
  errorText: {
    fontSize: 12,
    color: '#856404',
    marginVertical: 2,
  },
  consoleNote: {
    marginTop: 12,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default FirestoreTestButton;
