/**
 * COMPOSANT DE TEST POUR UserStatsCard
 * 
 * Ce fichier permet de tester le composant UserStatsCard avec différentes valeurs
 * Peut être utilisé dans une screen de test ou pour le développement
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import UserStatsCard from './UserStatsCard';
import { colors } from '../theme/colors';

const UserStatsCardTest = () => {
  const [currentStats, setCurrentStats] = useState({
    strength: 15,
    endurance: 8,
    power: 12,
    speed: 5,
    flexibility: 3
  });

  // Différents profils de test
  const testProfiles = {
    beginner: {
      name: 'Débutant',
      stats: { strength: 5, endurance: 3, power: 2, speed: 1, flexibility: 1 }
    },
    intermediate: {
      name: 'Intermédiaire', 
      stats: { strength: 25, endurance: 20, power: 15, speed: 12, flexibility: 8 }
    },
    advanced: {
      name: 'Avancé',
      stats: { strength: 60, endurance: 55, power: 45, speed: 40, flexibility: 35 }
    },
    elite: {
      name: 'Élite',
      stats: { strength: 95, endurance: 88, power: 92, speed: 85, flexibility: 78 }
    },
    empty: {
      name: 'Vide (undefined)',
      stats: {}
    },
    partial: {
      name: 'Partiel',
      stats: { strength: 30, power: 20 } // Seulement quelques stats
    }
  };

  const handleProfileChange = (profileKey) => {
    setCurrentStats(testProfiles[profileKey].stats);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={[styles.controlCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🧪 Test UserStatsCard
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sélectionner un profil de test :
          </Text>
          
          <View style={styles.buttonGrid}>
            {Object.entries(testProfiles).map(([key, profile]) => (
              <Button
                key={key}
                mode="outlined"
                onPress={() => handleProfileChange(key)}
                style={styles.testButton}
                contentStyle={styles.buttonContent}
              >
                {profile.name}
              </Button>
            ))}
          </View>
          
          <Text style={[styles.currentStats, { color: colors.textSecondary }]}>
            Stats actuelles : {JSON.stringify(currentStats, null, 2)}
          </Text>
        </Card.Content>
      </Card>

      {/* Rendu du composant testé */}
      <UserStatsCard stats={currentStats} />
      
      {/* Tests de cas limites */}
      <Card style={[styles.limitsCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🔬 Tests de cas limites
          </Text>
          
          <Text style={[styles.limitTitle, { color: colors.text }]}>
            Valeurs extrêmes (0, 100, {'>'}100) :
          </Text>
          <UserStatsCard 
            stats={{ 
              strength: 0, 
              endurance: 100, 
              power: 150, 
              speed: -10, 
              flexibility: 50 
            }} 
          />
          
          <Text style={[styles.limitTitle, { color: colors.text }]}>
            Stats null/undefined :
          </Text>
          <UserStatsCard stats={null} />
          
          <Text style={[styles.limitTitle, { color: colors.text }]}>
            Props manquantes :
          </Text>
          <UserStatsCard />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 8
  },
  controlCard: {
    marginBottom: 8,
    elevation: 2
  },
  limitsCard: {
    marginTop: 8,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  testButton: {
    width: '48%',
    marginBottom: 8
  },
  buttonContent: {
    paddingVertical: 4
  },
  currentStats: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 4
  },
  limitTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4
  }
});

export default UserStatsCardTest;
