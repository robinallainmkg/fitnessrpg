import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { rpgTheme, getRankColor } from '../theme/rpgTheme';
import firestore from '@react-native-firebase/firestore';

// Import des avatars disponibles
const AVATARS = {
  0: require('../../assets/avatars/avatar (1).jpg'),
  1: require('../../assets/avatars/avatar (2).jpg'),
  2: require('../../assets/avatars/avatar (3).jpg'),
  3: require('../../assets/avatars/avatar (4).jpg'),
  4: require('../../assets/avatars/avatar (5).jpg'),
  5: require('../../assets/avatars/avatar (6).jpg'),
};

/**
 * Header utilisateur avec avatar, niveau, XP et badge de titre
 * Design RPG/Manga avec bordure néon et glow effect
 */
const UserHeader = ({ 
  username = 'Utilisateur', 
  globalLevel = 0, 
  globalXP = 0, 
  title = 'Débutant', 
  avatarId = 0,
  streak = 0,
  userId = null,
  onUsernameUpdate = null,
  onPress = null, // Nouveau: callback quand on clique sur le header
  enableUsernameEdit = false // Nouveau: activer/désactiver l'édition du nom
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [saving, setSaving] = useState(false);

  const handleSaveUsername = async () => {
    if (!enableUsernameEdit) return; // Bloquer si édition désactivée
    
    if (!newUsername.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide');
      return;
    }

    if (newUsername.trim().length < 3) {
      Alert.alert('Erreur', 'Le nom doit contenir au moins 3 caractères');
      return;
    }

    if (newUsername.trim().length > 20) {
      Alert.alert('Erreur', 'Le nom ne peut pas dépasser 20 caractères');
      return;
    }

    try {
      setSaving(true);
      
      if (userId) {
        // Sauvegarder dans Firestore
        await firestore()
          .collection('users')
          .doc(userId)
          .update({ displayName: newUsername.trim() });
        
        console.log('✅ Username updated:', newUsername.trim());
      }

      // Callback pour mettre à jour l'état parent
      if (onUsernameUpdate) {
        onUsernameUpdate(newUsername.trim());
      }

      setModalVisible(false);
      Alert.alert('✅ Succès', 'Ton nom de guerrier a été mis à jour !');
    } catch (error) {
      console.error('❌ Error updating username:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le nom');
    } finally {
      setSaving(false);
    }
  };
  // Calcul de la progression XP vers le prochain niveau
  const xpForNextLevel = 100;
  const currentLevelXP = globalXP % xpForNextLevel;
  const progressPercent = (currentLevelXP / xpForNextLevel) * 100;
  
  // Récupérer la couleur du titre basée sur le rang
  const titleColor = getRankColor(title);
  
  // Sélectionner l'avatar (avec fallback sur avatar 0)
  const selectedAvatar = AVATARS[avatarId % Object.keys(AVATARS).length] || AVATARS[0];
  
  return (
    <TouchableOpacity 
      style={styles.wrapper}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.container}>
        {/* Avatar avec bordure néon et glow */}
        <View style={styles.avatarContainer}>
          <Image
            source={selectedAvatar}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
        
        {/* Info utilisateur (centre) */}
        <View style={styles.userInfo}>
          {enableUsernameEdit ? (
            <TouchableOpacity 
              onPress={() => {
                setNewUsername(username);
                setModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.username} numberOfLines={1}>{username}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.username} numberOfLines={1}>{username}</Text>
          )}
          
          {/* Badge de titre */}
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{title}</Text>
            </View>
          </View>
        </View>
        
        {/* Icône épée à droite */}
        <View style={styles.swordContainer}>
          <Text style={styles.swordIcon}>⚔️</Text>
        </View>
      </View>
      
      {/* Barre XP pleine largeur en dessous */}
      <View style={styles.xpBarContainer}>
        <View style={styles.xpBarBackground}>
          <View 
            style={[
              styles.xpBarFill, 
              { width: `${progressPercent}%` }
            ]} 
          />
        </View>
        <View style={styles.xpInfoRow}>
          <Text style={styles.level}>Niveau {globalLevel}</Text>
          <Text style={styles.xpText}>
            {currentLevelXP} / {xpForNextLevel} XP
          </Text>
        </View>
      </View>

      {/* Modal d'édition du nom */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚔️ Nom de Guerrier</Text>
            <Text style={styles.modalSubtitle}>
              Choisis ton nom de légende (3-20 caractères)
            </Text>
            
            <TextInput
              style={styles.input}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Ton nom..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              maxLength={20}
              autoFocus
              editable={!saving}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveUsername}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? '...' : 'Valider'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: rpgTheme.spacing.md,
    marginTop: 60, // Augmenté encore de 20px
    marginBottom: rpgTheme.spacing.sm,
  },
  
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
    padding: rpgTheme.spacing.sm, // Réduit le padding interne
    marginBottom: rpgTheme.spacing.xs,
  },
  
  avatarContainer: {
    width: 80, // Réduit de 100 à 80
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: rpgTheme.colors.neon.blue,
    padding: 3,
    marginRight: rpgTheme.spacing.md,
    // Glow effect
    shadowColor: rpgTheme.colors.neon.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 37, // Ajusté pour correspondre au nouveau rayon
  },
  
  userInfo: {
    flex: 1,
  },
  
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  
  editIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  
  badgeContainer: {
    marginBottom: 4,
  },
  
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(158, 158, 158, 0.25)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(158, 158, 158, 0.5)',
  },
  
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(200, 200, 200, 0.9)',
  },
  
  swordContainer: {
    marginLeft: rpgTheme.spacing.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  swordIcon: {
    fontSize: 28,
  },
  
  
  
  xpBarBackground: {
    height: 18,
    backgroundColor: 'rgba(26, 34, 68, 0.9)',
    borderRadius: 9,
    overflow: 'hidden',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.3)',
  },
  
  xpBarFill: {
    height: '100%',
    backgroundColor: rpgTheme.colors.neon.blue,
    borderRadius: 9,
    // Effet de dégradé lumineux (simulé avec shadow)
    shadowColor: rpgTheme.colors.neon.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  
  xpInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  level: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  xpText: {
    fontSize: 11,
    color: 'rgba(200, 200, 200, 0.8)',
  },
  
  // Styles du modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  modalContent: {
    backgroundColor: '#1A2244',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.blue,
    shadowColor: rpgTheme.colors.neon.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.3)',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  saveButton: {
    backgroundColor: rpgTheme.colors.neon.blue,
    shadowColor: rpgTheme.colors.neon.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default UserHeader;
