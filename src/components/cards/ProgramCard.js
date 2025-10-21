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
 * 🎮 Stat badges configuration avec couleurs et emojis
 */
const STAT_CONFIG = {
  strength: { icon: '💪', color: '#FF6B6B', label: 'Strength' },
  power: { icon: '⚡', color: '#FFD93D', label: 'Power' },
  endurance: { icon: '🫀', color: '#4ECDC4', label: 'Endurance' },
  speed: { icon: '🚀', color: '#95E1D3', label: 'Speed' },
  flexibility: { icon: '🤸', color: '#C77DFF', label: 'Flexibility' },
  mobility: { icon: '🧘', color: '#F472B6', label: 'Mobility' },
  coordination: { icon: '🎯', color: '#06B6D4', label: 'Coordination' },
};

/**
 * 📚 ProgramCard - Carte programme unifié pour HomeScreen et ProgramSelection
 * 
 * Design features:
 * - Image de fond VISIBLE avec gradient overlay subtil
 * - Structure flexible: titre + description optionnelle + progression/stats
 * - Bouton "Voir l'arbre" stylisé du thème
 * - Badge "Actif" positionné top-right
 * - Pas de bordure visible - juste glow/shadow
 * - Adaptatif: HomeScreen (compact) vs ProgramSelection (détaillé)
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
          {primaryStats.map(stat => {
            const config = STAT_CONFIG[stat] || { icon: '📊', color: '#4D9EFF', label: stat };
            return (
              <View
                key={stat}
                style={[
                  styles.statBadgeImproved,
                  { backgroundColor: `${config.color}20` },
                ]}
              >
                <Text style={styles.statBadgeIcon}>{config.icon}</Text>
                <Text style={[styles.statBadgeLabel, { color: config.color }]}>
                  {config.label}
                </Text>
              </View>
            );
          })}
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
      activeOpacity={0.7}
      disabled={disabled}
      style={[styles.cardContainer, style]}
    >
      <View style={styles.cardContent}>
        {/* ═══ PARTIE 1: IMAGE (60%) ═══ */}
        {imageSource ? (
          <ImageBackground
            source={imageSource}
            style={styles.imageSection}
            imageStyle={styles.backgroundImage}
            resizeMode="cover"
          >
            {/* Overlay très léger sur l'image */}
            <LinearGradient
              colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.1)']}
              style={styles.imageOverlay}
            />
            
            {/* Status badge positionné en haut-droit de l'image */}
            {(isActive || isCompleted) && (
              <StatusBadge
                status={status}
                size="small"
                style={styles.imageBadgePosition}
              />
            )}
          </ImageBackground>
        ) : (
          <View style={styles.imagePlaceholder} />
        )}

        {/* ═══ PARTIE 2: TEXTE & BOUTONS (40%) ═══ */}
        <LinearGradient
          colors={['rgba(26, 34, 68, 0.85)', 'rgba(15, 23, 42, 0.95)']}
          style={styles.textSection}
        >
          {cardContent}
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ════════════ Container ════════════
  cardContainer: {
    marginHorizontal: 0,
    marginBottom: 0,
    borderRadius: rpgTheme.borderRadius.lg,
    overflow: 'hidden',
  },

  // ════════════ Card Content (Flex Column Layout) ════════════
  cardContent: {
    borderRadius: rpgTheme.borderRadius.lg,
    overflow: 'hidden',
    minHeight: 280,
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },

  // ════════════ Image Section (60% hauteur) ════════════
  imageSection: {
    flex: 0.6,
    minHeight: 170,
    justifyContent: 'flex-end',
    position: 'relative',
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  imageBadgePosition: {
    position: 'absolute',
    top: rpgTheme.spacing.sm,
    right: rpgTheme.spacing.sm,
    margin: 0,
    zIndex: 10,
  },

  imagePlaceholder: {
    flex: 0.6,
    minHeight: 170,
    backgroundColor: 'rgba(26, 34, 68, 0.8)',
  },

  // ════════════ Background Image ════════════
  backgroundImage: {
    borderRadius: rpgTheme.borderRadius.lg,
  },

  // ════════════ Text Section (40% hauteur) ════════════
  textSection: {
    flex: 0.4,
    padding: rpgTheme.spacing.md,
    justifyContent: 'space-between',
  },

  // ════════════ Header ════════════
  topContent: {
    marginBottom: 8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rpgTheme.spacing.sm,
    marginBottom: rpgTheme.spacing.xs,
    marginTop: 0,
  },

  programIcon: {
    fontSize: 20,
    lineHeight: 20,
  },

  programName: {
    fontSize: 16,
    fontWeight: rpgTheme.typography.weights.semibold,
    color: rpgTheme.colors.text.primary,
    flex: 1,
    letterSpacing: 0.2,
    lineHeight: 20,
  },

  programDescription: {
    fontSize: 11,
    color: rpgTheme.colors.text.secondary,
    fontWeight: rpgTheme.typography.weights.regular,
    lineHeight: 14,
    marginTop: 2,
  },

  // ════════════ Stats ════════════
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rpgTheme.spacing.xs,
    marginBottom: 6,
  },

  statBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(77, 158, 255, 0.15)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.3)',
  },

  statBadgeText: {
    fontSize: 10,
    color: rpgTheme.colors.neon.blue,
    fontWeight: rpgTheme.typography.weights.semibold,
  },

  // ════════════ Stat Badges Améliorés (avec emoji et couleurs) ════════════
  statBadgeImproved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  statBadgeIcon: {
    fontSize: 11,
    lineHeight: 11,
  },

  statBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
    letterSpacing: 0.1,
  },

  // ════════════ Progress ════════════
  progressSection: {
    marginBottom: 6,
  },

  progressText: {
    fontSize: 14,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.text.primary,
    marginBottom: 2,
  },

  progressTotal: {
    color: rpgTheme.colors.text.secondary,
    fontSize: 12,
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
    height: 4,
    backgroundColor: rpgTheme.colors.background.secondary,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },

  progressBar: {
    height: '100%',
    borderRadius: 2,
  },

  // ════════════ Button ════════════
  buttonContainer: {
    flexDirection: 'row',
    gap: rpgTheme.spacing.xs,
    marginTop: 0,
  },

  viewTreeButton: {
    flex: 1,
    marginTop: 0,
    paddingVertical: 6,
  },

  selectButton: {
    flex: 1,
    marginTop: 0,
    paddingVertical: 6,
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
    opacity: 0.4,
  },
});

export default ProgramCard;