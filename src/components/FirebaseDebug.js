import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const FirebaseDebug = () => {
  const { user } = useAuth();
  
  const [debugInfo, setDebugInfo] = useState({
    authReady: true, // Mock toujours OK
    dbReady: true,   // Mock toujours OK
    currentUser: user,
    error: null
  });

  const [showDebug, setShowDebug] = useState(false); // Désactivé visuellement

  useEffect(() => {
    try {
      // Utiliser le mock AuthContext au lieu du vrai Firebase
      setDebugInfo({
        authReady: true,
        dbReady: true,
        currentUser: user ? user.email : 'Pas connecté',
        error: null
      });

      console.log('🔥 Firebase Debug MOCK:', {
        authReady: true,
        dbReady: true,
        currentUser: user?.email || 'Pas connecté'
      });
    } catch (error) {
      console.error('❌ Firebase Mock Error:', error);
      setDebugInfo(prev => ({ ...prev, error: error.message }));
    }
  }, [user]);

  // Firebase Debug désactivé
  return null;

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
