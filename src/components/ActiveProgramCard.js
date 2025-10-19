import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { rpgTheme } from '../theme/rpgTheme';

// Mapping des images de programmes
const PROGRAM_IMAGES = {
  'assets/programmes/StreetWorkout.jpg': require('../../assets/programmes/StreetWorkout.jpg'),
  'assets/programmes/running-5.jpg': require('../../assets/programmes/running-5.jpg'),
};

/**
 * Carte d'affichage d'un programme actif avec image de fond immersive
 * Style RPG/Manga avec overlay gradient et bordure néon
 */
const ActiveProgramCard = ({ program, onPress, onManage }) => {
  const { name, icon, color, status = 'active', completedSkills = 0, totalSkills = 0, backgroundImage } = program;
  
  const progress = totalSkills > 0 ? completedSkills / totalSkills : 0;
  const progressPercent = Math.round(progress * 100);
  const isCompleted = completedSkills >= totalSkills && totalSkills > 0;

  // ⭐ CORRECTION: Utiliser l'image du programme ou fallback
  const imageSource = backgroundImage && PROGRAM_IMAGES[backgroundImage] 
    ? PROGRAM_IMAGES[backgroundImage]
    : require('../../assets/programmes/StreetWorkout.jpg');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.cardContainer}>
      <ImageBackground
        source={imageSource}
        style={styles.card}
        imageStyle={styles.cardImage}
      >
        {/* Overlay gradient du haut vers le bas - image visible en haut, sombre en bas */}
        <LinearGradient
          colors={[
            'rgba(10, 14, 39, 0.00)',  // Complètement transparent en haut
            'rgba(10, 14, 39, 0.20)',  // Très léger
            'rgba(10, 14, 39, 0.60)',  // Transition
            'rgba(10, 14, 39, 0.90)'   // Opaque en bas pour texte lisible
          ]}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.overlay}
        />
        
        <View style={styles.content}>
          {/* Tout le contenu est poussé vers le bas */}
          <View style={styles.bottomContent}>
            {/* Titre du programme - gros et bold */}
            <Text style={styles.programName} numberOfLines={1}>{name}</Text>
            
            {/* Progression en texte */}
            {totalSkills > 0 && (
              <Text style={styles.skillsProgress}>
                {completedSkills} / {totalSkills} compétences
              </Text>
            )}
            
            {/* Bouton voir l'arbre */}
            <Button
              mode="contained"
              onPress={onPress}
              style={styles.viewButton}
              buttonColor={rpgTheme.colors.neon.blue}
              compact
              icon="tree"
            >
              Voir l'arbre
            </Button>
            
            {/* Badge Actif/Terminé en bas */}
            <View style={[
              styles.statusBadge,
              { 
                backgroundColor: isCompleted 
                  ? rpgTheme.colors.status.completed + '30' 
                  : rpgTheme.colors.status.active + '30',
                borderColor: isCompleted 
                  ? rpgTheme.colors.status.completed 
                  : rpgTheme.colors.status.active,
              }
            ]}>
              <Text style={styles.badgeEmoji}>
                {isCompleted ? '✅' : '🔥'}
              </Text>
              <Text style={[
                styles.badgeText,
                { color: isCompleted ? rpgTheme.colors.status.completed : rpgTheme.colors.status.active }
              ]}>
                {isCompleted ? 'Terminé' : 'Actif'}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: rpgTheme.spacing.md,
    marginBottom: rpgTheme.spacing.md,
  },
  
  card: {
    height: 240,
    borderRadius: rpgTheme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.blue,
    ...rpgTheme.effects.shadows.card,
  },
  
  cardImage: {
    borderRadius: rpgTheme.borderRadius.lg - 2,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  
  content: {
    flex: 1,
    justifyContent: 'flex-end', // Tout en bas
    padding: rpgTheme.spacing.md,
    paddingBottom: rpgTheme.spacing.lg,
  },
  
  bottomContent: {
    // Contenu regroupé en bas
  },
  
  icon: {
    fontSize: 40,
    marginBottom: rpgTheme.spacing.sm,
  },
  
  programName: {
    fontSize: 26,
    fontWeight: '700',
    color: rpgTheme.colors.text.primary,
    marginBottom: 6,
    lineHeight: 30,
  },
  
  skillsProgress: {
    fontSize: 14,
    color: rpgTheme.colors.text.secondary,
    marginBottom: rpgTheme.spacing.sm,
    fontWeight: rpgTheme.typography.weights.medium,
  },
  
  viewButton: {
    marginVertical: rpgTheme.spacing.sm,
    borderRadius: rpgTheme.borderRadius.md,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: rpgTheme.borderRadius.md,
    borderWidth: 2, // Bordure plus épaisse
    marginTop: rpgTheme.spacing.sm,
  },
  
  badgeEmoji: {
    fontSize: 18,
  },
  
  badgeText: {
    fontSize: rpgTheme.typography.sizes.body, // Plus gros
    fontWeight: rpgTheme.typography.weights.bold, // Plus bold
  },
});

export default ActiveProgramCard;
