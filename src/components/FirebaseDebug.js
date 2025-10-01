import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth, db } from '../services/firebase';

const FirebaseDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    authReady: false,
    dbReady: false,
    currentUser: null,
    error: null
  });

  const [showDebug, setShowDebug] = useState(__DEV__); // Seulement en dev

  useEffect(() => {
    try {
      const authReady = !!auth;
      const dbReady = !!db;
      const currentUser = auth?.currentUser;
      
      setDebugInfo({
        authReady,
        dbReady,
        currentUser: currentUser ? currentUser.email : 'Pas connecté',
        error: null
      });

      console.log('🔥 Firebase Debug:', {
        authReady,
        dbReady,
        currentUser: currentUser?.email || 'Pas connecté'
      });
    } catch (error) {
      console.error('❌ Firebase Error:', error);
      setDebugInfo(prev => ({ ...prev, error: error.message }));
    }
  }, []);

  if (!showDebug) return null;

  return (
    <View style={styles.debugContainer}>
      <TouchableOpacity 
        style={styles.debugToggle}
        onPress={() => setShowDebug(!showDebug)}
      >
        <Text style={styles.debugTitle}>🔥 Firebase Debug</Text>
      </TouchableOpacity>
      
      <View style={styles.debugContent}>
        <Text style={[styles.debugText, debugInfo.authReady ? styles.success : styles.error]}>
          Auth: {debugInfo.authReady ? '✅ OK' : '❌ KO'}
        </Text>
        <Text style={[styles.debugText, debugInfo.dbReady ? styles.success : styles.error]}>
          DB: {debugInfo.dbReady ? '✅ OK' : '❌ KO'}
        </Text>
        <Text style={styles.debugText}>
          User: {debugInfo.currentUser}
        </Text>
        {debugInfo.error && (
          <Text style={[styles.debugText, styles.error]}>
            Error: {debugInfo.error}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  debugContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 5,
    zIndex: 9999,
    minWidth: 200,
  },
  debugToggle: {
    marginBottom: 5,
  },
  debugTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  debugContent: {
    // contenu visible
  },
  debugText: {
    color: '#fff',
    fontSize: 10,
    marginVertical: 2,
  },
  success: {
    color: '#4CAF50',
  },
  error: {
    color: '#F44336',
  },
});

export default FirebaseDebug;
