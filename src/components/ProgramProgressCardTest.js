/**
 * COMPOSANT DE TEST POUR ProgramProgressCard
 * 
 * Ce fichier permet de tester le composant ProgramProgressCard avec différents
 * programmes et niveaux de progression
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Button, Text, Card, Divider } from 'react-native-paper';
import ProgramProgressCard from './ProgramProgressCard';
import { colors } from '../theme/colors';

const ProgramProgressCardTest = () => {
  const [selectedProgram, setSelectedProgram] = useState('street');

  // Programmes de test (basés sur programs.json)
  const testPrograms = {
    street: {
      id: 'street',
      name: 'Street Workout',
      icon: '🏋️',
      color: '#6C63FF',
      description: 'L\'arbre de compétences complet du calisthenics.',
      programs: new Array(22) // Simule 22 skills
    },
    boxing: {
      id: 'boxing',
      name: 'Boxing Elite',
      icon: '🥊',
      color: '#FF6B6B',
      description: 'Maîtrise l\'art noble de la boxe.',
      programs: new Array(15) // Simule 15 skills
    },
    yoga: {
      id: 'yoga',
      name: 'Yoga Flow',
      icon: '🧘',
      color: '#4CAF50',
      description: 'Flexibilité et sérénité intérieure.',
      programs: new Array(18) // Simule 18 skills
    },
    running: {
      id: 'running',
      name: 'Ultra Running',
      icon: '🏃',
      color: '#2196F3',
      description: 'De débutant à ultra-marathonien.',
      programs: new Array(12) // Simule 12 skills
    }
  };

  // Différents niveaux de progression
  const progressLevels = {
    beginner: {
      name: 'Débutant',
      street: { xp: 500, level: 2, completedSkills: 2, totalSkills: 22 },
      boxing: { xp: 200, level: 1, completedSkills: 1, totalSkills: 15 },
      yoga: { xp: 0, level: 0, completedSkills: 0, totalSkills: 18 },
      running: { xp: 0, level: 0, completedSkills: 0, totalSkills: 12 }
    },
    intermediate: {
      name: 'Intermédiaire',
      street: { xp: 3200, level: 5, completedSkills: 8, totalSkills: 22 },
      boxing: { xp: 1800, level: 4, completedSkills: 6, totalSkills: 15 },
      yoga: { xp: 900, level: 3, completedSkills: 4, totalSkills: 18 },
      running: { xp: 600, level: 2, completedSkills: 3, totalSkills: 12 }
    },
    advanced: {
      name: 'Avancé',
      street: { xp: 8500, level: 9, completedSkills: 16, totalSkills: 22 },
      boxing: { xp: 4200, level: 6, completedSkills: 11, totalSkills: 15 },
      yoga: { xp: 3100, level: 5, completedSkills: 12, totalSkills: 18 },
      running: { xp: 2800, level: 5, completedSkills: 8, totalSkills: 12 }
    },
    master: {
      name: 'Maître',
      street: { xp: 15000, level: 12, completedSkills: 22, totalSkills: 22 },
      boxing: { xp: 7500, level: 8, completedSkills: 15, totalSkills: 15 },
      yoga: { xp: 6200, level: 7, completedSkills: 18, totalSkills: 18 },
      running: { xp: 4500, level: 6, completedSkills: 12, totalSkills: 12 }
    }
  };

  const [currentLevel, setCurrentLevel] = useState('intermediate');

  const handleProgramPress = (programId) => {
    Alert.alert(
      '🌳 Navigation',
      `Naviguer vers l'arbre du programme: ${testPrograms[programId]?.name}`,
      [{ text: 'OK' }]
    );
  };

  const getCurrentProgress = (programId) => {
    return progressLevels[currentLevel][programId];
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Contrôles de test */}
      <Card style={[styles.controlCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🧪 Test ProgramProgressCard
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Niveau de progression :
          </Text>
          
          <View style={styles.levelButtons}>
            {Object.entries(progressLevels).map(([key, level]) => (
              <Button
                key={key}
                mode={currentLevel === key ? 'contained' : 'outlined'}
                onPress={() => setCurrentLevel(key)}
                style={styles.levelButton}
                compact
              >
                {level.name}
              </Button>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Programme sélectionné : {testPrograms[selectedProgram]?.name}
          </Text>
          
          <View style={styles.programButtons}>
            {Object.entries(testPrograms).map(([key, program]) => (
              <Button
                key={key}
                mode={selectedProgram === key ? 'contained' : 'outlined'}
                onPress={() => setSelectedProgram(key)}
                style={styles.programButton}
                compact
              >
                {program.icon}
              </Button>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Affichage du composant testé */}
      <Text style={[styles.previewTitle, { color: colors.text }]}>
        📱 Aperçu
      </Text>
      
      <ProgramProgressCard
        program={testPrograms[selectedProgram]}
        progress={getCurrentProgress(selectedProgram)}
        onPress={handleProgramPress}
      />

      {/* Tous les programmes pour comparaison */}
      <Text style={[styles.previewTitle, { color: colors.text }]}>
        🗂️ Tous les programmes ({progressLevels[currentLevel].name})
      </Text>
      
      {Object.entries(testPrograms).map(([key, program]) => (
        <ProgramProgressCard
          key={key}
          program={program}
          progress={getCurrentProgress(key)}
          onPress={handleProgramPress}
        />
      ))}

      {/* Tests de cas limites */}
      <Text style={[styles.previewTitle, { color: colors.text }]}>
        🔬 Cas limites
      </Text>
      
      <Text style={[styles.limitTitle, { color: colors.text }]}>
        Programme sans progression :
      </Text>
      <ProgramProgressCard
        program={testPrograms.street}
        progress={{ xp: 0, level: 0, completedSkills: 0, totalSkills: 22 }}
        onPress={handleProgramPress}
      />
      
      <Text style={[styles.limitTitle, { color: colors.text }]}>
        Programme complété à 100% :
      </Text>
      <ProgramProgressCard
        program={testPrograms.boxing}
        progress={{ xp: 10000, level: 10, completedSkills: 15, totalSkills: 15 }}
        onPress={handleProgramPress}
      />
      
      <Text style={[styles.limitTitle, { color: colors.text }]}>
        Props manquantes (programme null) :
      </Text>
      <ProgramProgressCard
        program={null}
        progress={{ xp: 1000, level: 3, completedSkills: 5, totalSkills: 10 }}
        onPress={handleProgramPress}
      />

      {/* Informations debug */}
      <Card style={[styles.debugCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🔍 Debug Info
          </Text>
          
          <Text style={[styles.debugText, { color: colors.textSecondary }]}>
            Programme : {JSON.stringify(testPrograms[selectedProgram], null, 2)}
          </Text>
          
          <Text style={[styles.debugText, { color: colors.textSecondary }]}>
            Progression : {JSON.stringify(getCurrentProgress(selectedProgram), null, 2)}
          </Text>
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
    marginBottom: 16,
    elevation: 2
  },
  debugCard: {
    marginTop: 16,
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
    marginBottom: 8,
    fontWeight: '600'
  },
  levelButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  levelButton: {
    width: '48%',
    marginBottom: 8
  },
  programButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8
  },
  programButton: {
    minWidth: 60
  },
  divider: {
    marginVertical: 16
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
    marginHorizontal: 16
  },
  limitTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16
  },
  debugText: {
    fontSize: 10,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8
  }
});

export default ProgramProgressCardTest;
