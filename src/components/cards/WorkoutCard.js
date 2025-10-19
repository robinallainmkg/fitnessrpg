import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { rpgTheme } from '../../theme/rpgTheme';
import { ActionButton, OutlineButton } from '../buttons';
import { StatBadge } from '../badges';

/**
 * 🎮 WorkoutCard - Carte unifiée pour les quêtes d'entraînement
 * 
 * Design features:
 * - Bordure 2px colorée selon le programme
 * - Badge programme avec icône + niveau
 * - Titre mission + sous-titre de niveau
 * - Badge XP violet avec glow
 * - Boutons Aperçu/Commencer uniformisés
 * - Responsive sur tous les écrans
 * 
 * Utilisation:
 * <WorkoutCard
 *   session={sessionData}
 *   programColor="#4D9EFF"
 *   onPreview={handlePreview}
 *   onStart={handleStart}
 * />
 */
const WorkoutCard = ({
  session = {},
  programColor = rpgTheme.colors.neon.blue,
  onPreview,
  onStart,
  disabled = false,
  style,
}) => {
  const {
    skillName = 'Mission',
    skillId,
    levelNumber = 1,
    levelName = '',
    status = 'available',
    xpReward = 0,
    programName = 'Programme',
    programIcon = '💪',
    // Fallback for legacy structure
    name,
    level,
  } = session;

  const isCompleted = status === 'completed';
  const displayName = skillName || name || 'Mission';
  const displayLevel = levelNumber || level || 1;

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      disabled={disabled || isCompleted}
      style={[styles.cardContainer, style]}
    >
      {/* 🌟 Glow effect backdrop */}
      <View style={[styles.glowBackdrop, { backgroundColor: `${programColor}15` }]} />

      {/* 💎 Card principal */}
      <LinearGradient
        colors={['rgba(26, 34, 68, 0.95)', 'rgba(15, 23, 42, 0.90)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor: isCompleted ? rpgTheme.colors.text.muted : programColor,
            borderWidth: 2,
          },
        ]}
      >
        {/* ═══ Header: Programme + XP ═══ */}
        <View style={styles.header}>
          {/* Programme Badge (gauche) */}
          <View
            style={[
              styles.programBadge,
              { backgroundColor: `${programColor}10` },
            ]}
          >
            <Text style={styles.programIcon}>{programIcon}</Text>
            <View style={styles.programInfo}>
              <Text
                style={[styles.programLabel, { color: programColor }]}
                numberOfLines={1}
              >
                {programName}
              </Text>
              <Text style={styles.levelIndicator}>Niveau {displayLevel}</Text>
            </View>
          </View>

          {/* XP Badge (droite) ou Status */}
          {!isCompleted && xpReward > 0 && (
            <StatBadge
              icon="lightning-bolt"
              value={`+${xpReward}`}
              color="primary"
              size="small"
              variant="filled"
            />
          )}

          {isCompleted && (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={24} color={rpgTheme.colors.status.active} />
            </View>
          )}
        </View>

        {/* ═══ Title Section ═══ */}
        <View style={styles.titleSection}>
          <Text style={styles.missionTitle} numberOfLines={2}>
            {displayName}
          </Text>
          {levelName && (
            <Text style={styles.levelName}>{levelName}</Text>
          )}
        </View>

        {/* ═══ Actions (Buttons) ═══ */}
        {!isCompleted && (
          <View style={styles.actionRow}>
            <OutlineButton
              onPress={onPreview}
              icon="eye-outline"
              borderColor={programColor}
              size="medium"
              fullWidth
              disabled={disabled}
            >
              Aperçu
            </OutlineButton>

            <ActionButton
              onPress={onStart}
              icon="play"
              color="primary"
              size="medium"
              fullWidth
              disabled={disabled}
            >
              Commencer
            </ActionButton>
          </View>
        )}

        {/* ═══ Completed State ═══ */}
        {isCompleted && (
          <View style={styles.completedSection}>
            <Icon name="check-circle-outline" size={20} color={rpgTheme.colors.status.active} />
            <Text style={styles.completedText}>Quête accomplie</Text>
          </View>
        )}

        {/* Decorative corner accent */}
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
    position: 'relative',
  },

  glowBackdrop: {
    position: 'absolute',
    top: 0,
    left: rpgTheme.spacing.md,
    right: rpgTheme.spacing.md,
    height: '100%',
    borderRadius: rpgTheme.borderRadius.lg,
    opacity: 0.5,
  },

  // ════════════ Card ════════════
  card: {
    borderRadius: rpgTheme.borderRadius.lg,
    overflow: 'hidden',
    padding: rpgTheme.spacing.md,
    gap: rpgTheme.spacing.md,
    flexShrink: 1,
    justifyContent: 'space-between',
    ...rpgTheme.effects.shadows.card,
  },

  // ════════════ Header ════════════
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: rpgTheme.spacing.sm,
  },

  // Programme Badge
  programBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rpgTheme.spacing.sm,
    paddingVertical: rpgTheme.spacing.xs,
    borderRadius: rpgTheme.borderRadius.md,
    flex: 1,
  },

  programIcon: {
    fontSize: 24,
    marginRight: rpgTheme.spacing.xs,
  },

  programInfo: {
    flex: 1,
  },

  programLabel: {
    fontSize: 12,
    fontWeight: rpgTheme.typography.weights.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  levelIndicator: {
    fontSize: 10,
    color: rpgTheme.colors.text.secondary,
    fontWeight: rpgTheme.typography.weights.medium,
  },

  completedBadge: {
    shadowColor: rpgTheme.colors.status.active,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },

  // ════════════ Title ════════════
  titleSection: {
    paddingVertical: rpgTheme.spacing.xs,
  },

  missionTitle: {
    fontSize: 18,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.text.primary,
    lineHeight: 24,
    marginBottom: rpgTheme.spacing.xs,
    letterSpacing: 0.2,
  },

  levelName: {
    fontSize: 12,
    color: rpgTheme.colors.text.secondary,
    fontWeight: rpgTheme.typography.weights.medium,
    fontStyle: 'italic',
  },

  // ════════════ Actions ════════════
  actionRow: {
    flexDirection: 'row',
    gap: rpgTheme.spacing.sm,
    marginTop: rpgTheme.spacing.xs,
    maxHeight: 50,
  },

  // ════════════ Completed ════════════
  completedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rpgTheme.spacing.sm,
    paddingVertical: rpgTheme.spacing.md,
    backgroundColor: `${rpgTheme.colors.status.active}10`,
    borderRadius: rpgTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${rpgTheme.colors.status.active}20`,
  },

  completedText: {
    fontSize: 13,
    color: rpgTheme.colors.status.active,
    fontWeight: rpgTheme.typography.weights.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ════════════ Decorative ════════════
  cornerAccent: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 32,
    height: 32,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopRightRadius: 16,
    opacity: 0.6,
  },
});

export default WorkoutCard;
