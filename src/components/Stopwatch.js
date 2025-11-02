import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Composant chronomètre pour les exercices de type "time"
 * Style cohérent avec Timer.js
 */
const Stopwatch = ({ onTimeRecorded }) => {
  const [time, setTime] = useState(0); // Temps en secondes
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Notifier le parent quand le temps change
  useEffect(() => {
    if (time > 0 && onTimeRecorded) {
      onTimeRecorded(time);
    }
  }, [time]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
    if (onTimeRecorded) {
      onTimeRecorded(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Affichage du temps */}
      <View style={styles.timeDisplay}>
        <Text style={styles.timeText}>{formatTime(time)}</Text>
        <Text style={styles.timeLabel}>MM:SS</Text>
      </View>

      {/* Contrôles */}
      <View style={styles.controls}>
        {/* Bouton Start/Pause */}
        <LinearGradient
          colors={isRunning ? ['#F59E0B', '#D97706'] : ['#10B981', '#059669']}
          style={styles.controlButton}
        >
          <TouchableOpacity 
            onPress={toggleTimer}
            style={styles.controlButtonTouch}
          >
            <Text style={styles.controlButtonText}>
              {isRunning ? '⏸️ Pause' : '▶️ Start'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Bouton Reset */}
        {time > 0 && (
          <TouchableOpacity 
            onPress={resetTimer}
            style={styles.resetButton}
          >
            <Text style={styles.resetButtonText}>↻ Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Indicateur d'état */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: isRunning ? '#10B981' : '#6B7280' }]} />
        <Text style={styles.statusText}>
          {isRunning ? 'En cours...' : time > 0 ? 'En pause' : 'Prêt à démarrer'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  // Affichage du temps (style similaire au Timer)
  timeDisplay: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingVertical: 32,
    paddingHorizontal: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(123, 97, 255, 0.3)',
  },
  timeText: {
    fontSize: 72,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(123, 97, 255, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 2,
  },

  // Contrôles
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  controlButtonTouch: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resetButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.3)',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },

  // Indicateur d'état
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

export default Stopwatch;
