import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, ImageBackground, TouchableOpacity } from 'react-native';
import { Card, Button, Text, Chip, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ IMPORT UNIFIÉ - Firebase simple config
import { getFirestore, FieldValue } from '../config/firebase.simple';
const firestore = getFirestore();

import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { loadProgramsMeta } from '../data/programsLoader';
import { loadProgramTree } from '../utils/programLoader';
import { colors } from '../theme/colors';
import { ProgramCard } from '../components/cards';
import { ProgramStatBadge } from '../components/badges';
import { rpgTheme } from '../theme/rpgTheme';

// ═══ Pattern images: {categoryId}-bg.jpg ou selon programs-meta.json
const getProgramImageSource = (categoryId) => {
  const imageMap = {
    street: require('../../assets/programmes/street-bg.jpg'),
    running: require('../../assets/programmes/running-5.jpg'),
    // Ajouter les nouvelles images ici: yoga: require('../../assets/programmes/yoga-bg.jpg'),
  };
  return imageMap[categoryId] || null;
};

const ProgramSelectionScreen = ({ navigation }) => {
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [existingPrograms, setExistingPrograms] = useState({});
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [pendingProgramData, setPendingProgramData] = useState(null);
  const [signupSuccessful, setSignupSuccessful] = useState(false);
  const [categories, setCategories] = useState([]);
  const [programTrees, setProgramTrees] = useState({});
  const { user, isGuest } = useAuth();
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
        shadowOpacity: 0.2,
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

  // Charger les métadonnées des catégories et les trees
  useEffect(() => {
    const loadCategoriesData = async () => {
      try {
        console.log('📦 [ProgramSelection] Chargement catégories et trees...');
        const meta = await loadProgramsMeta();
        setCategories(meta.categories);
        
        // Charger les trees pour chaque catégorie
        const trees = {};
        for (const category of meta.categories) {
          const tree = await loadProgramTree(category.id);
          if (tree) {
            trees[category.id] = tree.tree; // Extraire le tableau tree
          }
        }
        setProgramTrees(trees);
        console.log('✅ [ProgramSelection] Catégories et trees chargés:', Object.keys(trees));
      } catch (error) {
        console.error('❌ [ProgramSelection] Erreur chargement:', error);
      }
    };
    
    loadCategoriesData();
  }, []);

  // Charger les programmes existants de l'utilisateur
  useEffect(() => {
    const loadExistingPrograms = async () => {
      try {
        // ═══ NOUVELLE ARCHITECTURE: Tous les utilisateurs (invités ou authentifiés) utilisent Firestore ═══
        if (!user || !user.uid) {
          console.log('⏭️ No user - skip loading existing programs');
          setInitialLoading(false);
          return;
        }

        console.log('📥 Loading existing programs from Firestore for user:', user.uid, isGuest ? '(guest)' : '(authenticated)');
        
        // Charger depuis Firestore (pour invités ET authentifiés)
        const userDoc = await firestore.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          
          // Vérification défensive : si userData est undefined
          if (!userData) {
            console.log('⚠️ User document exists but data is empty');
            setInitialLoading(false);
            return;
          }
          
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
    console.log('🌳 Program trees disponibles:', Object.keys(programTrees));
    
    // ✅ Vérifier que les trees sont chargés
    const missingTrees = selectedPrograms.filter(pid => !programTrees[pid]);
    if (missingTrees.length > 0) {
      console.error('❌ Trees manquants pour:', missingTrees);
      Alert.alert(
        "Erreur",
        "Données des programmes en cours de chargement. Réessaie dans quelques secondes."
      );
      return;
    }
    
    // ═══ NOUVELLE ARCHITECTURE: Tous les utilisateurs (invités ou authentifiés) ont un user.uid ═══
    // Les invités sont des utilisateurs Firebase Anonymous, donc on traite tout le monde pareil
    
    if (!user || !user.uid) {
      Alert.alert(
        "Erreur",
        "Impossible de sauvegarder. Redémarre l'application."
      );
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔍 DIAGNOSTIC PRÉ-SAUVEGARDE:');
      console.log('  - User UID:', user.uid);
      console.log('  - Is Guest:', isGuest);
      console.log('  - Selected programs:', selectedPrograms);
      console.log('  - Existing programs:', Object.keys(existingPrograms));
      
      const userRef = firestore.collection('users').doc(user.uid);
      
      // 🔥 TENTATIVE: Vérifier si le document existe AVANT de sauvegarder
      console.log('📖 Lecture document utilisateur...');
      const startRead = Date.now();
      
      const readPromise = userRef.get();
      const readTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT: Lecture Firestore après 8s')), 8000)
      );
      
      const docSnap = await Promise.race([readPromise, readTimeoutPromise]);
      const readTime = Date.now() - startRead;
      console.log(`✅ Document lu en ${readTime}ms - Existe: ${docSnap.exists}`);
      
      // Créer l'objet programs pour Firestore
      const programsData = {};
      selectedPrograms.forEach(programId => {
        const tree = programTrees[programId];
        if (tree) {
          programsData[programId] = existingPrograms[programId] || {
            xp: 0,
            level: 1,
            completedSkills: [],
            skillProgress: {},
            totalSkills: tree.length
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
        programsDataKeys: Object.keys(programsData)
      });
      
      console.log('📊 Taille des données:', JSON.stringify(updateData).length, 'caractères');
      
      // Marquer l'onboarding comme terminé seulement si c'est un nouvel utilisateur
      if (Object.keys(existingPrograms).length === 0) {
        updateData.onboardingCompleted = true;
        updateData.totalXP = 0;
        updateData.globalLevel = 1;
        updateData.globalXP = 0;
        updateData.level = 1;
        updateData.streak = 0;
        updateData.displayName = user.email?.split('@')[0] || user.displayName || 'Utilisateur';
        updateData.avatarId = 0;
        updateData.createdAt = FieldValue.serverTimestamp();
        
        // Ajouter email seulement si l'utilisateur n'est pas anonyme
        if (user.email) {
          updateData.email = user.email;
        }
        
        console.log('💾 Tentative création nouveau document utilisateur...');
        console.log('💾 User UID:', user.uid);
        console.log('💾 Update data keys:', Object.keys(updateData));
        
        // ✅ ANCIENNE API: set avec merge + timeout
        console.log('⏱️ Démarrage set() avec timeout 10s...');
        const startWrite = Date.now();
        
        const setPromise = userRef.set(updateData, { merge: true });
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT: Firebase set() ne répond pas après 10s')), 10000)
        );
        
        await Promise.race([setPromise, timeoutPromise]);
        const writeTime = Date.now() - startWrite;
        console.log(`✅ Nouveau document utilisateur créé en ${writeTime}ms`);
      } else {
        // Pour un utilisateur existant, mettre à jour le document
        console.log('📝 Tentative update pour utilisateur existant...');
        console.log('📝 User UID:', user.uid);
        console.log('📝 Update data keys:', Object.keys(updateData));
        
        // ✅ CHANGEMENT: Utiliser set() avec merge au lieu de update()
        // Parfois update() bloque même avec des règles permissives
        console.log('⏱️ Démarrage set() avec timeout 10s...');
        const startWrite = Date.now();
        
        const setPromise = userRef.set(updateData, { merge: true });
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT: Firebase set() ne répond pas après 10s')), 10000)
        );
        
        await Promise.race([setPromise, timeoutPromise]);
        const writeTime = Date.now() - startWrite;
        console.log(`✅ Document utilisateur mis à jour en ${writeTime}ms`);
      }

      // Navigation après sauvegarde
      if (Object.keys(existingPrograms).length === 0) {
        // Nouvel utilisateur - juste revenir à Home (qui va charger les programmes)
        console.log('🚀 Nouveau utilisateur - Navigation vers Home');
        
        // Réinitialiser le flag tooltip pour permettre l'affichage
        await AsyncStorage.removeItem('@fitnessrpg:tree_tooltip_shown');
        
        // Rediriger vers Home normalement (sans flag openProgramSelection)
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }, 100);
      } else {
        // Utilisateur existant - naviguer vers Home avec refresh
        console.log('🚀 Navigation vers Home pour utilisateur existant avec refresh');
        navigation.navigate('Main', {
          screen: 'Home',
          params: {
            refresh: Date.now()
          }
        });
      }
      
    } catch (error) {
      console.error("❌ Erreur sélection programmes:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error code:", error.code);
      Alert.alert(
        "Erreur de sauvegarde",
        `Impossible de sauvegarder tes programmes.\n\nDétails: ${error.message || error.code || 'Erreur inconnue'}\n\nRéessaie ou redémarre l'app.`
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
    const tree = programTrees[category.id];
    if (!tree) return [];
    
    const statTotals = {};
    
    // Parcourir toutes les compétences du tree
    tree.forEach(program => {
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
    console.log('✅ Signup/Login réussi - Attente user Firebase');
    
    // Marquer que le signup a réussi pour éviter l'alerte "mode invité"
    setSignupSuccessful(true);
    
    // Fermer le modal
    setShowSignupModal(false);
    
    // Marquer l'onboarding comme terminé
    await AsyncStorage.setItem('@fitnessrpg:onboarding_completed', 'true');
    
    // Nettoyer les données temporaires
    await AsyncStorage.removeItem('@fitnessrpg:guest_programs');
    
    // ⚠️ Ne PAS faire navigation.reset() ici!
    // App.js va automatiquement montrer Main quand Firebase détecte le user
    console.log('✅ Laissons App.js gérer la navigation automatiquement');
  };

  const handleContinueAsGuest = () => {
    console.log('👤 onClose appelé - Fermeture du modal sans popup');
    setShowSignupModal(false);
    // ⭐ SUPPRESSION COMPLÈTE DE LA POPUP - On laisse juste le modal se fermer
  };

  return (
    <View style={{ flex: 1 }}>
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

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
      {categories.map((category) => {
        const isSelected = selectedPrograms.includes(category.id);
        const isDisabled = !isSelected && selectedPrograms.length >= maxPrograms;
        const tree = programTrees[category.id] || [];

        const programData = {
          id: category.id,
          name: category.name,
          icon: category.icon,
          backgroundImage: getProgramImageSource(category.id),
          description: category.description,
          status: isSelected ? 'active' : 'locked',
          completedSkills: 0,
          totalSkills: tree.length || 0,
        };

        return (
          <View
            key={category.id}
            style={[
              styles.programCardWrapper,
              isSelected && styles.programCardWrapperSelected,
              isDisabled && styles.programCardWrapperDisabled
            ]}
          >
            <ProgramCard
              program={programData}
              onViewTree={() => navigation.navigate('SkillTree', { programId: category.id })}
              onSelect={() => !isDisabled && handleSelectProgram(category.id)}
              isSelected={isSelected}
              disabled={isDisabled}
              showDescription={true}
              showStats={true}
              primaryStats={getPrimaryStats(category)}
            />
          </View>
        );
      })}

      </ScrollView>

      {/* ⭐ BOUTON FIXE EN BAS */}
      <View style={styles.fixedBottomContainer}>
        {/* Message d'aide avec style */}
        {!isExistingUser && (
          <Text style={styles.helpText}>
            💡 Tu pourras modifier tes programmes dans ton profil
          </Text>
        )}
        
        {/* Bouton validation avec style gaming */}
        <TouchableOpacity
          activeOpacity={0.7}
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
      </View>
    </ImageBackground>

      {/* Auth Modal */}
      <AuthModal
        visible={showSignupModal}
        onClose={handleContinueAsGuest}
        onSuccess={handleSignupSuccess}
        guestData={pendingProgramData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(77, 158, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.4)',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    paddingTop: 40,
  },
  scrollContent: {
    paddingBottom: 200,
    paddingHorizontal: 0,
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
  
  // ✅ HEADER ÉPURÉ (sans fond)
  header: {
    marginTop: 100, // ✅ RÉDUIT de 40 à 20
    marginHorizontal: 16,
    marginBottom: 8, // ✅ RÉDUIT de 16 à 8
    paddingHorizontal: 0, // ✅ RÉDUIT de 16 à 0
    paddingVertical: 0, // ✅ RÉDUIT de 16 à 0
    // ❌ SUPPRIMÉ backgroundColor
    // ❌ SUPPRIMÉ borderRadius
    // ❌ SUPPRIMÉ shadowColor/shadowOpacity/elevation
    // Juste le texte flottant sur le background!
  },
  
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4, // ✅ RÉDUIT de 8 à 4
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#4D9EFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14, // ✅ RÉDUIT de 16 à 14
    marginBottom: 2, // ✅ RÉDUIT de 4 à 2
    color: '#B8C5D6',
    textAlign: 'center',
    fontWeight: '500',
  },
  description: {
    fontSize: 12, // ✅ RÉDUIT de 14 à 12
    color: '#94A3B8',
    marginBottom: 8, // ✅ RÉDUIT de 12 à 8
    textAlign: 'center',
    lineHeight: 18, // ✅ RÉDUIT de 20 à 18
    paddingHorizontal: 8
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4, // ✅ RÉDUIT de 8 à 4
  },
  selectionChip: {
    paddingHorizontal: 16, // ✅ RÉDUIT de 20 à 16
    paddingVertical: 6, // ✅ RÉDUIT de 8 à 6
    borderRadius: 20,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
  },
  selectionChipActive: {
    borderColor: '#4D9EFF',
    backgroundColor: 'rgba(77, 158, 255, 0.1)',
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  selectionChipText: {
    fontSize: 12, // ✅ RÉDUIT de 13 à 12
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  selectionChipTextActive: {
    color: '#4D9EFF',
  },

  // ✅ PROGRAMME CARD WRAPPER - SPACING COHÉRENT
  programCardWrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
    opacity: 1,
  },
  
  programCardWrapperSelected: {
    borderWidth: 3,
    borderColor: '#00FF94',
    borderRadius: 16,
  },
  
  programCardWrapperDisabled: {
    opacity: 0.5,
  },

  // ✅ FIXED BOTTOM CONTAINER
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingBottom: 20,
    paddingTop: 12,
    borderTopColor: 'rgba(77, 158, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  // ✅ VALIDATE BUTTON
  validateButton: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#4D9EFF',
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateButtonDisabled: {
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    borderColor: 'rgba(148, 163, 184, 0.5)',
    shadowOpacity: 0.15,
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
    marginBottom: 8,
    fontStyle: 'italic',
  },
});

export default ProgramSelectionScreen;
