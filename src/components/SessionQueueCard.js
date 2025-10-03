import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { colors } from '../theme/colors';

/**
 * Carte d'affichage d'une séance dans la queue
 * Affiche le nom, le type, le statut et un bouton pour commencer
 */
const SessionQueueCard = ({ session, onStart, disabled = false }) => {
  const { 
    name, 
    type, 
    week, 
    status = 'pending',
    xpReward = 0,
    icon = '💪'
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
          {/* Icône et info */}
          <View style={styles.infoContainer}>
            <Text style={styles.icon}>{getTypeIcon(type)}</Text>
            <View style={styles.textContainer}>
              <Text 
                style={[
                  styles.sessionName,
                  isCompleted && styles.completedText
                ]} 
                numberOfLines={2}
              >
                {name}
              </Text>
              <View style={styles.metadata}>
                <Chip 
                  mode="flat" 
                  compact 
                  style={styles.typeChip}
                  textStyle={styles.typeText}
                >
                  {type || 'Entraînement'}
                </Chip>
                {week && (
                  <Text style={styles.weekText}>Semaine {week}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Statut et XP */}
          <View style={styles.statusContainer}>
            {isCompleted ? (
              <View style={styles.completedBadge}>
                <Text style={styles.completedIcon}>✅</Text>
              </View>
            ) : (
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>+{xpReward} XP</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bouton d'action */}
        {!isCompleted && (
          <Button
            mode="contained"
            onPress={onStart}
            disabled={disabled}
            style={styles.startButton}
            contentStyle={styles.startButtonContent}
            buttonColor={colors.primary}
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
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: colors.surface + 'DD',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  completedText: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    backgroundColor: colors.primary + '20',
    height: 24,
  },
  typeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  weekText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusContainer: {
    marginLeft: 8,
  },
  xpBadge: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.accent,
  },
  completedBadge: {
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 24,
  },
  startButton: {
    marginTop: 4,
  },
  startButtonContent: {
    paddingVertical: 4,
  },
  startButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  completedMessage: {
    marginTop: 4,
    padding: 8,
    backgroundColor: colors.success + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  completedMessageText: {
    fontSize: 13,
    color: colors.success,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default SessionQueueCard;
