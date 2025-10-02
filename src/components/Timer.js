import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
import { colors } from '../theme/colors';

const Timer = ({ duration, onComplete, onSkip }) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setTimeRemaining(duration);
    setIsActive(true);
  }, [duration]);

  useEffect(() => {
    let interval = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsActive(false);
            onComplete && onComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (timeRemaining <= 5) return colors.error;
    if (timeRemaining <= 10) return colors.warning;
    return colors.primary;
  };

  const progress = duration > 0 ? (duration - timeRemaining) / duration : 0;

  return (
    <View style={styles.container}>
      <View style={styles.timerCircle}>
        <Text style={[styles.timeText, { color: getProgressColor() }]}>
          {formatTime(timeRemaining)}
        </Text>
      </View>

      <ProgressBar 
        progress={progress}
        color={getProgressColor()}
        style={styles.progressBar}
      />

      {timeRemaining <= 5 && timeRemaining > 0 && (
        <View style={styles.urgentContainer}>
          <Text style={styles.urgentText}>
            Préparez-vous ! ⚡
          </Text>
        </View>
      )}

      <View style={styles.controls}>
        {onSkip && timeRemaining > 0 && (
          <Button
            mode="outlined"
            onPress={() => {
              setIsActive(false);
              onSkip();
            }}
            style={styles.skipButton}
            labelStyle={{ color: colors.textSecondary }}
          >
            Passer le repos
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  progressBar: {
    width: 250,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  controls: {
    alignItems: 'center',
    marginTop: 8,
  },
  skipButton: {
    borderColor: colors.border,
  },
  urgentContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: colors.error + '20',
    borderRadius: 8,
  },
  urgentText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Timer;
