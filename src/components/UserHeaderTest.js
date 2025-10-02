/**
 * COMPOSANT DE TEST POUR UserHeader
 * 
 * Ce fichier permet de tester le composant UserHeader avec différentes valeurs
 * et niveaux d'utilisateur
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Text, Card, Divider } from 'react-native-paper';
import UserHeader from './UserHeader';
import { colors } from '../theme/colors';

const UserHeaderTest = () => {
  const [currentUser, setCurrentUser] = useState({
    username: 'Robin Allain',
    globalLevel: 7,
    globalXP: 5200,
    title: 'Champion',
    streak: 12
  });

  // Différents profils de test
  const testProfiles = {
    beginner: {
      name: 'Débutant',
      user: {
        username: 'Alex Martin',
        globalLevel: 1,
        globalXP: 150,
        title: 'Débutant',
        streak: 3
      }
    },
    intermediate: {
      name: 'Intermédiaire',
      user: {
        username: 'Sarah Johnson',
        globalLevel: 5,
        globalXP: 2800,
        title: 'Guerrier',
        streak: 8
      }
    },
    advanced: {
      name: 'Avancé',
      user: {
        username: 'Mike Chen',
        globalLevel: 12,
        globalXP: 15000,
        title: 'Maître',
        streak: 25
      }
    },
    elite: {
      name: 'Élite',
      user: {
        username: 'Emma Rodriguez',
        globalLevel: 22,
        globalXP: 50000,
        title: 'Légende',
        streak: 45
      }
    },
    noStreak: {
      name: 'Sans Streak',
      user: {
        username: 'John Doe',
        globalLevel: 3,
        globalXP: 1000,
        title: 'Guerrier',
        streak: 0
      }
    },
    longName: {
      name: 'Nom Long',
      user: {
        username: 'Maximilian Christopher Anderson-Smith',
        globalLevel: 8,
        globalXP: 6500,
        title: 'Champion',
        streak: 15
      }
    }
  };

  const handleProfileChange = (profileKey) => {
    setCurrentUser(testProfiles[profileKey].user);
  };

  // Calculs pour l'utilisateur actuel
  const nextLevelXP = Math.pow(currentUser.globalLevel + 1, 2) * 100;
  const currentLevelXP = Math.pow(currentUser.globalLevel, 2) * 100;
  const progressXP = currentUser.globalXP - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={[styles.controlCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🧪 Test UserHeader
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
          
          <Divider style={styles.divider} />
          
          <Text style={[styles.currentInfo, { color: colors.text }]}>
            📊 Informations actuelles :
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Utilisateur : {currentUser.username}
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Niveau : {currentUser.globalLevel} ({currentUser.title})
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • XP : {currentUser.globalXP.toLocaleString()}
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Progression : {progressXP} / {neededXP} XP vers niveau {currentUser.globalLevel + 1}
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Streak : {currentUser.streak} jours
          </Text>
        </Card.Content>
      </Card>

      {/* Rendu du composant testé */}
      <UserHeader 
        username={currentUser.username}
        globalLevel={currentUser.globalLevel}
        globalXP={currentUser.globalXP}
        title={currentUser.title}
        streak={currentUser.streak}
      />
      
      {/* Tests de cas limites */}
      <Card style={[styles.limitsCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🔬 Tests de cas limites
          </Text>
          
          <Text style={[styles.limitTitle, { color: colors.text }]}>
            Niveau 0 (débutant absolu) :
          </Text>
          <UserHeader 
            username="Nouveau"
            globalLevel={0}
            globalXP={0}
            title="Débutant"
            streak={0}
          />
          
          <Text style={[styles.limitTitle, { color: colors.text }]}>
            Valeurs par défaut (props manquantes) :
          </Text>
          <UserHeader />
          
          <Text style={[styles.limitTitle, { color: colors.text }]}>
            Nom très court :
          </Text>
          <UserHeader 
            username="Jo"
            globalLevel={5}
            globalXP={2500}
            title="Guerrier"
            streak={7}
          />
        </Card.Content>
      </Card>

      {/* Guide des couleurs de titre */}
      <Card style={[styles.colorsCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🎨 Guide des couleurs de titre
          </Text>
          
          <View style={styles.colorGuide}>
            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: '#9E9E9E' }]} />
              <Text style={[styles.colorText, { color: colors.text }]}>
                Débutant (Niveaux 0-2)
              </Text>
            </View>
            
            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: '#4CAF50' }]} />
              <Text style={[styles.colorText, { color: colors.text }]}>
                Guerrier (Niveaux 3-6)
              </Text>
            </View>
            
            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: '#CD7F32' }]} />
              <Text style={[styles.colorText, { color: colors.text }]}>
                Champion (Niveaux 7-11)
              </Text>
            </View>
            
            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: '#C0C0C0' }]} />
              <Text style={[styles.colorText, { color: colors.text }]}>
                Maître (Niveaux 12-19)
              </Text>
            </View>
            
            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: '#FFD700' }]} />
              <Text style={[styles.colorText, { color: colors.text }]}>
                Légende (Niveau 20+)
              </Text>
            </View>
          </View>
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
  colorsCard: {
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
  divider: {
    marginVertical: 16
  },
  currentInfo: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    paddingLeft: 8
  },
  limitTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8
  },
  colorGuide: {
    marginTop: 8
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12
  },
  colorText: {
    fontSize: 14,
    flex: 1
  }
});

export default UserHeaderTest;
