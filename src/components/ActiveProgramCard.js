import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, ProgressBar, Chip } from 'react-native-paper';
import { colors } from '../theme/colors';

/**
 * Carte d'affichage d'un programme actif
 * Affiche le nom, l'icône et le statut du programme
 */
const ActiveProgramCard = ({ program, onPress, onManage }) => {
  const { name, icon, color, status = 'active', completedSkills = 0, totalSkills = 0 } = program;
  
  const progress = totalSkills > 0 ? completedSkills / totalSkills : 0;
  const isCompleted = completedSkills >= totalSkills && totalSkills > 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card 
        style={[
          styles.card,
          { borderLeftColor: color || colors.primary, borderLeftWidth: 4 }
        ]}
      >
        <Card.Content style={styles.content}>
          {/* En-tête */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.icon}>{icon}</Text>
              <View style={styles.titleContainer}>
                <Text style={styles.programName} numberOfLines={1}>
                  {name}
                </Text>
                {totalSkills > 0 && (
                  <Text style={styles.skillsInfo}>
                    {completedSkills} / {totalSkills} compétences
                  </Text>
                )}
              </View>
            </View>
            
            {/* Badge de statut */}
            <Chip 
              mode="flat"
              style={[
                styles.statusChip,
                { 
                  backgroundColor: isCompleted 
                    ? colors.success + '20' 
                    : status === 'active' 
                      ? colors.primary + '20' 
                      : colors.border + '20'
                }
              ]}
              textStyle={styles.statusText}
            >
              {isCompleted ? '✅ Terminé' : '🔥 Actif'}
            </Chip>
          </View>

          {/* Barre de progression (compétences) */}
          {totalSkills > 0 && (
            <View style={styles.progressSection}>
              <ProgressBar
                progress={progress}
                color={isCompleted ? colors.success : color || colors.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {Math.round(progress * 100)}% complété
              </Text>
            </View>
          )}

          {/* Actions */}
          {onManage && (
            <TouchableOpacity 
              onPress={onManage}
              style={styles.manageButton}
            >
              <Text style={styles.manageText}>Gérer ⚙️</Text>
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: colors.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  programName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  skillsInfo: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border + '40',
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'right',
  },
  manageButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.border + '20',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  manageText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default ActiveProgramCard;
