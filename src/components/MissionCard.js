import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { rpgTheme } from '../theme/rpgTheme';

/**
 * 🎮 MissionCard - Carte de quête gaming avec design RPG moderne
 * 
 * Design features:
 * - Glassmorphism avec bordures néon colorées selon le programme
 * - Badge XP avec effet glow
 * - Affichage proéminent du programme/catégorie (icône + nom + couleur)
 * - Hiérarchie visuelle claire (titre > programme > niveau > XP)
 * - Effets visuels gaming (shadows, glows, gradients)
 * 
 * @param {Object} session - Données de la mission
 * @param {string} session.skillName - Nom de la compétence (titre principal)
 * @param {number} session.levelNumber - Numéro du niveau
 * @param {string} session.levelName - Nom du niveau (ex: "Initiation")
 * @param {string} session.programName - Nom du programme (ex: "Street Workout")
 * @param {string} session.programIcon - Emoji du programme
 * @param {string} session.programColor - Couleur hex du programme
 * @param {number} session.xpReward - Points XP gagnés
 * @param {string} session.status - Statut ('available', 'completed', 'locked')
 * @param {Function} onPreview - Callback pour aperçu
 * @param {Function} onStart - Callback pour démarrer
 * @param {boolean} disabled - État désactivé
 */
const MissionCard = ({ session, onPreview, onStart, disabled = false }) => {
  const {
    skillName,
    skillId,
    levelNumber = 1,
    levelName = '',
    status = 'available',
    xpReward = 0,
    programName = '',
    programIcon = '💪',
    programColor = '#4D9EFF',
    // Fallback pour ancienne structure si besoin
    name,
    level,
  } = session;

  const isCompleted = status === 'completed';
  const displayName = skillName || name || 'Mission';
  const displayLevel = levelNumber || level || 1;

  // Couleurs dérivées de la couleur du programme pour les effets
  const borderColor = programColor || '#4D9EFF';
  const glowColor = `${borderColor}40`; // 25% opacity pour le glow

  return (
    <TouchableOpacity 
      activeOpacity={0.95} 
      disabled={disabled || isCompleted}
      style={styles.cardWrapper}
    >
      <View style={[styles.cardGlowOuter, { shadowColor: borderColor }]}>
        <LinearGradient
          colors={[
            'rgba(15, 23, 42, 0.95)',
            'rgba(30, 41, 59, 0.85)',
            'rgba(15, 23, 42, 0.95)',
          ]}
          style={[
            styles.cardGradient,
            { borderColor: isCompleted ? '#334155' : borderColor }
          ]}
        >
          {/* Header avec programme et XP */}
          <View style={styles.cardHeader}>
            {/* Badge Programme (gauche) */}
            <View style={[styles.programBadge, { backgroundColor: `${borderColor}15` }]}>
              <Text style={styles.programIcon}>{programIcon}</Text>
              <View style={styles.programTextContainer}>
                <Text style={[styles.programName, { color: borderColor }]} numberOfLines={1}>
                  {programName || 'Programme'}
                </Text>
                <Text style={styles.levelLabel}>Niveau {displayLevel}</Text>
              </View>
            </View>

            {/* XP Badge (droite) */}
            {!isCompleted && (
              <View style={styles.xpBadgeContainer}>
                <LinearGradient
                  colors={['#7B61FF', '#9F7AEA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.xpGradient}
                >
                  <Icon name="lightning-bolt" size={14} color="#FFF" style={styles.xpIcon} />
                  <Text style={styles.xpText}>+{xpReward}</Text>
                </LinearGradient>
              </View>
            )}

            {/* Completed Badge */}
            {isCompleted && (
              <View style={styles.completedBadgeHeader}>
                <Icon name="check-circle" size={28} color="#00FF94" />
              </View>
            )}
          </View>

          {/* Titre principal de la mission */}
          <View style={styles.titleSection}>
            <Text style={styles.missionTitle} numberOfLines={2}>
              {displayName}
            </Text>
            {levelName && (
              <Text style={styles.levelName}>{levelName}</Text>
            )}
          </View>

          {/* Actions buttons */}
          {!isCompleted && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={onPreview}
                disabled={disabled}
                style={[styles.actionButton, styles.previewButton, { borderColor }]}
                activeOpacity={0.7}
              >
                <Icon name="eye-outline" size={16} color={borderColor} />
                <Text style={[styles.buttonText, { color: borderColor }]}>
                  Aperçu
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onStart}
                disabled={disabled}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#4D9EFF', '#3B82F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startButtonGradient}
                >
                  <Icon name="play" size={16} color="#FFF" />
                  <Text style={styles.startButtonText}>Commencer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Completed state */}
          {isCompleted && (
            <View style={styles.completedOverlay}>
              <Icon name="check-circle-outline" size={20} color="#00FF94" />
              <Text style={styles.completedText}>Quête accomplie</Text>
            </View>
          )}

          {/* Decorative corner accent */}
          <View style={[styles.cornerAccent, { borderColor }]} />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // 🎴 Card container avec glow effect
  cardWrapper: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  cardGlowOuter: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // 🌈 Glassmorphism card avec bordure néon
  cardGradient: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },

  // 📌 Header avec programme et XP
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  // 🏷️ Badge Programme (gauche)
  programBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  programIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  programTextContainer: {
    flex: 1,
  },
  programName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  levelLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // ⚡ XP Badge (droite)
  xpBadgeContainer: {
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  xpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  xpIcon: {
    marginTop: -1,
  },
  xpText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ✅ Completed badge
  completedBadgeHeader: {
    shadowColor: '#00FF94',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },

  // 📝 Titre de la mission
  titleSection: {
    marginBottom: 20,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  levelName: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    fontStyle: 'italic',
  },

  // 🎮 Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  
  // 👁️ Preview button (outline)
  previewButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ▶️ Start button (gradient)
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ✔️ Completed overlay
  completedOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 255, 148, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 148, 0.2)',
  },
  completedText: {
    fontSize: 15,
    color: '#00FF94',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // 💎 Decorative corner accent (gaming detail)
  cornerAccent: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 20,
    opacity: 0.6,
  },
});

export default MissionCard;