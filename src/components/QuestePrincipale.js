import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const QuestePrincipale = ({ challenge, onPress }) => {
  if (!challenge) {
    return null;
  }

  const attemptsRemaining = challenge.maxAttempts - (challenge.attemptsTaken || 0);
  const canAttempt = attemptsRemaining > 0;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53', '#FFD93D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Badge "Quête Principale" */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⚔️ QUÊTE PRINCIPALE</Text>
        </View>

        {/* Icône programme */}
        <Text style={styles.programIcon}>{challenge.programIcon || '🎯'}</Text>

        {/* Titre */}
        <Text style={styles.title}>{challenge.title}</Text>

        {/* Programme et niveau */}
        <Text style={styles.subtitle}>
          {challenge.programName} • Niveau {challenge.levelId}
        </Text>

        {/* Requirements en grand */}
        <View style={styles.requirementsBox}>
          <Text style={styles.repsNumber}>{challenge.requirements.reps}</Text>
          <Text style={styles.exerciseName}>{challenge.requirements.exercise}</Text>
        </View>

        {/* Footer avec CTA */}
        <View style={styles.footer}>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>⭐ {challenge.xpReward} XP</Text>
          </View>
          
          <View style={styles.ctaContainer}>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaText}>
                {canAttempt ? '🎯 RELEVER LE DÉFI' : '⏳ TENTATIVES ÉPUISÉES'}
              </Text>
            </View>
            {canAttempt && (
              <Text style={styles.attemptsInfo}>{attemptsRemaining}/3 tentatives restantes</Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    padding: 20,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF6B6B',
    letterSpacing: 1,
  },
  programIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 20,
    textAlign: 'center',
  },
  requirementsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  repsNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  xpBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFD700',
  },
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF6B6B',
    letterSpacing: 0.5,
  },
  attemptsInfo: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.9,
  },
});

export default QuestePrincipale;
