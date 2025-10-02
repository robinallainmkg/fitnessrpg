import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, ImageBackground } from 'react-native';
import { Card, Button, Text, Chip, ActivityIndicator } from 'react-native-paper';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import programs from '../data/programs.json';
import { colors } from '../theme/colors';

const ProgramSelectionScreen = ({ navigation }) => {
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [existingPrograms, setExistingPrograms] = useState({});
  const { user } = useAuth();
  const maxPrograms = 2;

  // Charger les programmes existants de l'utilisateur
  useEffect(() => {
    const loadExistingPrograms = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userPrograms = userData.programs || {};
          
          // Pré-sélectionner les programmes existants
          const existingProgramIds = Object.keys(userPrograms);
          setSelectedPrograms(existingProgramIds);
          setExistingPrograms(userPrograms);
        }
      } catch (error) {
        console.error('Erreur chargement programmes:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingPrograms();
  }, [user.uid]);

  const handleSelectProgram = (programId) => {
    if (selectedPrograms.includes(programId)) {
      // Déselectionner
      setSelectedPrograms(selectedPrograms.filter(id => id !== programId));
    } else {
      // Sélectionner (max 2)
      if (selectedPrograms.length < maxPrograms) {
        setSelectedPrograms([...selectedPrograms, programId]);
      }
    }
  };

  const handleValidate = async () => {
    if (selectedPrograms.length === 0) {
      Alert.alert(
        "Programme requis",
        "Sélectionne au moins un programme pour commencer ton aventure !"
      );
      return;
    }

    setLoading(true);
    
    try {
      const userId = user.uid;
      const userRef = doc(db, 'users', userId);
      
      // Créer l'objet programs pour Firestore
      const programsData = {};
      selectedPrograms.forEach(programId => {
        const category = programs.categories.find(c => c.id === programId);
        if (category) {
          // Garder les données existantes ou créer nouvelles
          programsData[programId] = existingPrograms[programId] || {
            xp: 0,
            level: 0,
            completedSkills: 0,
            totalSkills: category.programs.length,
            lastSession: null
          };
        }
      });

      // Mettre à jour Firestore
      const updateData = {
        programs: programsData
      };
      
      // Marquer l'onboarding comme terminé seulement si c'est un nouvel utilisateur
      if (Object.keys(existingPrograms).length === 0) {
        updateData.onboardingCompleted = true;
      }
      
      await updateDoc(userRef, updateData);

      // Navigation vers HomeScreen
      navigation.navigate('Home');
      
    } catch (error) {
      console.error("Erreur sélection programmes:", error);
      Alert.alert(
        "Erreur",
        "Impossible de sauvegarder tes programmes. Réessaie."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatIcon = (stat) => {
    switch (stat) {
      case 'strength': return '💪 Force';
      case 'power': return '⚡ Puissance';
      case 'endurance': return '🔋 Endurance';
      case 'speed': return '🚀 Vitesse';
      case 'mobility': return '🤸 Mobilité';
      case 'coordination': return '🎯 Coordination';
      default: return stat;
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de tes programmes...</Text>
      </View>
    );
  }

  const isExistingUser = Object.keys(existingPrograms).length > 0;

  return (
    <ImageBackground 
      source={require('../../assets/Home-BG-2.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay} />
      <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isExistingUser ? "Modifie tes programmes" : "Quelle discipline souhaites-tu développer ?"}
        </Text>
        <Text style={styles.subtitle}>
          {isExistingUser ? "Tu peux changer tes programmes actuels" : `Rejoins jusqu'à ${maxPrograms} programmes simultanés`}
        </Text>
        <Text style={styles.description}>
          {isExistingUser 
            ? "Ajoute, retire ou modifie tes programmes d'entraînement selon tes envies !"
            : `Tu peux soit focus à fond dans un domaine, ou en faire ${maxPrograms} pour varier les plaisirs !`
          }
        </Text>
        
        {/* Chips sélection */}
        <View style={styles.selectionInfo}>
          <Chip 
            icon="check-circle"
            mode="flat"
            style={{
              backgroundColor: selectedPrograms.length > 0 ? colors.primary + '20' : colors.border + '40',
              borderColor: selectedPrograms.length > 0 ? colors.primary : colors.border,
              borderWidth: 1
            }}
            textStyle={{
              color: selectedPrograms.length > 0 ? colors.primary : colors.textSecondary,
              fontWeight: '600'
            }}
          >
            {selectedPrograms.length}/{maxPrograms} sélectionné(s)
          </Chip>
        </View>
      </View>

      {/* Liste des programmes */}
      {programs.categories.map((category) => {
        const isSelected = selectedPrograms.includes(category.id);
        const isDisabled = !isSelected && selectedPrograms.length >= maxPrograms;

        return (
          <Card
            key={category.id}
            style={[
              styles.programCard,
              isSelected && styles.programCardSelected,
              isDisabled && styles.programCardDisabled
            ]}
            onPress={() => !isDisabled && handleSelectProgram(category.id)}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.programIcon}>{category.icon}</Text>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.programName}>{category.name}</Text>
                  {isSelected && (
                    <Chip 
                      mode="flat" 
                      style={styles.selectedChip}
                      textStyle={{
                        color: colors.success,
                        fontWeight: 'bold',
                        fontSize: 12
                      }}
                      compact
                    >
                      ✓ Sélectionné
                    </Chip>
                  )}
                </View>
              </View>
              
              <Text style={styles.programDescription}>
                {category.description}
              </Text>
              
              {/* Infos du programme */}
              <View style={styles.programInfo}>
                <Chip 
                  mode="outlined" 
                  compact 
                  style={styles.infoChip}
                  textStyle={{ color: colors.primary, fontSize: 12, fontWeight: '500' }}
                >
                  📚 {category.programs.length} programmes
                </Chip>
                <Chip 
                  mode="outlined" 
                  compact 
                  style={styles.infoChip}
                  textStyle={{ color: colors.primary, fontSize: 12, fontWeight: '500' }}
                >
                  {category.type === 'skill-tree' ? '🌳 Arbre de compétences' : '📋 Programmes'}
                </Chip>
              </View>
              
              {/* Stats primaires du programme */}
              {category.primaryStats && category.primaryStats.length > 0 && (
                <View style={styles.statsContainer}>
                  <Text style={styles.statsLabel}>Développe :</Text>
                  <View style={styles.statsChips}>
                    {category.primaryStats.map(stat => (
                      <Chip 
                        key={stat} 
                        mode="outlined" 
                        compact 
                        style={styles.statChip}
                        textStyle={{ color: colors.secondary, fontSize: 11, fontWeight: '600' }}
                      >
                        {getStatIcon(stat)}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        );
      })}

      {/* Bouton validation */}
      <Button
        mode="contained"
        onPress={handleValidate}
        disabled={selectedPrograms.length === 0 || loading}
        style={styles.validateButton}
        buttonColor={selectedPrograms.length > 0 ? colors.primary : colors.border}
        loading={loading}
        icon={loading ? undefined : isExistingUser ? "content-save" : "rocket-launch"}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={{ 
          fontSize: 16, 
          fontWeight: 'bold',
          color: selectedPrograms.length > 0 ? '#FFFFFF' : colors.textSecondary
        }}
      >
        {loading 
          ? "Sauvegarde..." 
          : isExistingUser 
          ? "Sauvegarder les modifications"
          : "Commencer mon aventure !"
        }
      </Button>
      
      {/* Espace en bas pour le scroll */}
      <View style={styles.bottomSpace} />
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  container: {
    flex: 1,
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary
  },
  header: {
    marginBottom: 32,
    paddingHorizontal: 4,
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    elevation: 2
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4
  },
  programCard: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  programCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    elevation: 6,
    backgroundColor: colors.card,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  programCardDisabled: {
    opacity: 0.4,
    backgroundColor: colors.surface
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingTop: 4
  },
  programIcon: {
    fontSize: 52,
    marginRight: 16,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  cardTitleContainer: {
    flex: 1,
    paddingTop: 4
  },
  programName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8
  },
  selectedChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.success + '20',
    borderColor: colors.success
  },
  programDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: colors.textSecondary,
    lineHeight: 22
  },
  programInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  infoChip: {
    height: 32,
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary + '40'
  },
  statsContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  statsLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  statsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  statChip: {
    height: 32,
    backgroundColor: colors.secondary + '15',
    borderColor: colors.secondary + '40'
  },
  validateButton: {
    marginVertical: 32,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bottomSpace: {
    height: 32
  }
});

export default ProgramSelectionScreen;
