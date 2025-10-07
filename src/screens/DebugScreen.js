import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const DebugScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const info = {};
      
      // 1. Vérifier AsyncStorage onboarding
      const onboardingCompleted = await AsyncStorage.getItem('@fitnessrpg:onboarding_completed');
      info.onboardingCompleted = onboardingCompleted;
      info.onboardingCompletedType = typeof onboardingCompleted;
      info.onboardingCompletedBoolean = onboardingCompleted === 'true';
      
      // 2. Vérifier document utilisateur
      const userRef = firestore().doc(`users/${user.uid}`);
      const userDoc = await userRef.get();
      info.userDocExists = userDoc.exists;
      if (userDoc.exists) {
        const data = userDoc.data();
        info.hasPrograms = data.programs ? Object.keys(data.programs).length : 0;
        info.programs = data.programs;
      }
      
      // 3. État utilisateur
      info.userId = user.uid;
      info.userEmail = user.email;
      
      setDebugInfo(info);
    } catch (error) {
      console.error('Erreur diagnostic:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearOnboarding = async () => {
    await AsyncStorage.removeItem('@fitnessrpg:onboarding_completed');
    alert('✅ Flag onboarding supprimé! Redémarre l\'app.');
    runDiagnostic();
  };

  const forceOnboarding = async () => {
    await AsyncStorage.removeItem('@fitnessrpg:onboarding_completed');
    navigation.replace('Onboarding');
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="🔍 Debug Onboarding" />
        <Card.Content>
          <Button mode="contained" onPress={runDiagnostic} loading={loading} style={{ marginBottom: 16 }}>
            🔄 Rafraîchir le diagnostic
          </Button>

          <Text style={styles.sectionTitle}>AsyncStorage</Text>
          <Text style={styles.debugText}>
            @fitnessrpg:onboarding_completed: {JSON.stringify(debugInfo.onboardingCompleted)}
          </Text>
          <Text style={styles.debugText}>
            Type: {debugInfo.onboardingCompletedType}
          </Text>
          <Text style={styles.debugText}>
            Boolean: {JSON.stringify(debugInfo.onboardingCompletedBoolean)}
          </Text>

          <Text style={styles.sectionTitle}>Firestore</Text>
          <Text style={styles.debugText}>
            User doc exists: {JSON.stringify(debugInfo.userDocExists)}
          </Text>
          <Text style={styles.debugText}>
            Has programs: {debugInfo.hasPrograms}
          </Text>

          <Text style={styles.sectionTitle}>User</Text>
          <Text style={styles.debugText}>
            Email: {debugInfo.userEmail}
          </Text>
          <Text style={styles.debugText}>
            UID: {debugInfo.userId?.substring(0, 20)}...
          </Text>

          <View style={{ marginTop: 24 }}>
            <Button 
              mode="outlined" 
              onPress={clearOnboarding}
              style={{ marginBottom: 12 }}
            >
              🗑️ Supprimer flag onboarding
            </Button>

            <Button 
              mode="contained" 
              onPress={forceOnboarding}
              buttonColor="#4D9EFF"
            >
              🚀 Forcer l'affichage de l'onboarding
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0F172A',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#4D9EFF',
  },
  debugText: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 4,
    color: '#B8C5D6',
  },
});

export default DebugScreen;
