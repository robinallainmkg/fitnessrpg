import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import programs from '../data/programs.json';
import {
  getAllUserPrograms,
  activateProgram,
  deactivateProgram,
  swapActiveProgram,
  MAX_PROGRAMS,
} from '../services/activeProgramsService';

/**
 * Écran de gestion des programmes actifs
 * Permet d'activer/désactiver les programmes (max 2 actifs)
 */
const ManageActiveProgramsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activePrograms, setActivePrograms] = useState([]);
  const [inactivePrograms, setInactivePrograms] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const { active, inactive } = await getAllUserPrograms(user.uid);

      // Enrichir avec les détails des programmes
      const enrichProgram = (programId) => {
        const program = programs.categories
          .flatMap(cat => cat.programs)
          .find(p => p.id === programId);
        
        return program ? { ...program, programId } : null;
      };

      setActivePrograms(active.map(enrichProgram).filter(Boolean));
      setInactivePrograms(inactive.map(enrichProgram).filter(Boolean));
    } catch (error) {
      console.error('Erreur chargement programmes:', error);
      Alert.alert('Erreur', 'Impossible de charger les programmes');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (programId) => {
    setProcessingId(programId);

    try {
      const result = await activateProgram(user.uid, programId);

      if (result.success) {
        Alert.alert(
          'Programme activé ! ✅',
          'Tes séances sont maintenant disponibles dans la queue',
          [{ text: 'OK', onPress: () => loadPrograms() }]
        );
      } else if (result.needsDeactivation) {
        // Limite atteinte, proposer de remplacer
        handleMaxReached(programId);
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      console.error('Erreur activation:', error);
      Alert.alert('Erreur', 'Impossible d\'activer le programme');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeactivate = async (programId) => {
    Alert.alert(
      'Désactiver ce programme ?',
      'Ses séances seront retirées de ta queue',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désactiver',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(programId);
            try {
              const result = await deactivateProgram(user.uid, programId);

              if (result.success) {
                Alert.alert('Programme désactivé', '', [
                  { text: 'OK', onPress: () => loadPrograms() }
                ]);
              } else {
                Alert.alert('Erreur', result.error);
              }
            } catch (error) {
              console.error('Erreur désactivation:', error);
              Alert.alert('Erreur', 'Impossible de désactiver le programme');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleMaxReached = (newProgramId) => {
    const newProgram = programs.categories
      .flatMap(cat => cat.programs)
      .find(p => p.id === newProgramId);

    Alert.alert(
      `Maximum ${MAX_PROGRAMS} programmes actifs`,
      `Tu dois désactiver un programme pour activer "${newProgram?.name}"`,
      [
        { text: 'Annuler', style: 'cancel' },
        ...activePrograms.map(prog => ({
          text: `Remplacer "${prog.name}"`,
          onPress: () => handleSwap(newProgramId, prog.programId),
        })),
      ]
    );
  };

  const handleSwap = async (newProgramId, oldProgramId) => {
    setProcessingId(newProgramId);

    try {
      const result = await swapActiveProgram(user.uid, newProgramId, oldProgramId);

      if (result.success) {
        Alert.alert(
          'Programme remplacé ! ✅',
          `Tes séances ont été mises à jour`,
          [{ text: 'OK', onPress: () => loadPrograms() }]
        );
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      console.error('Erreur swap:', error);
      Alert.alert('Erreur', 'Impossible de remplacer le programme');
    } finally {
      setProcessingId(null);
    }
  };

  const ProgramCard = ({ program, isActive }) => {
    const isProcessing = processingId === program.programId;

    return (
      <Card style={styles.programCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.programInfo}>
              <Text style={styles.programIcon}>{program.icon}</Text>
              <View style={styles.programText}>
                <Text style={styles.programName} numberOfLines={1}>
                  {program.name}
                </Text>
                <Text style={styles.programCategory}>
                  {program.category || 'Programme'}
                </Text>
              </View>
            </View>
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                { backgroundColor: isActive ? colors.primary + '20' : colors.border + '20' }
              ]}
              textStyle={{
                color: isActive ? colors.primary : colors.textSecondary,
                fontSize: 12,
              }}
            >
              {isActive ? 'Actif ⚡' : 'Inactif'}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.actions}>
            {isActive ? (
              <Button
                mode="outlined"
                onPress={() => handleDeactivate(program.programId)}
                disabled={isProcessing}
                style={styles.actionButton}
                textColor={colors.error}
              >
                {isProcessing ? 'Traitement...' : 'Désactiver'}
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={() => handleActivate(program.programId)}
                disabled={isProcessing}
                style={styles.actionButton}
                buttonColor={colors.primary}
              >
                {isProcessing ? 'Traitement...' : 'Activer'}
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gérer mes programmes</Text>
          <Text style={styles.subtitle}>
            Maximum {MAX_PROGRAMS} programmes actifs simultanément
          </Text>
          <Chip
            mode="flat"
            style={styles.countChip}
            textStyle={{ color: colors.primary }}
          >
            {activePrograms.length} / {MAX_PROGRAMS} actifs
          </Chip>
        </View>

        {/* Programmes actifs */}
        {activePrograms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Programmes Actifs ⚡</Text>
            {activePrograms.map(program => (
              <ProgramCard
                key={program.programId}
                program={program}
                isActive={true}
              />
            ))}
          </View>
        )}

        {/* Programmes inactifs */}
        {inactivePrograms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Programmes Disponibles</Text>
            {inactivePrograms.map(program => (
              <ProgramCard
                key={program.programId}
                program={program}
                isActive={false}
              />
            ))}
          </View>
        )}

        {/* Message si aucun programme */}
        {activePrograms.length === 0 && inactivePrograms.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                Tu n'as pas encore sélectionné de programmes
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('ProgramSelection')}
                style={{ marginTop: 16 }}
              >
                Choisir des programmes
              </Button>
            </Card.Content>
          </Card>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bouton de retour */}
      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Retour à l'accueil
        </Button>
      </View>
    </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  countChip: {
    backgroundColor: colors.primary + '20',
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  programCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  programInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  programIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  programText: {
    flex: 1,
  },
  programName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  programCategory: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusChip: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 32,
    backgroundColor: colors.surface,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    borderColor: colors.primary,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default ManageActiveProgramsScreen;
