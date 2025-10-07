import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, ImageBackground, TouchableOpacity } from 'react-native';
import { Card, Button, Text, Chip, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import SignupModal from '../components/SignupModal';
import programs from '../data/programs.json';
import { colors } from '../theme/colors';

const ProgramSelectionScreen = ({ navigation }) => {
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [existingPrograms, setExistingPrograms] = useState({});
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [pendingProgramData, setPendingProgramData] = useState(null);
  const { user, isGuest, saveGuestData } = useAuth();
  const maxPrograms = 2;

  // Personnaliser le header de navigation avec style gaming
  useEffect(() => {
    navigation.setOptions({
      title: '⚔️ Choisis tes Quêtes',
      headerStyle: {
        backgroundColor: '#4D9EFF',
        elevation: 8,
        shadowColor: '#4D9EFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 18,
        letterSpacing: 0.5,
      },
      headerShadowVisible: true,
    });
  }, [navigation]);

  // Charger les programmes existants de l'utilisateur
  useEffect(() => {
    const loadExistingPrograms = async () => {
      try {
        // Si mode invité, charger depuis AsyncStorage
        if (isGuest) {
          console.log('👤 Mode invité - Chargement depuis AsyncStorage');
          const guestPrograms = await AsyncStorage.getItem('@fitnessrpg:guest_programs');
          if (guestPrograms) {
            const parsedPrograms = JSON.parse(guestPrograms);
            setSelectedPrograms(Object.keys(parsedPrograms));
            setExistingPrograms(parsedPrograms);
          }
          setInitialLoading(false);
          return;
        }

        // Si utilisateur authentifié, charger depuis Firestore
        if (user && !isGuest) {
          const userRef = firestore().collection('users').doc(user.uid);
          const userDoc = await userRef.get();
          
          if (userDoc.exists) {
            const userData = userDoc.data();
            const userPrograms = userData.programs || {};
            
            // Pré-sélectionner les programmes existants
            const existingProgramIds = Object.keys(userPrograms);
            setSelectedPrograms(existingProgramIds);
            setExistingPrograms(userPrograms);
            
            console.log('🔍 ProgramSelection State:', {
              loading: initialLoading,
              selectedPrograms: existingProgramIds,
              isExistingUser: existingProgramIds.length > 0,
              buttonDisabled: existingProgramIds.length === 0
            });
          }
        }
      } catch (error) {
        console.error('Erreur chargement programmes:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingPrograms();
  }, [user, isGuest]);

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

    console.log('🔘 Bouton validation cliqué, selectedPrograms:', selectedPrograms);
    
    // Si mode invité, sauvegarder temporairement et afficher modal signup
    if (isGuest) {
      console.log('👤 Mode invité détecté - Préparation données pour signup');
      
      // Préparer les données du programme
      const programsData = {};
      selectedPrograms.forEach(programId => {
        const category = programs.categories.find(c => c.id === programId);
        if (category && category.programs) {
          programsData[programId] = {
            xp: 0,
            level: 1,
            completedSkills: [],
            skillProgress: {},
            totalSkills: category.programs.length,
            lastSession: null
          };
        }
      });

      // Sauvegarder en AsyncStorage pour mode invité
      await AsyncStorage.setItem('@fitnessrpg:guest_programs', JSON.stringify(programsData));
      
      // Préparer les données pour la conversion
      const guestDataToSave = {
        programs: programsData,
        selectedPrograms: selectedPrograms,
        activePrograms: selectedPrograms.slice(0, 2),
        onboardingCompleted: true,
      };
      
      setPendingProgramData(guestDataToSave);
      await saveGuestData(guestDataToSave);
      
      // Afficher le modal de signup
      setShowSignupModal(true);
      return;
    }

    // Mode authentifié - procéder normalement
    setLoading(true);
    
    try {
      const userId = user.uid;
      const userRef = firestore().collection('users').doc(userId);
      
      // Créer l'objet programs pour Firestore
      const programsData = {};
      selectedPrograms.forEach(programId => {
        const category = programs.categories.find(c => c.id === programId);
        if (category && category.programs) {
          // Garder les données existantes ou créer nouvelles avec la structure correcte
          programsData[programId] = existingPrograms[programId] || {
            xp: 0,
            level: 1,
            completedSkills: [], // Array des IDs de compétences 100% complétées
            skillProgress: {}, // Object: { skillId: { completedLevels: [1,2,3], currentLevel: 4 } }
            totalSkills: category.programs.length,
            lastSession: null
          };
        }
      });

      // Préparer les données à sauvegarder
      const activeProgramsList = selectedPrograms.slice(0, 2);
      const updateData = {
        programs: programsData,
        selectedPrograms: selectedPrograms, // Sauvegarder les programmes sélectionnés
        activePrograms: activeProgramsList, // Activer automatiquement les 2 premiers (ou moins)
      };
      
      console.log('💾 Saving to Firestore:', {
        selectedPrograms,
        activePrograms: activeProgramsList,
        programsData
      });
      
      // Marquer l'onboarding comme terminé seulement si c'est un nouvel utilisateur
      if (Object.keys(existingPrograms).length === 0) {
        updateData.onboardingCompleted = true;
        // Pour un nouvel utilisateur, créer le document avec les champs de base
        updateData.createdAt = new Date().toISOString();
        updateData.totalXP = 0;
        updateData.globalLevel = 1;
        updateData.email = user.email;
        
        await userRef.set(updateData, { merge: true });
        console.log('✅ Nouveau document utilisateur créé avec programmes');
      } else {
        // Pour un utilisateur existant, mettre à jour le document
        await userRef.update(updateData);
        console.log('✅ Document utilisateur mis à jour');
      }

      // Navigation vers HomeScreen avec trigger tooltip pour nouveaux utilisateurs
      if (Object.keys(existingPrograms).length === 0) {
        console.log('🚀 Programmes sélectionnés - App.js va détecter le changement et afficher Main');
        
        // Marquer l'onboarding comme terminé dans AsyncStorage
        await AsyncStorage.setItem('@fitnessrpg:onboarding_completed', 'true');
        
        // Réinitialiser le flag tooltip pour permettre l'affichage
        await AsyncStorage.removeItem('@fitnessrpg:tree_tooltip_shown');
        
        // ✅ App.js va automatiquement détecter le changement et afficher Main Stack
        // Pas besoin de navigation.reset() ici car on est dans un Stack différent
      } else {
        console.log('🚀 Navigation vers Home pour utilisateur existant avec refresh');
        // Forcer le rechargement des données en passant un timestamp
        navigation.navigate('Main', {
          screen: 'Home',
          params: {
            refresh: Date.now() // Force un refresh des données
          }
        });
      }
      
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
      case 'flexibility': return '🤸 Flexibilité';
      case 'mobility': return '🤸 Mobilité';
      case 'coordination': return '🎯 Coordination';
      default: return stat;
    }
  };

  // Calculer les stats principales d'une catégorie
  const getPrimaryStats = (category) => {
    const statTotals = {};
    
    // Parcourir toutes les compétences de la catégorie
    category.programs?.forEach(program => {
      const bonuses = program.statBonuses || {};
      Object.entries(bonuses).forEach(([stat, value]) => {
        statTotals[stat] = (statTotals[stat] || 0) + value;
      });
    });
    
    // Trier par total décroissant et garder les 3 premières
    const sortedStats = Object.entries(statTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([stat]) => stat);
    
    return sortedStats;
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D9EFF" />
        <Text style={styles.loadingText}>⚔️ Chargement de tes quêtes...</Text>
      </View>
    );
  }

  const isExistingUser = Object.keys(existingPrograms).length > 0;
  
  console.log('🔍 ProgramSelection State:', {
    selectedPrograms,
    isExistingUser,
    loading,
    buttonDisabled: selectedPrograms.length === 0 || loading
  });

  const handleSignupSuccess = async () => {
    console.log('✅ Signup réussi - Navigation vers HomeScreen');
    
    // Marquer l'onboarding comme terminé
    await AsyncStorage.setItem('@fitnessrpg:onboarding_completed', 'true');
    
    // Nettoyer les données temporaires
    await AsyncStorage.removeItem('@fitnessrpg:guest_programs');
    
    // Naviguer vers l'écran principal
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleContinueAsGuest = () => {
    console.log('👤 Continuer en mode invité');
    setShowSignupModal(false);
    
    // Permettre la navigation en mode invité
    Alert.alert(
      'Mode invité activé',
      'Tu peux utiliser l\'app, mais tes données ne seront pas sauvegardées de façon permanente. Crée un compte à tout moment depuis ton profil.',
      [
        {
          text: 'Compris !',
          onPress: async () => {
            // Marquer onboarding comme terminé
            await AsyncStorage.setItem('@fitnessrpg:onboarding_completed', 'true');
            
            // Naviguer vers l'app
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          }
        }
      ]
    );
  };

  return (
    <>
      <ImageBackground 
        source={require('../../assets/Home-BG-2.jpg')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.backgroundOverlay} />
      
      {/* Bouton retour */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView style={styles.container}>
      {/* Header avec style gaming */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isExistingUser ? "⚔️ Modifie tes Quêtes" : "⚔️ Choisis ta Discipline"}
        </Text>
        <Text style={styles.subtitle}>
          {isExistingUser ? "Change tes programmes d'entraînement" : `Rejoins jusqu'à ${maxPrograms} programmes simultanés`}
        </Text>
        <Text style={styles.description}>
          {isExistingUser 
            ? "Rejoins jusqu'à 2 programmes simultanés"
            : "Focus sur une discipline ou varie les plaisirs !"
          }
        </Text>
        
        {/* Chip de sélection avec style néon */}
        <View style={styles.selectionInfo}>
          <View style={[
            styles.selectionChip,
            selectedPrograms.length > 0 && styles.selectionChipActive
          ]}>
            <Text style={[
              styles.selectionChipText,
              selectedPrograms.length > 0 && styles.selectionChipTextActive
            ]}>
              {selectedPrograms.length > 0 ? '✓' : '○'} {selectedPrograms.length}/{maxPrograms} sélectionné(s)
            </Text>
          </View>
        </View>
      </View>

      {/* Liste des programmes avec style gaming */}
      {programs.categories.map((category) => {
        const isSelected = selectedPrograms.includes(category.id);
        const isDisabled = !isSelected && selectedPrograms.length >= maxPrograms;

        return (
          <TouchableOpacity
            key={category.id}
            activeOpacity={0.8}
            disabled={isDisabled}
            onPress={() => !isDisabled && handleSelectProgram(category.id)}
            style={styles.cardContainer}
          >
            <ImageBackground
              source={require('../../assets/programmes/StreetWorkout.jpg')}
              style={[
                styles.programCard,
                isSelected && styles.programCardSelected,
                isDisabled && styles.programCardDisabled
              ]}
              imageStyle={styles.cardImage}
            >
              {/* Overlay gradient */}
              <LinearGradient
                colors={[
                  'rgba(10, 14, 39, 0.00)',
                  'rgba(10, 14, 39, 0.20)',
                  'rgba(10, 14, 39, 0.70)',
                  'rgba(10, 14, 39, 0.95)'
                ]}
                locations={[0, 0.3, 0.65, 1]}
                style={styles.cardOverlay}
              />
              
              <View style={styles.cardContent}>
                {/* Badge sélectionné en haut à gauche */}
                <View style={styles.topContent}>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeEmoji}>✓</Text>
                      <Text style={styles.selectedBadgeText}>SÉLECTIONNÉ</Text>
                    </View>
                  )}
                </View>
                
                {/* Contenu principal en bas */}
                <View style={styles.bottomContent}>
                  {/* Titre du programme */}
                  <Text style={styles.programName} numberOfLines={1}>
                    {category.icon && category.icon + ' '}{category.name}
                  </Text>
                  
                  {/* Description */}
                  <Text style={styles.programDescription} numberOfLines={2}>
                    {category.description}
                  </Text>
                  
                  {/* Tags/Stats */}
                  <View style={styles.programInfo}>
                    {getPrimaryStats(category).map(stat => (
                      <View key={stat} style={styles.statBadge}>
                        <Text style={styles.statBadgeText}>
                          {getStatIcon(stat)}
                        </Text>
                      </View>
                    ))}
                    
                    <View style={styles.statBadge}>
                      <Text style={styles.statBadgeText}>
                        🎯 {category.programs?.length || 0} compétences
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        );
      })}

      {/* Bouton validation avec style gaming */}
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={selectedPrograms.length === 0 || loading}
        onPress={() => {
          console.log('🔘 Bouton validation cliqué, selectedPrograms:', selectedPrograms);
          handleValidate();
        }}
      >
        <View style={[
          styles.validateButton,
          (selectedPrograms.length === 0 || loading) && styles.validateButtonDisabled
        ]}>
          <Text style={[
            styles.validateButtonText,
            (selectedPrograms.length === 0 || loading) && styles.validateButtonTextDisabled
          ]}>
            {loading 
              ? "⏳ Sauvegarde..." 
              : isExistingUser 
              ? "Confirmer la sélection"
              : selectedPrograms.length === 0
              ? "⚔️ Sélectionne au moins 1 programme"
              : "⚔️ Confirmer la sélection"
            }
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Message d'aide avec style */}
      {!isExistingUser && (
        <Text style={styles.helpText}>
          💡 Tu pourras modifier tes programmes dans ton profil
        </Text>
      )}
      
      {/* Espace en bas */}
      <View style={styles.bottomSpace} />
      </ScrollView>
    </ImageBackground>

    {/* Signup Modal */}
    <SignupModal
      visible={showSignupModal}
      onClose={handleContinueAsGuest}
      onSuccess={handleSignupSuccess}
      guestData={pendingProgramData}
    />
    </>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Plus sombre pour le gaming look
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    paddingTop: 60, // Espace pour le bouton retour
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600'
  },
  header: {
    marginTop: 40, // Baissé pour laisser place au bouton retour
    marginHorizontal: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Semi-transparent dark
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(77, 158, 255, 0.3)', // Bordure bleue néon
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#4D9EFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#B8C5D6',
    textAlign: 'center',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8
  },
  selectionChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  selectionChipActive: {
    borderColor: '#4D9EFF',
    backgroundColor: 'rgba(77, 158, 255, 0.15)',
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  selectionChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  selectionChipTextActive: {
    color: '#4D9EFF',
  },
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  programCard: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(77, 158, 255, 0.3)',
  },
  cardImage: {
    borderRadius: 14,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  programCardSelected: {
    borderColor: '#00E5FF',
    borderWidth: 3,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 15,
    elevation: 10,
  },
  programCardDisabled: {
    opacity: 0.4,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  topContent: {
    // Zone pour le badge en haut
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.25)',
    borderWidth: 2,
    borderColor: '#00E5FF',
  },
  selectedBadgeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  selectedBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00E5FF',
    letterSpacing: 0.5,
  },
  bottomContent: {
    // Contenu regroupé en bas
  },
  programName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 28,
  },
  programDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 12,
    lineHeight: 20,
    fontWeight: '500',
  },
  programInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(123, 97, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.4)',
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B8C5D6',
  },
  validateButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#4D9EFF',
    borderWidth: 3,
    borderColor: '#7B61FF',
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateButtonDisabled: {
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    borderColor: 'rgba(148, 163, 184, 0.5)',
    shadowOpacity: 0.2,
    elevation: 2,
  },
  validateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  validateButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  helpText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  bottomSpace: {
    height: 32
  }
});

export default ProgramSelectionScreen;
