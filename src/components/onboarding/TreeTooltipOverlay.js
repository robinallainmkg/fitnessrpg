import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TreeTooltipOverlay = ({ cardLayout, onDismiss }) => {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const tooltipTranslate = useRef(new Animated.Value(20)).current;
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0.85,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.sequence([
        Animated.delay(150),
        Animated.parallel([
          Animated.timing(tooltipTranslate, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.timing(tooltipOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          })
        ])
      ])
    ]).start();

    // Animation bounce infinie de l'emoji
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(emojiScale, {
          toValue: 1.15,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(emojiScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        })
      ])
    );
    bounceLoop.start();

    return () => bounceLoop.stop();
  }, []);

  const handlePress = () => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      onDismiss();
    });
  };

  if (!cardLayout) return null;

  const tooltipTop = cardLayout.y + cardLayout.height + 20;

  return (
    <TouchableOpacity 
      activeOpacity={1} 
      onPress={handlePress}
      style={StyleSheet.absoluteFill}
    >
      <Animated.View 
        style={[styles.overlay, { opacity: overlayOpacity }]} 
      />

      <View
        style={[
          styles.spotlightBorder,
          {
            top: cardLayout.y - 4,
            left: cardLayout.x - 4,
            width: cardLayout.width + 8,
            height: cardLayout.height + 8
          }
        ]}
      />

      <Animated.View
        style={[
          styles.tooltip,
          {
            top: tooltipTop,
            opacity: tooltipOpacity,
            transform: [{ translateY: tooltipTranslate }]
          }
        ]}
      >
        <Animated.Text 
          style={[
            styles.emojiPointer,
            { transform: [{ scale: emojiScale }] }
          ]}
        >
          👆
        </Animated.Text>
        <Text style={styles.tooltipTitle}>
          Clique sur "Voir l'arbre"
        </Text>
        <Text style={styles.tooltipSubtitle}>
          Découvre ton parcours d'entraînement et choisis ton premier niveau !
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000'
  },
  spotlightBorder: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#FFD700',
    borderRadius: 16,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8
  },
  tooltip: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFA500',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: SCREEN_WIDTH - 48
  },
  emojiPointer: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4
  },
  tooltipSubtitle: {
    fontSize: 14,
    color: '#4A4A4A',
    textAlign: 'center'
  }
});

export default TreeTooltipOverlay;
