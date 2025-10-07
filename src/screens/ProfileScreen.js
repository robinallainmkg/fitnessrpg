import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import {
  Card,
  Text,
  Button
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import SignupModal from '../components/SignupModal';
import { colors } from '../theme/colors';
import { rpgTheme } from '../theme/rpgTheme';
import firestore from '@react-native-firebase/firestore';

const ProfileScreen = ({ navigation }) => {
  const { user, isGuest, logout, resetUserData, loading: authLoading } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  useEffect(() => {
    console.log('🔍 ProfileScreen - Vérification des fonctions:', {
      logoutExists: !!logout,
      resetUserDataExists: !!resetUserData,
      userExists: !!user,
      isGuest: isGuest,
      authLoading: authLoading
    });
  }, []);

  useEffect(() => {
    console.log('🔄 ProfileScreen useEffect - user:', user?.email, 'isGuest:', isGuest);
    
    if (user?.uid && !isGuest) {
      console.log('→ Chargement des stats utilisateur authentifié');
      loadUserStats();
    } else if (isGuest) {
      // Mode invité - pas de stats à charger
      console.log('→ Mode invité détecté - initialisation stats par défaut');
      setUserStats({
        stats: { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
        globalXP: 0,
        globalLevel: 0,
        title: 'Invité',
        programs: {},
      });
      setLoadingStats(false);
    } else {
      console.log('→ Aucun utilisateur - pas de stats');
      setLoadingStats(false);
    }
  }, [user, isGuest]);

  const loadUserStats = async () => {
    if (!user?.uid) {
      console.warn('⚠️ loadUserStats appelé sans user.uid');
      setLoadingStats(false);
      return;
    }
    
    try {
      setLoadingStats(true);
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        
        // Structure pour utilisateur migré
        if (userData.migrationVersion) {
          setUserStats({
            stats: userData.stats || { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
            globalXP: userData.globalXP || 0,
            globalLevel: userData.globalLevel || 0,
            title: userData.title || 'Débutant',
            programs: userData.programs || {},
          });
        } else {
          // Legacy structure
          const totalXP = userData.totalXP || 0;
          const globalLevel = Math.floor(Math.sqrt(totalXP / 100));
          
          setUserStats({
            stats: { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
            globalXP: totalXP,
            globalLevel: globalLevel,
            title: getTitleFromLevel(globalLevel),
            programs: {},
          });
        }
      } else {
        // Nouvel utilisateur
        setUserStats({
          stats: { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
          globalXP: 0,
          globalLevel: 0,
          title: 'Débutant',
          programs: {},
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement stats ProfileScreen:', error);
      
      // Mode dégradé : continuer avec données par défaut
      if (error.code === 'firestore/unavailable') {
        console.warn('⚠️ ProfileScreen en mode dégradé - Firestore indisponible');
        setUserStats({
          stats: { strength: 0, endurance: 0, power: 0, speed: 0, flexibility: 0 },
          globalXP: 0,
          globalLevel: 0,
          title: 'Débutant',
          programs: {},
        });
      }
      // Ne pas afficher d'alerte pour éviter de spammer l'utilisateur
    } finally {
      setLoadingStats(false);
    }
  };

  const getTitleFromLevel = (level) => {
    if (level >= 20) return "Légende";
    if (level >= 12) return "Maître";
    if (level >= 7) return "Champion";
    if (level >= 4) return "Expert";
    if (level >= 2) return "Apprenti";
    return "Débutant";
  };

  const handleLogout = async () => {
    console.log('🔘 handleLogout appelé');
    console.log('🔍 logout function exists?', !!logout);
    console.log('🔍 isGuest:', isGuest);
    
    // Confirmation avec Alert.alert pour React Native
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          onPress: () => console.log('❌ Déconnexion annulée'),
          style: 'cancel'
        },
        {
          text: 'Se déconnecter',
          onPress: async () => {
            await performLogout();
          },
          style: 'destructive'
        }
      ]
    );
  };

  const performLogout = async () => {
    try {
      console.log('📤 Tentative de déconnexion...');
      
      // Afficher un message de chargement
      setLoadingStats(true);
      
      const result = await logout();
      console.log('📤 Résultat logout:', result);
      
      if (result.success) {
        console.log('✅ Déconnexion réussie - Rechargement automatique');
        
        // Recharger l'app automatiquement sans popup
        if (typeof window !== 'undefined' && window.location) {
          window.location.reload();
        }
        // Sur mobile, l'app se recharge automatiquement via onAuthStateChanged
      } else {
        setLoadingStats(false);
        Alert.alert('Erreur', result.error || 'Impossible de vous déconnecter');
      }
    } catch (error) {
      setLoadingStats(false);
      console.error('❌ Erreur déconnexion:', error);
      Alert.alert('Erreur', 'Impossible de vous déconnecter');
    }
  };

  const handleResetProfile = async () => {
    console.log('🔘 handleResetProfile appelé');
    console.log('🔍 resetUserData function exists?', !!resetUserData);
    console.log('🔍 isGuest:', isGuest);
    
    // Confirmation avec Alert.alert pour React Native
    Alert.alert(
      '⚠️ ATTENTION',
      'Cette action va supprimer TOUTES vos données:\n• Progression\n• XP et niveaux\n• Statistiques\n• Séances complétées\n\nVous serez redirigé vers l\'onboarding.\n\nCette action est IRRÉVERSIBLE!\n\nÊtes-vous vraiment sûr ?',
      [
        {
          text: 'Annuler',
          onPress: () => console.log('❌ Reset annulé'),
          style: 'cancel'
        },
        {
          text: 'Réinitialiser',
          onPress: async () => {
            await performReset();
          },
          style: 'destructive'
        }
      ]
    );
  };

  const performReset = async () => {
    try {
      console.log('🔄 Tentative de réinitialisation...');
      
      setLoadingStats(true);
      
      // 1. Supprimer les données (Firestore + AsyncStorage)
      const result = await resetUserData();
      console.log('🔄 Résultat reset:', result);
      
      if (result.success) {
        console.log('✅ Reset réussi');
        
        // 2. Déconnecter l'utilisateur
        const logoutResult = await logout();
        console.log('🔄 Résultat logout:', logoutResult);
        
        if (logoutResult.success) {
          console.log('✅ Profil réinitialisé! Rechargement automatique...');
          
          // Recharger l'app automatiquement sans popup
          if (typeof window !== 'undefined' && window.location) {
            window.location.reload();
          }
          // Sur mobile, l'app se recharge automatiquement via onAuthStateChanged
        } else {
          setLoadingStats(false);
          Alert.alert('Erreur', 'Erreur lors de la déconnexion: ' + (logoutResult.error || 'Erreur inconnue'));
        }
      } else {
        setLoadingStats(false);
        console.error('❌ Reset échoué:', result.error);
        Alert.alert('Erreur', result.error || 'Impossible de réinitialiser le profil');
      }
    } catch (error) {
      setLoadingStats(false);
      console.error('❌ Erreur reset:', error);
      Alert.alert('Erreur', error.message);
    }
  };

  if (authLoading || loadingStats) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profil utilisateur */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {isGuest ? '👤' : (user?.email?.charAt(0).toUpperCase() || '?')}
            </Text>
          </View>
          
          <Text style={styles.userName}>
            {isGuest ? 'Invité' : (user?.displayName || 'Utilisateur')}
          </Text>
          
          <Text style={styles.userEmail}>
            {isGuest ? 'Mode invité' : user?.email}
          </Text>
          
          <Text style={styles.memberSince}>
            {isGuest ? 'Session temporaire' : `Membre depuis ${formatJoinDate(user?.metadata?.creationTime)}`}
          </Text>
        </Card.Content>
      </Card>

      {/* Reset Profile */}
      <View style={styles.resetCard}>
        <View style={styles.resetContent}>
          <Text style={styles.warningTitle}>⚠️ Zone de danger</Text>
          <Text style={styles.warningDescription}>
            Réinitialiser votre profil supprimera toutes vos données de manière irréversible.
          </Text>
          
          <TouchableOpacity 
            onPress={handleResetProfile}
            style={styles.resetButton}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>🔄 Réinitialiser le profil</Text>
          </TouchableOpacity>
          
          {/* Bouton Debug Firestore (DEV uniquement) */}
          {__DEV__ && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('FirestoreDiagnostic')}
              style={[styles.resetButton, { backgroundColor: '#EF4444', marginTop: 12 }]}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>🔍 Diagnostic Firestore</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Déconnexion ou Créer un compte (pour invités) */}
      {isGuest ? (
        <View style={styles.logoutCard}>
          <View style={styles.guestWarning}>
            <Text style={styles.guestWarningIcon}>⚠️</Text>
            <View style={styles.guestWarningText}>
              <Text style={styles.guestWarningTitle}>Mode invité</Text>
              <Text style={styles.guestWarningSubtitle}>
                Tes données ne sont pas sauvegardées de façon permanente
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => setShowSignupModal(true)}
            style={styles.createAccountButton}
            activeOpacity={0.7}
          >
            <Text style={styles.createAccountButtonText}>✨ Créer mon compte</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.logoutCard}>
          <View style={styles.logoutContent}>
            <TouchableOpacity 
              onPress={handleLogout}
              style={styles.logoutButton}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutButtonText}>🚪 Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>

    {/* Signup Modal pour invités */}
    <SignupModal
      visible={showSignupModal}
      onClose={() => setShowSignupModal(false)}
      onSuccess={() => {
        setShowSignupModal(false);
        // Recharger les stats après création de compte
        if (user?.uid) {
          loadUserStats();
        }
      }}
    />
    </>
  );
};

const formatJoinDate = (timestamp) => {
  if (!timestamp) return 'récemment';
  
  const date = new Date(timestamp);
  const options = { month: 'long', year: 'numeric' };
  return date.toLocaleDateString('fr-FR', options);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: rpgTheme.colors.background.primary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: rpgTheme.spacing.md,
  },
  profileCard: {
    backgroundColor: rpgTheme.colors.background.card,
    marginBottom: rpgTheme.spacing.md,
    borderRadius: rpgTheme.borderRadius.lg,
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.blue + '40',
    ...rpgTheme.effects.shadows.card,
  },
  profileContent: {
    alignItems: 'center',
    padding: rpgTheme.spacing.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: rpgTheme.colors.neon.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rpgTheme.spacing.md,
    borderWidth: 3,
    borderColor: rpgTheme.colors.neon.blue,
    ...rpgTheme.effects.shadows.glow,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.text.primary,
  },
  userName: {
    fontSize: rpgTheme.typography.sizes.heading,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: rpgTheme.typography.sizes.body,
    color: rpgTheme.colors.text.secondary,
    marginBottom: rpgTheme.spacing.sm,
  },
  memberSince: {
    fontSize: rpgTheme.typography.sizes.caption,
    color: rpgTheme.colors.text.muted,
    fontStyle: 'italic',
  },
  resetCard: {
    backgroundColor: rpgTheme.colors.background.card,
    marginBottom: rpgTheme.spacing.md,
    borderRadius: rpgTheme.borderRadius.lg,
    borderWidth: 2,
    borderColor: rpgTheme.colors.status.error + '60',
    shadowColor: rpgTheme.colors.status.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resetContent: {
    padding: rpgTheme.spacing.lg,
  },
  warningTitle: {
    fontSize: rpgTheme.typography.sizes.subheading,
    fontWeight: rpgTheme.typography.weights.bold,
    color: rpgTheme.colors.status.error,
    marginBottom: rpgTheme.spacing.sm,
  },
  warningDescription: {
    fontSize: rpgTheme.typography.sizes.caption,
    color: rpgTheme.colors.text.secondary,
    marginBottom: rpgTheme.spacing.md,
    lineHeight: 18,
  },
  resetButton: {
    marginTop: rpgTheme.spacing.sm,
    backgroundColor: rpgTheme.colors.status.error,
    paddingVertical: 14,
    paddingHorizontal: rpgTheme.spacing.lg,
    borderRadius: rpgTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: rpgTheme.colors.status.error,
    shadowColor: rpgTheme.colors.status.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  testButton: {
    marginTop: rpgTheme.spacing.md,
    backgroundColor: '#7B61FF', // Violet
    paddingVertical: 14,
    paddingHorizontal: rpgTheme.spacing.lg,
    borderRadius: rpgTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: '#7B61FF',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  testButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  logoutCard: {
    backgroundColor: rpgTheme.colors.background.card,
    marginBottom: rpgTheme.spacing.xxl,
    borderRadius: rpgTheme.borderRadius.lg,
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.blue + '40',
    shadowColor: rpgTheme.colors.neon.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutContent: {
    padding: rpgTheme.spacing.lg,
  },
  logoutButton: {
    backgroundColor: rpgTheme.colors.neon.blue,
    paddingVertical: 14,
    paddingHorizontal: rpgTheme.spacing.lg,
    borderRadius: rpgTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: rpgTheme.colors.neon.blue,
    shadowColor: rpgTheme.colors.neon.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  guestWarning: {
    flexDirection: 'row',
    padding: rpgTheme.spacing.lg,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
  },
  guestWarningIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  guestWarningText: {
    flex: 1,
  },
  guestWarningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FBBF24',
    marginBottom: 4,
  },
  guestWarningSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  createAccountButton: {
    margin: rpgTheme.spacing.lg,
    backgroundColor: '#7B61FF',
    paddingVertical: 16,
    paddingHorizontal: rpgTheme.spacing.lg,
    borderRadius: rpgTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: '#4D9EFF',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  createAccountButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;
