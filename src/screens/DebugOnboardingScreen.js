import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Button, Text, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { colors } from '../theme/colors';
import { useUserPrograms } from '../hooks/useUserPrograms';

const DebugOnboardingScreen = ({ navigation }) => {
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { userPrograms, loading: programsLoading, refetch } = useUserPrograms();

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const info = {};
      
      // 1. Vérifier document utilisateur
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      info.userDocExists = userDoc.exists();
      info.userData = userDoc.exists() ? userDoc.data() : null;
      
      // 2. Vérifier AsyncStorage tooltip
      const tooltipShown = await AsyncStorage.getItem('@fitnessrpg:tree_tooltip_shown');
      info.tooltipShown = tooltipShown;
      
      // 3. Vérifier hook userPrograms
      info.userProgramsLength = userPrograms.length;
      info.programsLoading = programsLoading;
      info.userProgramsData = userPrograms;
      
      // 4. État utilisateur
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

  const resetUserData = async () => {
    try {
      setLoading(true);
      
      // Supprimer document utilisateur
      const userRef = doc(db, 'users', user.uid);
      await deleteDoc(userRef);
      
      // Supprimer flag tooltip
      await AsyncStorage.removeItem('@fitnessrpg:tree_tooltip_shown');
      
      // Refetch hook
      await refetch();
      
      alert('✅ Données utilisateur réinitialisées');
      runDiagnostic();
    } catch (error) {
      alert('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTestPrograms = async () => {
    try {
      setLoading(true);
      
      const userRef = doc(db, 'users', user.uid);
      const testData = {
        programs: {
          'street-workout': {
            xp: 0,
            level: 0,
            completedSkills: 0,
            totalSkills: 20,
            lastSession: null
          }
        },
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        totalXP: 0,
        globalLevel: 1,
        email: user.email
      };
      
      await setDoc(userRef, testData, { merge: true });
      await refetch();
      
      alert('✅ Programmes test créés');
      runDiagnostic();
    } catch (error) {
      alert('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testNavigation = () => {
    navigation.navigate('Main', {
      screen: 'Home',
      params: {
        triggerTreeTooltip: true,
        forceShowDashboard: true,
        newUserPrograms: ['street-workout']
      }
    });
  };

  useEffect(() => {
    runDiagnostic();
  }, [userPrograms]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 Debug Onboarding</Text>
      
      {/* Actions */}
      <Card style={styles.card}>
        <Card.Title title="Actions de test" />
        <Card.Content>
          <Button mode="contained" onPress={runDiagnostic} disabled={loading} style={styles.button}>
            🔍 Diagnostic complet
          </Button>
          <Button mode="outlined" onPress={resetUserData} disabled={loading} style={styles.button}>
            🗑️ Reset utilisateur
          </Button>
          <Button mode="outlined" onPress={createTestPrograms} disabled={loading} style={styles.button}>
            ➕ Créer programmes test
          </Button>
          <Button mode="contained" onPress={testNavigation} style={styles.button}>
            🚀 Test navigation Home
          </Button>
        </Card.Content>
      </Card>

      {/* Résultats diagnostic */}
      <Card style={styles.card}>
        <Card.Title title="Résultats Diagnostic" />
        <Card.Content>
          <Text style={styles.debugText}>
            {JSON.stringify(debugInfo, null, 2)}
          </Text>
        </Card.Content>
      </Card>

      {/* État hook */}
      <Card style={styles.card}>
        <Card.Title title="État Hook useUserPrograms" />
        <Card.Content>
          <View style={styles.chipContainer}>
            <Chip icon="account" mode="flat">
              Programmes: {userPrograms.length}
            </Chip>
            <Chip icon="loading" mode="flat">
              Loading: {programsLoading ? 'OUI' : 'NON'}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Navigation */}
      <Card style={styles.card}>
        <Card.Title title="Navigation" />
        <Card.Content>
          <Button mode="outlined" onPress={() => navigation.navigate('ProgramSelection')} style={styles.button}>
            📋 Program Selection
          </Button>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
            ← Retour
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  button: {
    marginBottom: 8,
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

export default DebugOnboardingScreen;
