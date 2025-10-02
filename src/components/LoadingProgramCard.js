import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

/**
 * Composant de chargement avec animation pour ProgramProgressCard
 * Affiche un skeleton loader pendant le chargement des données
 */
const LoadingProgramCard = ({ 
  style,
  showAnimation = true,
  count = 1 
}) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showAnimation) return;

    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerValue, showAnimation]);

  const shimmerOpacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const SkeletonElement = ({ width, height, style: elementStyle }) => (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          opacity: showAnimation ? shimmerOpacity : 0.3,
        },
        elementStyle,
      ]}
    />
  );

  const LoadingCard = () => (
    <Card style={[styles.card, style]} elevation={6}>
      <View style={styles.container}>
        {/* Header avec icône et titre */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <SkeletonElement width={80} height={80} style={styles.iconSkeleton} />
          </View>
          
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <SkeletonElement width={140} height={24} />
              <SkeletonElement width={80} height={20} style={styles.xpSkeleton} />
            </View>
            <SkeletonElement width={100} height={16} style={{ marginTop: 4 }} />
            <SkeletonElement width={200} height={14} style={{ marginTop: 8 }} />
          </View>
        </View>

        {/* Section progression */}
        <View style={styles.progressSection}>
          <SkeletonElement width={150} height={16} />
          <View style={styles.statsRow}>
            <SkeletonElement width={60} height={20} />
            <SkeletonElement width={40} height={16} />
          </View>
          
          {/* Barre de progression */}
          <View style={styles.progressBarContainer}>
            <SkeletonElement width="100%" height={8} style={styles.progressBarSkeleton} />
          </View>
        </View>

        {/* Footer avec boutons */}
        <View style={styles.footer}>
          <SkeletonElement width={120} height={36} style={styles.buttonSkeleton} />
          <SkeletonElement width={90} height={24} style={styles.badgeSkeleton} />
        </View>
      </View>
    </Card>
  );

  // Si count > 1, afficher plusieurs cards de chargement
  if (count > 1) {
    return (
      <View>
        {Array.from({ length: count }, (_, index) => (
          <LoadingCard key={index} />
        ))}
      </View>
    );
  }

  return <LoadingCard />;
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconSkeleton: {
    borderRadius: 16,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  xpSkeleton: {
    borderRadius: 12,
  },
  progressSection: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarSkeleton: {
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonSkeleton: {
    borderRadius: 20,
  },
  badgeSkeleton: {
    borderRadius: 12,
  },
  skeleton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
});

export default LoadingProgramCard;
