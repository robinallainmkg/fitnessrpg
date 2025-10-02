import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Chip, ProgressBar } from 'react-native-paper';
import { colors } from '../theme/colors';

const UserHeader = ({ 
  username = 'Utilisateur', 
  globalLevel = 0, 
  globalXP = 0, 
  title = 'Débutant',
  streak = 0 
}) => {
  // Calcul de l'XP nécessaire pour le prochain niveau
  const nextLevelXP = Math.pow(globalLevel + 1, 2) * 100;
  
  // XP minimum pour le niveau actuel
  const currentLevelXP = Math.pow(globalLevel, 2) * 100;
  
  // Progression vers le prochain niveau
  const progressXP = globalXP - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const progress = Math.min(Math.max(progressXP / neededXP, 0), 1);

  // Génération des initiales pour l'avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Couleur du titre selon le niveau
  const getTitleColor = (level) => {
    if (level >= 20) return '#FFD700'; // Or - Légende
    if (level >= 12) return '#C0C0C0'; // Argent - Maître
    if (level >= 7) return '#CD7F32';  // Bronze - Champion
    if (level >= 3) return '#4CAF50';  // Vert - Guerrier
    return '#9E9E9E'; // Gris - Débutant
  };

  return (
    <Card style={styles.headerCard}>
      <View style={[styles.gradientContainer, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          {/* Avatar et informations principales */}
          <View style={styles.mainInfo}>
            {/* Avatar */}
            <View style={[styles.avatar, { borderColor: colors.surface }]}>
              <Text style={styles.avatarText}>
                {getInitials(username)}
              </Text>
            </View>

            {/* Informations utilisateur */}
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.username} numberOfLines={1}>
                  {username}
                </Text>
                
                {/* Badge streak si > 0 */}
                {streak > 0 && (
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>🔥{streak}</Text>
                  </View>
                )}
              </View>

              {/* Titre avec couleur dynamique */}
              <Chip 
                mode="flat" 
                style={[styles.titleChip, { backgroundColor: getTitleColor(globalLevel) + '20' }]}
                textStyle={[styles.titleText, { color: getTitleColor(globalLevel) }]}
                compact
              >
                {title}
              </Chip>

              {/* Niveau global */}
              <Text style={styles.levelText}>
                Niveau {globalLevel}
              </Text>

              {/* Barre de progression vers prochain niveau */}
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={progress}
                  color={colors.surface}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {progressXP.toLocaleString()} / {neededXP.toLocaleString()} XP
                </Text>
              </View>
            </View>
          </View>

          {/* Informations secondaires */}
          <View style={styles.secondaryInfo}>
            <View style={styles.xpContainer}>
              <Text style={styles.xpLabel}>XP Total</Text>
              <Text style={styles.xpValue}>
                {globalXP.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientContainer: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.surface,
    flex: 1,
  },
  streakBadge: {
    backgroundColor: colors.surface + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.surface,
  },
  titleChip: {
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.surface + '30',
  },
  titleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface + '30',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.surface + 'DD',
    textAlign: 'right',
  },
  secondaryInfo: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  xpContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surface + '30',
  },
  xpLabel: {
    fontSize: 11,
    color: colors.surface + 'AA',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.surface,
  },
});

export default UserHeader;
