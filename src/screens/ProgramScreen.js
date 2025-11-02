// ⚠️ CE FICHIER EST L'ÉQUIVALENT DE ProgramSelectionScreen DANS LE TAB NAVIGATION
// Il permet de sélectionner/modifier les programmes actifs

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, ImageBackground, TouchableOpacity } from 'react-native';
import { Card, Button, Text, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { getFirestore, FieldValue } from '../config/firebase.simple';
const firestore = getFirestore();

import { useAuth } from '../contexts/AuthContext';
import { loadProgramsMeta } from '../data/programsLoader';
import { loadProgramTree } from '../utils/programLoader';
import { colors } from '../theme/colors';
import { ProgramCard } from '../components/cards';
import { rpgTheme } from '../theme/rpgTheme';
import UserHeader from '../components/UserHeader';

const getProgramImageSource = (categoryId) => {
  const imageMap = {
    street: require('../../assets/programmes/street-bg.jpg'),
    running: require('../../assets/programmes/running-5.jpg'),
  };
  return imageMap[categoryId] || null;
};

const BACKGROUND_IMAGE = require('../../assets/programmes/street-bg.jpg');

const ProgramScreen = ({ navigation }) => {
  const [userStats, setUserStats] = useState(null);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [existingPrograms, setExistingPrograms] = useState({});
  const [categories, setCategories] = useState([]);
  const [programTrees, setProgramTrees] = useState({});
  const { user, isGuest } = useAuth();
  const maxPrograms = 2;

  // Charger les métadonnées des catégories et les trees
  useEffect(() => {
    const loadCategoriesData = async () => {
      try {
        console.log('📦 [ProgramScreen] Chargement catégories et trees...');
        const meta = await loadProgramsMeta();
        setCategories(meta.categories);
        
        const trees = {};
        for (const category of meta.categories) {
          const tree = await loadProgramTree(category.id);
          if (tree) {
            trees[category.id] = tree.tree;
          }
        }
        setProgramTrees(trees);
        console.log('✅ [ProgramScreen] Catégories et trees chargés');
      } catch (error) {
        console.error('❌ [ProgramScreen] Erreur chargement:', error);
      }
    };
    
    loadCategoriesData();
  }, []);

  // Charger les programmes existants de l'utilisateur
  useEffect(() => {
    const loadExistingPrograms = async () => {
      try {
        if (!user || !user.uid) {
          console.log('⏭️ No user - skip loading existing programs');
          setInitialLoading(false);
          return;
        }

        console.log('📥 Loading existing programs from Firestore for user:', user.uid);
        
        const userDoc = await firestore.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          
          if (!userData) {
            console.log('⚠️ User document exists but data is empty');
            setInitialLoading(false);
            return;
          }
          
          // Set user stats for header
          setUserStats(userData);
          
          const userPrograms = userData.programs || {};
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
  }, [user?.uid, isGuest]);

  // Recharger les stats quand l'écran devient actif
  useFocusEffect(
    React.useCallback(() => {
      if (user?.uid && !isGuest) {
        loadUserStats();
      }
    }, [user?.uid, isGuest])
  );

  const loadUserStats = async () => {
    try {
      const userDoc = await firestore.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        setUserStats(userDoc.data());
      }
    } catch (error) {
      console.error('❌ loadUserStats error:', error);
    }
  };

  const handleToggleProgram = async (programId) => {
    const isCurrentlySelected = selectedPrograms.includes(programId);
    
    // Vérifier les limites
    if (!isCurrentlySelected && selectedPrograms.length >= maxPrograms) {
      Alert.alert(
        "Limite atteinte",
        `Tu peux activer maximum ${maxPrograms} programmes simultanés.\n\nDésactive un programme pour en activer un autre.`
      );
      return;
    }

    // Vérifier que le tree est chargé
    if (!programTrees[programId]) {
      Alert.alert(
        "Erreur",
        "Données du programme en cours de chargement. Réessaie dans quelques secondes."
      );
      return;
    }

    if (!user || !user.uid) {
      Alert.alert("Erreur", "Impossible de sauvegarder.");
      return;
    }

    setLoading(true);
    
    try {
      let newSelectedPrograms;
      if (isCurrentlySelected) {
        // Retirer le programme
        newSelectedPrograms = selectedPrograms.filter(id => id !== programId);
      } else {
        // Ajouter le programme
        newSelectedPrograms = [...selectedPrograms, programId];
      }

      const userRef = firestore.collection('users').doc(user.uid);
      
      // Créer l'objet programs pour Firestore
      const programsData = {};
      newSelectedPrograms.forEach(progId => {
        const tree = programTrees[progId];
        if (tree) {
          programsData[progId] = existingPrograms[progId] || {
            xp: 0,
            level: 1,
            completedSkills: [],
            skillProgress: {},
            totalSkills: tree.length
          };
        }
      });

      const activeProgramsList = newSelectedPrograms.slice(0, 2);
      const updateData = {
        programs: programsData,
        selectedPrograms: newSelectedPrograms,
        activePrograms: activeProgramsList,
      };
      
      console.log('💾 Saving to Firestore:', {
        selectedPrograms: newSelectedPrograms,
        activePrograms: activeProgramsList
      });
      
      await userRef.set(updateData, { merge: true });
      console.log('✅ Programme', isCurrentlySelected ? 'désactivé' : 'activé');

      // Mettre à jour l'état local
      setSelectedPrograms(newSelectedPrograms);
      
    } catch (error) {
      console.error("❌ Erreur toggle programme:", error);
      Alert.alert(
        "Erreur de sauvegarde",
        `Impossible de modifier le programme.\n\nDétails: ${error.message || 'Erreur inconnue'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryStats = (category) => {
    const tree = programTrees[category.id];
    if (!tree) return [];
    
    const statTotals = {};
    tree.forEach(program => {
      const bonuses = program.statBonuses || {};
      Object.entries(bonuses).forEach(([stat, value]) => {
        statTotals[stat] = (statTotals[stat] || 0) + value;
      });
    });
    
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

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay} />
      
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* USER HEADER */}
          <UserHeader
            username={userStats?.displayName || 'Utilisateur'}
            globalLevel={userStats?.globalLevel || 0}
            globalXP={userStats?.globalXP || 0}
            title={userStats?.title || 'Débutant'}
            streak={userStats?.streakDays || 0}
            avatarId={userStats?.avatarId || 0}
            userId={user?.uid}
            onPress={() => navigation.navigate('Profile')}
            enableUsernameEdit={false}
          />

          {/* PROGRAMMES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚔️ Tes Programmes</Text>
            <Text style={styles.sectionSubtitle}>
              Active jusqu'à {maxPrograms} programmes simultanés
            </Text>

            {/* Liste des programmes */}
            {categories.map((category) => {
              const isSelected = selectedPrograms.includes(category.id);
              const isDisabled = loading; // Désactivé uniquement pendant le chargement
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
                  ]}
                >
                  <ProgramCard
                    program={programData}
                    onViewTree={() => navigation.navigate('SkillTree', { programId: category.id })}
                    onSelect={() => handleToggleProgram(category.id)}
                    isSelected={isSelected}
                    disabled={isDisabled}
                    showDescription={true}
                    showStats={true}
                    primaryStats={getPrimaryStats(category)}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flex: 1 },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
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
  programCardWrapper: {
    marginBottom: 12,
  },
  
  programCardWrapperSelected: {
    borderWidth: 2,
    borderColor: '#00FF94',
    borderRadius: 16,
    shadowColor: '#00FF94',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default ProgramScreen;
