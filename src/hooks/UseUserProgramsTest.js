import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { 
  useUserPrograms, 
  useUserProgram, 
  useUserProgramsStats,
  useUserProgramsByCategory,
  useRecommendedPrograms 
} from '../hooks/useUserPrograms';
import ProgramProgressCard from '../components/ProgramProgressCard';
import LoadingProgramCard from '../components/LoadingProgramCard';

/**
 * Composant de test pour les hooks useUserPrograms
 * Teste toutes les fonctionnalités des hooks de programmes utilisateur
 */
const UseUserProgramsTest = () => {
  // Test du hook principal
  const { 
    userPrograms, 
    loading: mainLoading, 
    error: mainError,
    refetch: mainRefetch 
  } = useUserPrograms();

  // Test du hook de stats globales
  const {
    totalPrograms,
    startedPrograms,
    completedPrograms,
    totalXP,
    totalSkillsCompleted,
    totalSkillsAvailable,
    averageProgress,
    favoriteProgram,
    loading: statsLoading
  } = useUserProgramsStats();

  // Test du hook par catégorie
  const {
    programsByCategory,
    categories,
    loading: categoryLoading
  } = useUserProgramsByCategory();

  // Test du hook de recommandations
  const { recommendedPrograms } = useRecommendedPrograms(3);

  // Test du hook pour un programme spécifique
  const {
    program: streetProgram,
    progress: streetProgress,
    progressPercentage: streetPercentage,
    isStarted: streetStarted,
    isCompleted: streetCompleted,
    loading: streetLoading
  } = useUserProgram('street');

  const handleTestRefetch = () => {
    Alert.alert(
      'Test Refetch',
      'Relancer le chargement des programmes ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Recharger', 
          onPress: () => {
            mainRefetch();
            Alert.alert('Succès', 'Données rechargées !');
          }
        }
      ]
    );
  };

  const handleProgramPress = (programId) => {
    Alert.alert(
      'Navigation Test',
      `Naviguer vers le programme: ${programId}`,
      [{ text: 'OK' }]
    );
  };

  if (mainLoading) {
    return (
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>⏳ Chargement des hooks...</Text>
            <ActivityIndicator style={{ marginTop: 16 }} />
          </Card.Content>
        </Card>
        <LoadingProgramCard count={3} />
      </ScrollView>
    );
  }

  if (mainError) {
    return (
      <ScrollView style={styles.container}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorTitle}>❌ Erreur Hook Principal</Text>
            <Text style={styles.errorText}>{mainError}</Text>
            <Button 
              mode="outlined" 
              onPress={mainRefetch}
              style={{ marginTop: 16 }}
            >
              Réessayer
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      
      {/* Header */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>🧪 Test useUserPrograms Hooks</Text>
          <Text style={styles.subtitle}>
            Teste tous les hooks de programmes utilisateur
          </Text>
          <Button 
            mode="outlined" 
            onPress={handleTestRefetch}
            style={{ marginTop: 12 }}
          >
            Test Refetch
          </Button>
        </Card.Content>
      </Card>

      {/* Stats Globales */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📊 Statistiques Globales</Text>
          {statsLoading ? (
            <ActivityIndicator style={{ marginTop: 8 }} />
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalPrograms}</Text>
                <Text style={styles.statLabel}>Programmes Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{startedPrograms}</Text>
                <Text style={styles.statLabel}>Commencés</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completedPrograms}</Text>
                <Text style={styles.statLabel}>Complétés</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalXP.toLocaleString()}</Text>
                <Text style={styles.statLabel}>XP Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalSkillsCompleted}</Text>
                <Text style={styles.statLabel}>Skills Faites</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{averageProgress}%</Text>
                <Text style={styles.statLabel}>Progression</Text>
              </View>
            </View>
          )}
          
          {favoriteProgram && (
            <View style={styles.favoriteSection}>
              <Text style={styles.favoriteTitle}>⭐ Programme Favori</Text>
              <Chip 
                icon={() => <Text>{favoriteProgram.program.icon}</Text>}
                style={[styles.favoriteChip, { backgroundColor: favoriteProgram.program.color + '20' }]}
              >
                {favoriteProgram.program.name} ({favoriteProgram.progress.xp} XP)
              </Chip>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Test Programme Spécifique */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🎯 Programme Spécifique (Street)</Text>
          {streetLoading ? (
            <ActivityIndicator style={{ marginTop: 8 }} />
          ) : streetProgram ? (
            <View>
              <Text style={styles.debugText}>
                Nom: {streetProgram.name}
              </Text>
              <Text style={styles.debugText}>
                XP: {streetProgress?.xp || 0}
              </Text>
              <Text style={styles.debugText}>
                Progression: {streetPercentage}%
              </Text>
              <Text style={styles.debugText}>
                Commencé: {streetStarted ? '✅' : '❌'}
              </Text>
              <Text style={styles.debugText}>
                Complété: {streetCompleted ? '✅' : '❌'}
              </Text>
            </View>
          ) : (
            <Text style={styles.debugText}>❌ Programme 'street' non trouvé</Text>
          )}
        </Card.Content>
      </Card>

      {/* Programmes par Catégorie */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📁 Programmes par Catégorie</Text>
          {categoryLoading ? (
            <ActivityIndicator style={{ marginTop: 8 }} />
          ) : (
            <View>
              <Text style={styles.debugText}>
                Catégories trouvées: {categories.length}
              </Text>
              {categories.map(category => (
                <View key={category} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  <Text style={styles.debugText}>
                    {programsByCategory[category]?.length || 0} programmes
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Programmes Recommandés */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🚀 Programmes Recommandés</Text>
          <Text style={styles.debugText}>
            {recommendedPrograms.length} programmes recommandés
          </Text>
          {recommendedPrograms.length === 0 && (
            <Text style={styles.infoText}>
              ℹ️ Aucun programme recommandé (tous sont déjà commencés)
            </Text>
          )}
        </Card.Content>
      </Card>

      <Divider style={{ marginVertical: 16 }} />

      {/* Liste des Programmes avec Cartes */}
      <Text style={styles.listTitle}>📋 Liste des Programmes ({userPrograms.length})</Text>
      
      {userPrograms.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.infoText}>
              ℹ️ Aucun programme trouvé pour cet utilisateur
            </Text>
          </Card.Content>
        </Card>
      ) : (
        userPrograms.map(({ program, progress, progressPercentage, isStarted, isCompleted }) => (
          <View key={program.id} style={styles.programContainer}>
            <ProgramProgressCard
              program={program}
              progress={progress}
              onPress={() => handleProgramPress(program.id)}
            />
            
            {/* Debug Info */}
            <Card style={styles.debugCard}>
              <Card.Content>
                <Text style={styles.debugTitle}>🔍 Debug Info</Text>
                <Text style={styles.debugText}>ID: {program.id}</Text>
                <Text style={styles.debugText}>Catégorie: {program.category}</Text>
                <Text style={styles.debugText}>Progression: {progressPercentage}%</Text>
                <Text style={styles.debugText}>Status: {
                  isCompleted ? '🏆 Complété' : 
                  isStarted ? '⚡ En cours' : 
                  '⭕ Non commencé'
                }</Text>
                <Text style={styles.debugText}>
                  Skills: {progress.completedSkills}/{progress.totalSkills}
                </Text>
                <Text style={styles.debugText}>XP: {progress.xp}</Text>
                <Text style={styles.debugText}>Niveau: {progress.level}</Text>
              </Card.Content>
            </Card>
          </View>
        ))
      )}

      {/* Programmes Recommandés en Cards */}
      {recommendedPrograms.length > 0 && (
        <View>
          <Text style={styles.listTitle}>🎯 Programmes Recommandés</Text>
          {recommendedPrograms.map(({ program, progress }) => (
            <ProgramProgressCard
              key={program.id}
              program={program}
              progress={progress}
              onPress={() => handleProgramPress(program.id)}
            />
          ))}
        </View>
      )}

      {/* Espace en bas */}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Favori
  favoriteSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  favoriteTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  favoriteChip: {
    borderRadius: 20,
  },
  
  // Catégories
  categorySection: {
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  // Debug
  debugCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  
  // Program container
  programContainer: {
    marginBottom: 8,
  },
  
  // Info/Error
  infoText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFEBEE',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C62828',
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
    marginTop: 8,
  },
});

export default UseUserProgramsTest;
