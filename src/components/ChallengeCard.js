import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ChallengeCard = ({ challenge, onPress }) => {
  const getStatusBadge = () => {
    switch (challenge.status) {
      case 'pending':
        return { text: '⏳ En attente', color: '#FF9800' };
      case 'approved':
        return { text: '✅ Validé', color: '#4CAF50' };
      case 'rejected':
        return { text: '❌ Refusé', color: '#F44336' };
      case 'available':
        return { text: '🎯 Disponible', color: '#2196F3' };
      default:
        return { text: '🔒 Verrouillé', color: '#9E9E9E' };
    }
  };

  const statusBadge = getStatusBadge();
  const attemptsRemaining = challenge.maxAttempts - (challenge.attemptsTaken || 0);
  const canAttempt = attemptsRemaining > 0 && challenge.status === 'available';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={challenge.status === 'locked'}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={challenge.status === 'locked' ? ['#424242', '#303030'] : [challenge.programColor || '#6C63FF', challenge.programColor ? `${challenge.programColor}CC` : '#5848CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header avec icône et status */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.programIcon}>{challenge.programIcon || '🎯'}</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.programName}>{challenge.programName}</Text>
              <Text style={styles.levelName}>Niveau {challenge.levelId} - {challenge.levelName}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
            <Text style={styles.statusText}>{statusBadge.text}</Text>
          </View>
        </View>

        {/* Titre du challenge */}
        <Text style={styles.challengeTitle}>{challenge.title}</Text>

        {/* Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementText}>
            {challenge.requirements.reps} × {challenge.requirements.exercise}
          </Text>
        </View>

        {/* Footer avec XP et tentatives */}
        <View style={styles.footer}>
          <View style={styles.xpContainer}>
            <Text style={styles.xpIcon}>⭐</Text>
            <Text style={styles.xpText}>{challenge.xpReward} XP</Text>
          </View>
          
          {challenge.status === 'available' && (
            <View style={styles.attemptsContainer}>
              <Text style={styles.attemptsText}>
                {canAttempt ? `${attemptsRemaining}/3 tentatives` : '❌ Tentatives épuisées'}
              </Text>
            </View>
          )}

          {challenge.status === 'pending' && (
            <Text style={styles.pendingText}>En cours de validation...</Text>
          )}

          {challenge.status === 'rejected' && challenge.adminFeedback && (
            <Text style={styles.feedbackText} numberOfLines={1}>💬 {challenge.adminFeedback}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  programIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  programName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  levelName: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  requirementsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
  },
  attemptsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attemptsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pendingText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#FFD700',
  },
  feedbackText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#FFEB3B',
    maxWidth: '60%',
  },
});

export default ChallengeCard;
