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
 * 📚 ProgramCard - Carte programme unifié pour HomeScreen et ProgramSelection
 * 
 * Design features:
 * - Image de fond pour chaque programme avec gradient overlay
 * - Structure flexible: titre + description optionnelle + progression/stats
 * - Bouton "Voir l'arbre" stylisé du thème
 * - Badge "Actif" positionné top-right
 * - Bordure 1.5px avec couleur du programme
 * - Adaptatif: HomeScreen (compact) vs ProgramSelection (détaillé)
 * 
 * Utilisation:
 * <ProgramCard
 *   program={programData}
 *   onViewTree={handleViewTree}
 *   showDescription={true}
 *   showStats={true}
 *   primaryStats={['strength', 'endurance']}
 * />
 */
const ProgramCard = ({
  program = {},
  onViewTree,
  onSelect,
  isSelected = false,
  disabled = false,
  style,
  showDescription = false,
  showStats = false,
  primaryStats = [],
}) => {
  const {
    id,
    name = 'Programme',
    backgroundImage,
    status = 'active',
    completedSkills = 0,
    totalSkills = 0,
    description = '',
    icon = '',
  } = program;

  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const progress = totalSkills > 0 ? (completedSkills / totalSkills) : 0;

  // Couleur du programme
  const programColor = getProgramColor(id, rpgTheme.colors.neon.blue);

  // Image source - fallback si pas d'image
  const imageSource = backgroundImage 
    ? (typeof backgroundImage === 'string' 
      ? { uri: backgroundImage }
      : backgroundImage)  // require() retourne déjà le bon format
    : null;

  const cardContent = (
    <>
      {/* ═══ Status Badge (top-right) ═══ */}
      {(isActive || isCompleted) && (
        <StatusBadge
          status={status}
          size="small"
          position="absolute"
          style={styles.statusBadgePosition}
        />
      )}

      {/* ═══ TOP CONTENT: Titre + Description ═══ */}
      <View style={styles.topContent}>
        <View style={styles.header}>
          {icon && <Text style={styles.programIcon}>{icon}</Text>}
          <Text style={styles.programName} numberOfLines={2}>
            {name}
          </Text>
        </View>
        
        {showDescription && description && (
          <Text style={styles.programDescription} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      {/* ═══ MIDDLE CONTENT: Stats ou Progression ═══ */}
      {showStats && primaryStats.length > 0 ? (
        <View style={styles.statsSection}>
          {primaryStats.map(stat => (
            <View key={stat} style={styles.statBadge}>
              <Text style={styles.statBadgeText}>
                {stat}
              </Text>
            </View>
          ))}
        </View>
      ) : totalSkills > 0 ? (
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
      ) : null}

      {/* ═══ Action Buttons (Row) ═══ */}
      <View style={styles.buttonContainer}>
        <ActionButton
          onPress={onViewTree}
          icon={rpgTheme.componentStyles.viewTreeButton.icon}
          color="primary"
          size="small"
          disabled={disabled}
          style={styles.viewTreeButton}
        >
          Voir l'arbre
        </ActionButton>
        
        {onSelect && (
          <ActionButton
            onPress={onSelect}
            icon="check-circle"
            color="success"
            size="small"
            disabled={disabled}
            style={styles.selectButton}
          >
            {isSelected ? 'Désélectionner' : 'Sélectionner'}
          </ActionButton>
        )}
      </View>
    </>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={disabled}
      style={[styles.cardContainer, style]}
    >
      {imageSource ? (
        <ImageBackground
          source={imageSource}
          style={styles.imageBackground}
          imageStyle={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* ═══ Dark overlay for readability ═══ */}
          <LinearGradient
            colors={['rgba(10, 14, 39, 0.85)', 'rgba(26, 34, 68, 0.90)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.card,
              {
                borderColor: isCompleted ? rpgTheme.colors.text.muted : programColor,
                borderWidth: 1.5,
              },
            ]}
          >
            {cardContent}
          </LinearGradient>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={['rgba(26, 34, 68, 0.95)', 'rgba(15, 23, 42, 0.90)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card,
            {
              borderColor: isCompleted ? rpgTheme.colors.text.muted : programColor,
              borderWidth: 1.5,
            },
          ]}
        >
          {cardContent}
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ════════════ Container ════════════
  cardContainer: {
    marginHorizontal: rpgTheme.spacing.md,
    marginBottom: rpgTheme.spacing.md,
    borderRadius: rpgTheme.borderRadius.lg,
    overflow: 'hidden',
  },

  // ════════════ Background Image ════════════
  imageBackground: {
    borderRadius: rpgTheme.borderRadius.lg,
    overflow: 'hidden',
  },

  backgroundImage: {
    borderRadius: rpgTheme.borderRadius.lg,
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
  topContent: {
    marginBottom: rpgTheme.spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rpgTheme.spacing.sm,
    marginBottom: rpgTheme.spacing.sm,
    marginTop: 24, // Space for status badge
  },

  programIcon: {
    fontSize: 24,
    lineHeight: 24,
  },

  programName: {
    fontSize: 18,
    fontWeight: rpgTheme.typography.weights.semibold,
    color: rpgTheme.colors.text.primary,
    flex: 1,
    letterSpacing: 0.2,
    lineHeight: 22,
  },

  programDescription: {
    fontSize: 12,
    color: rpgTheme.colors.text.secondary,
    fontWeight: rpgTheme.typography.weights.regular,
    lineHeight: 16,
    marginTop: rpgTheme.spacing.xs,
  },

  // ════════════ Stats ════════════
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rpgTheme.spacing.xs,
    marginBottom: rpgTheme.spacing.md,
  },

  statBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(77, 158, 255, 0.15)',
    borderRadius: rpgTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.3)',
  },

  statBadgeText: {
    fontSize: 11,
    color: rpgTheme.colors.neon.blue,
    fontWeight: rpgTheme.typography.weights.semibold,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: rpgTheme.spacing.sm,
    marginTop: rpgTheme.spacing.sm,
  },

  viewTreeButton: {
    flex: 1,
    marginTop: 0,
  },

  selectButton: {
    flex: 1,
    marginTop: 0,
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
