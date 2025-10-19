import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Text, Card, Button, Divider, Chip } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import firestore from '@react-native-firebase/firestore';
import { collection, getDocs, doc, getDoc } from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/debugHelper';

const DevDiagnosticScreen = ({ navigation }) => {
  const { user, isGuest } = useAuth();
  const [diagnostics, setDiagnostics] = useState({
    firebase: { status: 'unknown', message: '' },
    firestore: { status: 'unknown', message: '' },
    userData: { status: 'unknown', message: '', data: null },
    asyncStorage: { status: 'unknown', message: '', keys: [] },
    performance: { loadTime: null }
  });

  const runDiagnostics = async () => {
    logger.section('🔍 Running Full Diagnostics');
    const startTime = Date.now();
    const results = { ...diagnostics };

    // 1. Test Firebase Connection
    try {
      const fs = firestore();
      results.firebase = {
        status: 'success',
        message: 'Firebase initialized'
      };
      logger.success('Firebase OK');
    } catch (error) {
      results.firebase = {
        status: 'error',
        message: error.message
      };
      logger.error('Firebase failed', error);
    }

    // 2. Test Firestore Read
    try {
      const fs = firestore();
      const testDoc = await getDoc(doc(firestore, 'users', user.uid));
      
      results.firestore = {
        status: 'success',
        message: `Firestore accessible - User doc ${testDoc.exists() ? 'exists' : 'not found'}`
      };
      logger.success('Firestore OK', { exists: testDoc.exists() });
    } catch (error) {
      results.firestore = {
        status: 'error',
        message: `${error.code}: ${error.message}`
      };
      logger.error('Firestore failed', error);
    }

    // 3. Load User Data
    try {
      const fs = firestore();
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        results.userData = {
          status: 'success',
          message: 'User data loaded',
          data: {
            globalXP: data.globalXP || 0,
            globalLevel: data.globalLevel || 0,
            selectedPrograms: data.selectedPrograms?.length || 0,
            activePrograms: data.activePrograms?.length || 0,
            migrationVersion: data.migrationVersion || 'none'
          }
        };
        logger.success('User data loaded', results.userData.data);
      } else {
        results.userData = {
          status: 'warning',
          message: 'User doc does not exist',
          data: null
        };
        logger.warn('User doc not found');
      }
    } catch (error) {
      results.userData = {
        status: 'error',
        message: error.message,
        data: null
      };
      logger.error('User data failed', error);
    }

    // 4. Check AsyncStorage
    try {
      const keys = await AsyncStorage.getAllKeys();
      results.asyncStorage = {
        status: 'success',
        message: `${keys.length} keys found`,
        keys: keys.slice(0, 10) // Only first 10
      };
      logger.success('AsyncStorage OK', { count: keys.length });
    } catch (error) {
      results.asyncStorage = {
        status: 'error',
        message: error.message,
        keys: []
      };
      logger.error('AsyncStorage failed', error);
    }

    // 5. Performance
    const totalTime = Date.now() - startTime;
    results.performance = {
      loadTime: totalTime
    };
    logger.success(`Diagnostics completed in ${totalTime}ms`);

    setDiagnostics(results);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const clearAsyncStorage = async () => {
    Alert.alert(
      'Clear AsyncStorage',
      'This will delete all local data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Success', 'AsyncStorage cleared');
            runDiagnostics();
          }
        }
      ]
    );
  };

  const testFirestoreWrite = async () => {
    try {
      const fs = firestore();
      const testRef = doc(firestore, 'test', 'diagnostic');
      await testRef.set({
        timestamp: new Date().toISOString(),
        message: 'Test write from diagnostic screen'
      });
      Alert.alert('Success', 'Write test successful');
      logger.success('Firestore write test OK');
    } catch (error) {
      Alert.alert('Error', error.message);
      logger.error('Firestore write test failed', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔧 Developer Diagnostics</Text>
        <Text style={styles.subtitle}>
          {isGuest ? 'Guest Mode' : `User: ${user?.email}`}
        </Text>
      </View>

      <Button
        mode="contained"
        onPress={runDiagnostics}
        style={styles.refreshButton}
      >
        🔄 Refresh Diagnostics
      </Button>

      {/* Firebase Status */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>
              {getStatusIcon(diagnostics.firebase.status)}
            </Text>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Firebase Connection</Text>
              <Text style={styles.statusMessage}>
                {diagnostics.firebase.message}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Firestore Status */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>
              {getStatusIcon(diagnostics.firestore.status)}
            </Text>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Firestore Access</Text>
              <Text style={styles.statusMessage}>
                {diagnostics.firestore.message}
              </Text>
            </View>
          </View>
        </Card.Content>
        <Card.Actions>
          <Button onPress={testFirestoreWrite}>Test Write</Button>
        </Card.Actions>
      </Card>

      {/* User Data Status */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>
              {getStatusIcon(diagnostics.userData.status)}
            </Text>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>User Data</Text>
              <Text style={styles.statusMessage}>
                {diagnostics.userData.message}
              </Text>
              {diagnostics.userData.data && (
                <View style={styles.dataDetails}>
                  <Text style={styles.dataText}>
                    Level: {diagnostics.userData.data.globalLevel}
                  </Text>
                  <Text style={styles.dataText}>
                    XP: {diagnostics.userData.data.globalXP}
                  </Text>
                  <Text style={styles.dataText}>
                    Selected Programs: {diagnostics.userData.data.selectedPrograms}
                  </Text>
                  <Text style={styles.dataText}>
                    Active Programs: {diagnostics.userData.data.activePrograms}
                  </Text>
                  <Text style={styles.dataText}>
                    Migration: {diagnostics.userData.data.migrationVersion}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* AsyncStorage Status */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>
              {getStatusIcon(diagnostics.asyncStorage.status)}
            </Text>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>AsyncStorage</Text>
              <Text style={styles.statusMessage}>
                {diagnostics.asyncStorage.message}
              </Text>
              {diagnostics.asyncStorage.keys.length > 0 && (
                <View style={styles.keysContainer}>
                  {diagnostics.asyncStorage.keys.map((key, index) => (
                    <Chip key={index} style={styles.keyChip}>{key}</Chip>
                  ))}
                </View>
              )}
            </View>
          </View>
        </Card.Content>
        <Card.Actions>
          <Button onPress={clearAsyncStorage} textColor="#F44336">
            Clear Storage
          </Button>
        </Card.Actions>
      </Card>

      {/* Performance */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.statusTitle}>⚡ Performance</Text>
          {diagnostics.performance.loadTime && (
            <Text style={styles.perfText}>
              Diagnostic load time: {diagnostics.performance.loadTime}ms
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Logger Test */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.statusTitle}>📝 Logger Test</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => {
            logger.debug('Test debug message');
            logger.success('Test success message');
            logger.warn('Test warning message');
            logger.error('Test error message', new Error('Test error'));
            Alert.alert('Check terminal for logs');
          }}>
            Test All Logs
          </Button>
        </Card.Actions>
      </Card>

      <Button
        mode="outlined"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        ← Back to Home
      </Button>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  refreshButton: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 14,
    color: '#666',
  },
  dataDetails: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  dataText: {
    fontSize: 12,
    marginBottom: 2,
  },
  keysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  keyChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  perfText: {
    fontSize: 14,
    marginTop: 4,
  },
  backButton: {
    marginTop: 16,
  },
  spacer: {
    height: 40,
  },
});

export default DevDiagnosticScreen;

