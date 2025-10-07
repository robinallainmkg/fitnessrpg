import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { colors } from '../theme/colors';
import { rpgTheme } from '../theme/rpgTheme';

/**
 * Carte d'affichage d'une séance dans la queue
 * Affiche le nom, le type, le statut et un bouton pour commencer
 */
const SessionQueueCard = ({ session, onStart, disabled = false }) => {
  const { 
    name, 
    type, 
    week, 
    level,
    status = 'pending',
    xpReward = 0,
    icon = '💪',
    programName = '',
    programIcon = '🏋️' // Icône du programme par défaut
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
    <Card 
      style={[
        styles.card,
        isCompleted && styles.completedCard
      ]}
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          {/* Icône du programme à gauche */}
          <Text style={styles.icon}>{programIcon}</Text>
          
          {/* Infos centrales */}
          <View style={styles.textContainer}>
            <Text 
              style={[
                styles.sessionName,
                isCompleted && styles.completedText
              ]} 
              numberOfLines={1}
            >
              {name}
            </Text>
            <Text style={styles.subtitle}>Niveau {level || 1}</Text>
          </View>

          {/* XP Badge à droite */}
          {!isCompleted && (
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{xpReward} XP</Text>
            </View>
          )}
          
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedIcon}>✅</Text>
            </View>
          )}
        </View>

        {/* Bouton d'action pleine largeur */}
        {!isCompleted && (
          <Button
            mode="contained"
            onPress={onStart}
            disabled={disabled}
            style={styles.startButton}
            contentStyle={styles.startButtonContent}
            buttonColor={rpgTheme.colors.neon.blue}
            labelStyle={styles.startButtonLabel}
          >
            Commencer
          </Button>
        )}
        
        {isCompleted && (
          <View style={styles.completedMessage}>
            <Text style={styles.completedMessageText}>
              Séance terminée ! 🎉
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: rpgTheme.spacing.md,
    marginVertical: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: rpgTheme.borderRadius.lg,
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.cyan,
    shadowColor: rpgTheme.colors.neon.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  completedCard: {
    opacity: 0.5,
    borderColor: rpgTheme.colors.status.completed,
  },
  content: {
    padding: rpgTheme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rpgTheme.spacing.md,
    gap: rpgTheme.spacing.md,
  },
  icon: {
    fontSize: 36,
  },
  textContainer: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '700',
    color: rpgTheme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: rpgTheme.colors.text.secondary,
    fontWeight: '500',
  },
  completedText: {
    color: rpgTheme.colors.text.muted,
    textDecorationLine: 'line-through',
  },
  xpBadge: {
    backgroundColor: rpgTheme.colors.neon.purple + '25',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: rpgTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.purple,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '700',
    color: rpgTheme.colors.neon.purple,
  },
  completedBadge: {
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 28,
  },
  startButton: {
    marginTop: 4,
    borderRadius: rpgTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.blue,
    shadowColor: rpgTheme.colors.neon.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  startButtonContent: {
    paddingVertical: 6,
  },
  startButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: rpgTheme.colors.text.primary,
  },
  completedMessage: {
    marginTop: 4,
    padding: rpgTheme.spacing.md,
    backgroundColor: rpgTheme.colors.status.completed + '20',
    borderRadius: rpgTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: rpgTheme.colors.status.completed,
  },
  completedMessageText: {
    fontSize: 13,
    color: rpgTheme.colors.status.completed,
    textAlign: 'center',
    fontWeight: '700',
  },
});

export default SessionQueueCard;
