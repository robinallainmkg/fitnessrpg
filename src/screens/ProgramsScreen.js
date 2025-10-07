import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Button, Text, Chip, ActivityIndicator, Divider, Badge } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import programs from '../data/programs.json';
import { activateProgram, deactivateProgram, getActivePrograms } from '../services/activeProgramsService';
import { getTopCumulativeStats } from '../utils/programStats';

const ProgramsScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [activePrograms, setActivePrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);
  
  // Mode onboarding : première sélection (depuis onboarding)
  const isOnboarding = route.params?.isOnboarding || false;

  useEffect(() => {
    loadActivePrograms();
  }, [user.uid]);

  const loadActivePrograms = async () => {
    try {
      setLoading(true);
      const active = await getActivePrograms(user.uid);
      setActivePrograms(active || []);
    } catch (error) {
      console.error('Erreur chargement programmes actifs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateProgram = async (programId) => {
    if (activePrograms.length >= 2) {
      Alert.alert(
        'Limite atteinte',
        'Tu as déjà 2 programmes actifs. Désactive-en un d\'abord pour en activer un autre.'
      );
      return;
    }

    try {
      setActivatingId(programId);
      await activateProgram(user.uid, programId);
      
      // Mise à jour état local
      setActivePrograms([...activePrograms, programId]);
      
      Alert.alert(
        '✅ Programme activé !',
        'Le programme est maintenant actif. Tu peux commencer tes séances !',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur activation:', error);
      Alert.alert('Erreur', 'Impossible d\'activer le programme. Réessaie.');
    } finally {
      setActivatingId(null);
    }
  };

  const handleDeactivateProgram = async (programId) => {
    const program = programs.categories.find(c => c.id === programId);
    
    Alert.alert(
      'Désactiver ce programme ?',
      `Tu perdras l'accès aux séances de "${program?.name}". Ta progression sera conservée.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désactiver',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeactivatingId(programId);
              await deactivateProgram(user.uid, programId);
              
              // Mise à jour état local
              setActivePrograms(activePrograms.filter(id => id !== programId));
              
              Alert.alert('Programme désactivé', '', [{ text: 'OK' }]);
            } catch (error) {
              console.error('Erreur désactivation:', error);
              Alert.alert('Erreur', 'Impossible de désactiver le programme.');
            } finally {
              setDeactivatingId(null);
            }
          }
        }
      ]
    );
  };

  const handleViewTree = (programId) => {
    navigation.navigate('SkillTree', { programId });
  };

  const getStatIcon = (stat) => {
    const icons = {
      strength: '💪',
      power: '⚡',
      endurance: '🔋',
      speed: '🚀',
      mobility: '🤸',
      coordination: '🎯'
    };
    return icons[stat] || '';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de tes programmes...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Programmes</Text>
        <Text style={styles.subtitle}>
          {isOnboarding 
            ? 'Sélectionne 1 ou 2 programmes pour commencer ton aventure'
            : 'Tu peux activer jusqu\'à 2 programmes simultanément'
          }
        </Text>
      </View>

      {/* Section Programmes Actifs */}
      {activePrograms.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              📚 Programmes actifs ({activePrograms.length}/2)
            </Text>
          </View>

          {programs.categories
            .filter(category => activePrograms.includes(category.id))
            .map((category) => {
              const topStats = getTopCumulativeStats(category);
              
              return (
              <Card key={category.id} style={styles.activeProgramCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.programHeaderLeft}>
                      {category.icon && <Text style={styles.programIcon}>{category.icon}</Text>}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.programName}>{category.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          <Chip mode="flat" compact style={styles.activeChip}>
                            ✓ Actif
                          </Chip>
                          {topStats.map((stat) => (
                            <Chip
                              key={stat.stat}
                              mode="outlined"
                              compact
                              style={styles.statTagSmall}
                              textStyle={{ fontSize: 10, color: category.color || colors.primary }}
                            >
                              {stat.icon} {stat.label}
                            </Chip>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.programDescription}>
                    {category.description}
                  </Text>

                  <View style={styles.programActions}>
                    <Button
                      mode="outlined"
                      onPress={() => handleViewTree(category.id)}
                      style={styles.actionButton}
                      icon="file-tree"
                      compact
                    >
                      Voir l'arbre
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => handleDeactivateProgram(category.id)}
                      style={styles.deactivateButton}
                      loading={deactivatingId === category.id}
                      disabled={deactivatingId === category.id}
                      textColor={colors.error}
                      compact
                    >
                      Désactiver
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            )})}


          <Divider style={styles.divider} />
        </>
      )}

      {/* Message si limite atteinte */}
      {activePrograms.length >= 2 && (
        <Card style={styles.warningCard}>
          <Card.Content>
            <Text style={styles.warningText}>
              ⚠️ Limite atteinte - Désactive un programme pour en activer un autre
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Section Tous les Programmes */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activePrograms.length === 0 ? '🎯 Choisis tes programmes' : '🔍 Parcourir les programmes'}
        </Text>
        {activePrograms.length === 0 && (
          <Text style={styles.sectionSubtitle}>
            Active ton premier programme pour commencer !
          </Text>
        )}
      </View>

      {programs.categories.map((category) => {
        const isActive = activePrograms.includes(category.id);
        const canActivate = activePrograms.length < 2 && !isActive;
        const topStats = getTopCumulativeStats(category);

        return (
          <Card
            key={category.id}
            style={[
              styles.programCard,
              isActive && styles.programCardActive
            ]}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                {category.icon && <Text style={styles.programIcon}>{category.icon}</Text>}
                <View style={styles.cardTitleContainer}>
                  <View style={styles.programTitleRow}>
                    <Text style={styles.programName}>{category.name}</Text>
                    {isActive && (
                      <Badge style={styles.activeBadge}>Actif</Badge>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    <Chip
                      mode="outlined"
                      compact
                      style={styles.difficultyChip}
                      textStyle={{ fontSize: 11 }}
                    >
                      {category.difficulty || 'Intermédiaire'}
                    </Chip>
                    {topStats.map((stat) => (
                      <Chip
                        key={stat.stat}
                        mode="outlined"
                        compact
                        style={[styles.statTagSmall, { borderColor: category.color || colors.primary }]}
                        textStyle={{ fontSize: 10, color: category.color || colors.primary }}
                      >
                        {stat.icon} {stat.label}
                      </Chip>
                    ))}
                  </View>
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
                  textStyle={{ color: colors.primary, fontSize: 12 }}
                >
                  📚 {category.programs?.length || 0} compétences
                </Chip>
                <Chip
                  mode="outlined"
                  compact
                  style={styles.infoChip}
                  textStyle={{ color: colors.primary, fontSize: 12 }}
                >
                  {category.type === 'skill-tree' ? '🌳 Arbre' : '📋 Programme'}
                </Chip>
              </View>

              {/* Stats développées */}
              {category.primaryStats && category.primaryStats.length > 0 && (
                <View style={styles.statsContainer}>
                  <Text style={styles.statsLabel}>Développe :</Text>
                  <View style={styles.statsChips}>
                    {category.primaryStats.map(stat => (
                      <Chip
                        key={stat}
                        mode="flat"
                        compact
                        style={styles.statChip}
                        textStyle={{ fontSize: 11 }}
                      >
                        {getStatIcon(stat)} {stat}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              {/* Actions */}
              <View style={styles.programActions}>
                {isActive ? (
                  <Button
                    mode="outlined"
                    onPress={() => handleViewTree(category.id)}
                    style={styles.fullWidthButton}
                    icon="file-tree"
                    disabled
                  >
                    Programme actif
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    onPress={() => handleActivateProgram(category.id)}
                    style={styles.fullWidthButton}
                    loading={activatingId === category.id}
                    disabled={!canActivate || activatingId === category.id}
                    buttonColor={canActivate ? colors.primary : colors.border}
                  >
                    {activatingId === category.id
                      ? 'Activation...'
                      : canActivate
                      ? 'Activer ce programme'
                      : 'Limite atteinte (2 max)'
                    }
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        );
      })}

      {/* Espace en bas */}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    marginVertical: 24,
    marginHorizontal: 20,
    backgroundColor: colors.border,
  },
  activeProgramCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    elevation: 4,
  },
  programCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  programCardActive: {
    borderWidth: 1,
    borderColor: colors.primary,
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  programHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  programIcon: {
    fontSize: 48,
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  programTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  programName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  activeBadge: {
    backgroundColor: colors.primary,
  },
  activeChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '20',
    marginTop: 4,
  },
  difficultyChip: {
    alignSelf: 'flex-start',
    height: 28,
  },
  programDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  programInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  infoChip: {
    height: 30,
    backgroundColor: colors.primary + '15',
  },
  statsContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 12,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  statsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statChip: {
    height: 28,
    backgroundColor: colors.secondary + '15',
  },
  statTagSmall: {
    height: 24,
    backgroundColor: 'transparent',
  },
  programActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  deactivateButton: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
  warningCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.warning + '20',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningText: {
    color: colors.warning,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSpace: {
    height: 32,
  },
});

export default ProgramsScreen;
