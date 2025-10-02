import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Version debug simple - sans Firebase ni navigation
export default function App() {
  React.useEffect(() => {
    console.log('App started successfully');
    Alert.alert('Debug', 'App loaded without crash!');
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.text}>🏋️ Fitness RPG</Text>
      <Text style={styles.debug}>Debug Mode - App is running!</Text>
      <Text style={styles.version}>Version: 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  debug: {
    color: '#00ff00',
    fontSize: 16,
    marginBottom: 10,
  },
  version: {
    color: '#888888',
    fontSize: 12,
  },
});
