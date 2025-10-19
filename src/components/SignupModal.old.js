import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { rpgTheme } from '../theme/rpgTheme';

const SignupModal = ({ visible, onClose, onSuccess, guestData }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false); // Toggle entre signup et login
  const { convertGuestToUser, login, resetPassword } = useAuth();

  const handleResetPassword = async () => {
    // Validation de l'email uniquement
    if (!email) {
      Alert.alert('Email requis', 'Entrez votre email pour recevoir le lien de réinitialisation');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);

    try {
      console.log('🔑 Reset password pour:', email);
      const result = await resetPassword(email);
      
      if (result.success) {
        Alert.alert(
          'Email envoyé ! 📧',
          `Un lien de réinitialisation a été envoyé à ${email}.\n\nVérifiez votre boîte de réception (et vos spams).`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erreur', result.error || 'Impossible d\'envoyer l\'email');
      }
    } catch (error) {
      console.error('❌ Erreur reset password:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert('Erreur', 'Email et mot de passe requis');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Email invalide');
      return;
    }

    setLoading(true);

    try {
      let result;
      
      if (isLoginMode) {
        // Mode connexion
        console.log('🔐 Connexion en cours...');
        result = await login(email, password);
        
        if (result.success) {
          console.log('✅ Connexion réussie - fermeture modal');
          // Fermer directement sans popup
          onSuccess();
          onClose();
        } else {
          Alert.alert('Erreur de connexion', result.error || 'Impossible de se connecter');
        }
      } else {
        // Mode création de compte
        console.log('📝 Création de compte...');
        result = await convertGuestToUser(email, password);
      
        if (result.success) {
          console.log('✅ Compte créé avec succès - fermeture modal');
          // Fermer directement sans popup
          onSuccess();
          onClose();
        } else {
          // Cas spécial : email déjà utilisé
          if (result.code === 'auth/email-already-in-use') {
            Alert.alert(
              'Email déjà utilisé',
              `Un compte existe déjà avec l'email ${email}.\n\nUtilisez le bouton "Déjà un compte ?" ci-dessous pour vous connecter.`,
              [
                {
                  text: 'Modifier mon email',
                  style: 'cancel',
                  onPress: () => {
                    setEmail('');
                    setPassword('');
                  }
                },
                {
                  text: 'Me connecter',
                  onPress: () => {
                    setIsLoginMode(true);
                  }
                }
              ]
            );
          } else {
            Alert.alert('Erreur', result.error || 'Impossible de créer le compte');
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur signup modal:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler la création de compte ?',
      'Tu peux continuer en mode invité, mais tes données ne seront pas sauvegardées.',
      [
        { text: 'Continuer en mode invité', onPress: onClose },
        { text: 'Créer mon compte', style: 'cancel' }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <LinearGradient
              colors={['#7B61FF', '#4D9EFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHeader}
            >
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.modalTitle}>
                    {isLoginMode ? '🔐 Connexion' : 'Sauvegarde ta progression'}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {isLoginMode 
                      ? 'Connecte-toi avec ton compte existant'
                      : 'Crée un compte pour ne jamais perdre tes données'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={styles.closeButton}
                  disabled={loading}
                >
                  <X size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView
              style={styles.formContainer}
              keyboardShouldPersistTaps="handled"
            >

              {/* Form Fields */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ton.email@exemple.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mot de passe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 caractères"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              {/* Bouton Mot de passe oublié - visible uniquement en mode login */}
              {isLoginMode && (
                <TouchableOpacity
                  style={styles.forgotPasswordButton}
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>
                    🔑 Mot de passe oublié ?
                  </Text>
                </TouchableOpacity>
              )}

              {/* Action Buttons */}
              <TouchableOpacity
                style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ['#64748B', '#64748B'] : ['#7B61FF', '#4D9EFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.signupButtonText}>
                    {loading 
                      ? (isLoginMode ? 'Connexion...' : 'Création en cours...') 
                      : (isLoginMode ? 'Se connecter' : 'Créer mon compte')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Toggle entre Signup et Login */}
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => {
                  setIsLoginMode(!isLoginMode);
                }}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.toggleButtonText}>
                  {isLoginMode 
                    ? 'Pas encore de compte ? Créer un compte' 
                    : 'Déjà un compte ? Se connecter'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={loading}
                activeOpacity={0.7}
              >
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(77, 158, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.2)',
  },
  infoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.2)',
  },
  forgotPasswordButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4D9EFF',
    textDecorationLine: 'underline',
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  toggleButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(77, 158, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.3)',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4D9EFF',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'underline',
  },
});

export default SignupModal;
