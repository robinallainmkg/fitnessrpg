import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { rpgTheme } from '../theme/rpgTheme';

/**
 * Carte d'affichage d'une mission/entraînement avec deux actions :
 * - Voir l'entraînement (aperçu)
 * - Commencer (démarrage direct)
 */
const MissionCard = ({ session, onPreview, onStart, disabled = false }) => {
  const {
    name,
    type,
    week,
    level,
    status = 'pending',
    xpReward = 0,
    icon = '💪',
    programName = '',
    programIcon = '🏋️'
  } = session;

  const isCompleted = status === 'completed';

  // Type d'entraînement avec emoji
  const getTypeIcon = (type) => {
    const typeIcons = {
      'force': '🏋️',
      'cardio': '🏃',
      'hiit': '🔥',
      'yoga': '🧘',
      'skill': '⚡',
      'endurance': '🚴',
      'power': '💥',
      'flexibility': '🤸'
    };
    return typeIcons[type?.toLowerCase()] || '💪';
  };

  return (
    <Card style={styles.card}>
      <LinearGradient
        colors={rpgTheme.colors.gradients.cardBorder}
        style={styles.cardGradient}
      >
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            {/* Icône du programme à gauche */}
            <Text style={styles.programIcon}>{programIcon}</Text>

            {/* Infos centrales */}
            <View style={styles.textContainer}>
              <Text style={styles.sessionName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.subtitle}>Niveau {level || 1}</Text>
            </View>

            {/* XP Badge à droite */}
            {!isCompleted && (
              <View style={styles.xpBadge}>
                <LinearGradient
                  colors={rpgTheme.colors.gradients.xpBar}
                  style={styles.xpGradient}
                >
                  <Text style={styles.xpText}>+{xpReward} XP</Text>
                </LinearGradient>
              </View>
            )}

            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedIcon}>✅</Text>
              </View>
            )}
          </View>

          {/* Boutons d'action */}
          {!isCompleted && (
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={onPreview}
                disabled={disabled}
                style={styles.previewButton}
                contentStyle={styles.previewButtonContent}
                labelStyle={styles.previewButtonLabel}
                icon="eye-outline"
              >
                Voir l'entraînement
              </Button>

              <Button
                mode="contained"
                onPress={onStart}
                disabled={disabled}
                style={styles.startButton}
                contentStyle={styles.startButtonContent}
                buttonColor={rpgTheme.colors.neon.blue}
                labelStyle={styles.startButtonLabel}
                icon="play"
              >
                Commencer
              </Button>
            </View>
          )}

          {isCompleted && (
            <View style={styles.completedMessage}>
              <Text style={styles.completedMessageText}>
                Mission accomplie ! 🎉
              </Text>
            </View>
          )}
        </Card.Content>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: rpgTheme.spacing.md,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  cardGradient: {
    borderRadius: 16,
  },
  content: {
    padding: rpgTheme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rpgTheme.spacing.lg,
  },
  programIcon: {
    fontSize: 32,
    marginRight: rpgTheme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  sessionName: {
    fontSize: rpgTheme.typography.sizes.subheading,
    fontWeight: rpgTheme.typography.weights.semibold,
    color: rpgTheme.colors.text.primary,
    marginBottom: rpgTheme.spacing.xs,
  },
  subtitle: {
    fontSize: rpgTheme.typography.sizes.caption,
    color: rpgTheme.colors.text.secondary,
  },
  xpBadge: {
    marginLeft: rpgTheme.spacing.md,
  },
  xpGradient: {
    paddingHorizontal: rpgTheme.spacing.sm,
    paddingVertical: rpgTheme.spacing.xs,
    borderRadius: 12,
  },
  xpText: {
    color: '#FFD700',
    fontSize: rpgTheme.typography.sizes.caption,
    fontWeight: rpgTheme.typography.weights.bold,
  },
  completedBadge: {
    marginLeft: rpgTheme.spacing.md,
  },
  completedIcon: {
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: rpgTheme.spacing.sm,
  },
  previewButton: {
    flex: 1,
    borderColor: rpgTheme.colors.neon.blue,
    borderWidth: 1,
  },
  previewButtonContent: {
    paddingVertical: rpgTheme.spacing.sm,
  },
  previewButtonLabel: {
    color: rpgTheme.colors.neon.blue,
    fontSize: rpgTheme.typography.sizes.caption,
  },
  startButton: {
    flex: 1,
  },
  startButtonContent: {
    paddingVertical: rpgTheme.spacing.sm,
  },
  startButtonLabel: {
    fontSize: rpgTheme.typography.sizes.caption,
    fontWeight: rpgTheme.typography.weights.semibold,
  },
  completedMessage: {
    alignItems: 'center',
    paddingVertical: rpgTheme.spacing.md,
  },
  completedMessageText: {
    fontSize: rpgTheme.typography.sizes.body,
    color: rpgTheme.colors.status.completed,
    fontWeight: rpgTheme.typography.weights.medium,
  },
});

export default MissionCard;