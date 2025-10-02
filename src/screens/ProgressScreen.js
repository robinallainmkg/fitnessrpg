import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import {
  Card,
  Text,
  ActivityIndicator
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

const ProgressScreen = () => {
  const [workoutSessions, setWorkoutSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadWorkoutSessions();
  }, [user]);

  const loadWorkoutSessions = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      console.log('📊 MOCK: Chargement sessions workout...');
      
      // Mock workout sessions
      const sessions = [
        {
          id: 'session1',
          userId: user.uid,
          programId: 'pull-up-basics',
          levelId: 'level-1',
          score: 75,
          xp: 100,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Il y a 7 jours
        },
        {
          id: 'session2',
          userId: user.uid,
          programId: 'pull-up-basics',
          levelId: 'level-1',
          score: 85,
          xp: 120,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Il y a 3 jours
        },
        {
          id: 'session3',
          userId: user.uid,
          programId: 'muscle-up-prep',
          levelId: 'level-1',
          score: 70,
          xp: 90,
          createdAt: new Date() // Aujourd'hui
        }
      ];

      setWorkoutSessions(sessions);
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (workoutSessions.length === 0) {
      return {
        totalSessions: 0,
        bestScore: 0,
        averageScore: 0,
        currentStreak: 0
      };
    }

    const totalSessions = workoutSessions.length;
    const scores = workoutSessions.map(session => session.score);
    const bestScore = Math.max(...scores);
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

    // Calcul simple du streak (jours consécutifs avec au moins une séance)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let checkDate = new Date(today);

    for (let i = 0; i < 30; i++) { // Vérifier les 30 derniers jours max
      const hasSessionThisDay = workoutSessions.some(session => {
        const sessionDate = new Date(session.createdAt);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime();
      });

      if (hasSessionThisDay) {
        currentStreak++;
      } else if (currentStreak > 0) {
        break; // Stop si on a déjà un streak et qu'on trouve un jour sans séance
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      totalSessions,
      bestScore,
      averageScore,
      currentStreak
    };
  };

  const prepareChartData = () => {
    if (workoutSessions.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: []
        }]
      };
    }

    const labels = workoutSessions.map(session => {
      const date = new Date(session.createdAt);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const data = workoutSessions.map(session => session.score);

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(176, 176, 176, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary
    }
  };

  const stats = calculateStats();
  const chartData = prepareChartData();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de vos statistiques...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Vos Statistiques</Text>

      {/* Stats globales */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statIcon}>🏋️</Text>
            <Text style={styles.statValue}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Séances</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{stats.bestScore}</Text>
            <Text style={styles.statLabel}>Meilleur score</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{stats.averageScore}</Text>
            <Text style={styles.statLabel}>Moyenne</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Streak (jours)</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Graphique */}
      <Card style={styles.chartCard}>
        <Card.Content style={styles.chartContent}>
          <Text style={styles.chartTitle}>Évolution du score</Text>
          
          {workoutSessions.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataIcon}>📈</Text>
              <Text style={styles.noDataTitle}>Aucune donnée</Text>
              <Text style={styles.noDataMessage}>
                Complète ta première séance pour voir tes stats !
              </Text>
            </View>
          ) : (
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={screenWidth - 72} // padding des cartes
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={false}
                withDots={true}
                withShadow={false}
              />
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Historique récent */}
      {workoutSessions.length > 0 && (
        <Card style={styles.historyCard}>
          <Card.Content style={styles.historyContent}>
            <Text style={styles.historyTitle}>Séances récentes</Text>
            
            {workoutSessions.slice(-5).reverse().map((session, index) => (
              <View key={session.id} style={styles.sessionRow}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionProgram}>
                    {getProgramName(session.programId)} - Niveau {session.levelId}
                  </Text>
                  <Text style={styles.sessionDate}>
                    {formatDate(session.createdAt)}
                  </Text>
                </View>
                
                <View style={styles.sessionScore}>
                  <Text style={[
                    styles.sessionScoreValue,
                    { color: getScoreColor(session.score) }
                  ]}>
                    {session.score}
                  </Text>
                  <Text style={styles.sessionScoreLabel}>pts</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const getProgramName = (programId) => {
  switch (programId) {
    case 'muscleup':
      return 'Muscle-Up';
    default:
      return 'Programme';
  }
};

const formatDate = (date) => {
  const options = { 
    day: 'numeric', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return date.toLocaleDateString('fr-FR', options);
};

const getScoreColor = (score) => {
  if (score >= 900) return colors.success;
  if (score >= 800) return colors.warning;
  return colors.error;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.surface,
    flex: 1,
    minWidth: '45%',
    elevation: 4,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: colors.surface,
    marginBottom: 24,
    elevation: 4,
  },
  chartContent: {
    padding: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  noDataMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  historyCard: {
    backgroundColor: colors.surface,
    elevation: 4,
  },
  historyContent: {
    padding: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionProgram: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sessionScore: {
    alignItems: 'flex-end',
  },
  sessionScoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sessionScoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ProgressScreen;
