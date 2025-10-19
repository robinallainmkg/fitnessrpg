import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { rpgTheme } from '../../theme/rpgTheme';
import { ActionButton } from '../buttons';
import { StatusBadge } from '../badges';
import { getProgramColor } from '../../theme/colors';

/**
 * 📚 ProgramCard - Carte programme simplifié et épuré
 * 
 * Design features:
 * - Pas d'image de fond (plus léger)
 * - Structure simple: icône + titre + progression
 * - Bouton "Voir l'arbre" centré
 * - Badge "Actif" positionné top-right
 * - Bordure 1.5px bleu neon
 * - Plus compact que WorkoutCard (~180px)
 * 
 * Utilisation:
 * <ProgramCard
 *   program={programData}
 *   onViewTree={handleViewTree}
 * />
 */
const ProgramCard = ({
  program = {},
  onViewTree,
  disabled = false,
  style,
}) => {
  const {
    id,
    name = 'Programme',
    icon = '💪',
    status = 'active',
    completedSkills = 0,
    totalSkills = 0,
  } = program;

  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const progress = totalSkills > 0 ? (completedSkills / totalSkills) : 0;

  // Couleur du programme
  const programColor = getProgramColor(id, rpgTheme.colors.neon.blue);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={disabled}
      style={[styles.cardContainer, style]}
    >
      <LinearGradient
        colors={['rgba(26, 34, 68, 0.95)', 'rgba(15, 23, 42, 0.90)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor: isCompleted ? rpgTheme.colors.text.muted : rpgTheme.colors.neon.blue,
            borderWidth: 1.5,
          },
        ]}
      >
        {/* ═══ Status Badge (top-right) ═══ */}
        {(isActive || isCompleted) && (
          <StatusBadge
            status={status}
            size="small"
            position="absolute"
            style={styles.statusBadgePosition}
          />
        )}

        {/* ═══ Program Header ═══ */}
        <View style={styles.header}>
          <Text style={styles.programIcon}>{icon}</Text>
          <Text style={styles.programName} numberOfLines={1}>
            {name}
          </Text>
        </View>

        {/* ═══ Progress Info ═══ */}
        {totalSkills > 0 && (
          <View style={styles.progressSection}>
            <Text style={styles.progressText}>
              {completedSkills} <Text style={styles.progressTotal}>/ {totalSkills}</Text>
            </Text>
            <Text style={styles.progressLabel}>compétences</Text>

            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={[programColor, '#7B61FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBar,
                  { width: `${Math.max(10, progress * 100)}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* ═══ Action Button ═══ */}
        <ActionButton
          onPress={onViewTree}
          icon="tree"
          color="primary"
          size="medium"
          fullWidth
          disabled={disabled}
          style={styles.viewTreeButton}
        >
          Voir l'arbre
        </ActionButton>

        {/* Decorative corner */}
        <View style={[styles.cornerAccent, { borderColor: programColor }]} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ════════════ Container ════════════
  cardContainer: {
    marginHorizontal: rpgTheme.spacing.md,
    marginBottom: rpgTheme.spacing.md,
  },

  // ════════════ Card ════════════
  card: {
    borderRadius: rpgTheme.borderRadius.lg,
    overflow: 'hidden',
    padding: rpgTheme.spacing.md,
    minHeight: 180,
    justifyContent: 'space-between',
    ...rpgTheme.effects.shadows.card,
  },

  // ════════════ Status Badge Position ════════════
  statusBadgePosition: {
    position: 'absolute',
    top: rpgTheme.spacing.sm,
    right: rpgTheme.spacing.sm,
    margin: 0,
  },

  // ════════════ Header ════════════
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rpgTheme.spacing.sm,
    marginBottom: rpgTheme.spacing.md,
    marginTop: 24, // Space for status badge
  },

  programIcon: {
    fontSize: 32,
  },

  programName: {
    fontSize: 18,
    fontWeight: rpgTheme.typography.weights.semibold,
    color: rpgTheme.colors.text.primary,
    flex: 1,
    letterSpacing: 0.2,
  },

  // ════════════ Progress ════════════
  progressSection: {
    marginBottom: rpgTheme.spacing.md,
  },

  progressText: {
    fontSize: 16,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.text.primary,
    marginBottom: 2,
  },

  progressTotal: {
    color: rpgTheme.colors.text.secondary,
    fontSize: 14,
    fontWeight: rpgTheme.typography.weights.medium,
  },

  progressLabel: {
    fontSize: 11,
    color: rpgTheme.colors.text.secondary,
    fontWeight: rpgTheme.typography.weights.medium,
    marginBottom: rpgTheme.spacing.xs,
  },

  // Progress Bar
  progressBarContainer: {
    height: 6,
    backgroundColor: rpgTheme.colors.background.secondary,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: rpgTheme.spacing.xs,
  },

  progressBar: {
    height: '100%',
    borderRadius: 3,
  },

  // ════════════ Button ════════════
  viewTreeButton: {
    marginTop: rpgTheme.spacing.sm,
  },

  // ════════════ Decorative ════════════
  cornerAccent: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 28,
    height: 28,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 14,
    opacity: 0.6,
  },
});

export default ProgramCard;
