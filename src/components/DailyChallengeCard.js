import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { colors } from '../theme/colors';
import { rpgTheme } from '../theme/rpgTheme';
import { getChallengeLabel, getChallengeXP } from '../types/Challenge';

/**
 * DailyChallengeCard - Card RPG pour afficher le défi du jour
 * Affichée en haut de HomeScreen
 */
const DailyChallengeCard = ({ 
  challenge, 
  hasSubmitted, 
  loading, 
  onPress 
}) => {
  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.loadingContent}>
          <Text style={styles.loadingText}>Chargement du défi...</Text>
        </Card.Content>
      </Card>
    );
  }

  if (!challenge) {
    return null;
  }

  const challengeLabel = getChallengeLabel(challenge.challengeType);
  const xp = getChallengeXP(challenge.challengeType);
  
  // Déterminer le statut d'affichage
  const status = challenge.status || (hasSubmitted ? 'pending' : null);
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isPending = status === 'pending';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <ImageBackground
        source={require('../../assets/programmes/street-bg.jpg')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.overlay} />
        <Card style={styles.card}>
          <Card.Content style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={styles.icon}>⚔️</Text>
                <Text style={styles.title}>DÉFI DU JOUR</Text>
              </View>
              {isApproved ? (
                <View style={[styles.completedBadge, styles.approvedBadge]}>
                  <Text style={styles.completedText}>✓ VALIDÉ</Text>
                </View>
              ) : isRejected ? (
                <View style={[styles.completedBadge, styles.rejectedBadge]}>
                  <Text style={styles.completedText}>✗ REFUSÉ</Text>
                </View>
              ) : isPending ? (
                <View style={[styles.completedBadge, styles.pendingBadge]}>
                  <Text style={styles.completedText}>⏳ EN ATTENTE</Text>
                </View>
              ) : (
                <View style={styles.xpBadge}>
                  <Text style={styles.xpText}>+{xp} XP</Text>
                </View>
              )}
            </View>

            {/* Challenge Name */}
            <Text style={styles.challengeName}>{challengeLabel}</Text>

            {/* Status */}
            {isApproved ? (
              <Text style={[styles.statusText, styles.approvedText]}>
                🎉 Challenge validé ! +{xp} XP reçus
              </Text>
            ) : isRejected ? (
              <Text style={[styles.statusText, styles.rejectedText]}>
                Soumission refusée. Réessaye demain !
              </Text>
            ) : isPending ? (
              <Text style={styles.statusText}>En attente de validation par l'admin</Text>
            ) : (
              <View style={styles.actionRow}>
                <Text style={styles.actionIcon}>🎥</Text>
                <Text style={styles.actionText}>Appuyer pour relever le défi</Text>
              </View>
            )}

            {/* Decorative elements */}
            <View style={styles.decorativeBar} />
          </Card.Content>
        </Card>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  backgroundImageStyle: {
    borderRadius: 16,
    opacity: 0.2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)', // Overlay sombre
    borderRadius: 16,
  },
  card: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  content: {
    padding: 20,
  },
  loadingContent: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F59E0B', // Orange doré
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  xpBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)', // Violet transparent
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  xpText: {
    color: '#C084FC',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  completedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)', // Vert transparent
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  approvedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)', // Vert transparent
    borderColor: '#22C55E',
  },
  pendingBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.25)', // Orange transparent
    borderColor: '#F59E0B',
  },
  rejectedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)', // Rouge transparent
    borderColor: '#EF4444',
  },
  completedText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  challengeName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  approvedText: {
    color: '#4ADE80',
    fontWeight: '600',
  },
  rejectedText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#4D9EFF',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  decorativeBar: {
    height: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 2,
    marginTop: 16,
    width: '40%',
  },
});

export default DailyChallengeCard;
