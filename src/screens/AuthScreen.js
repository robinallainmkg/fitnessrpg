import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ImageBackground,
  TouchableOpacity
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
  ActivityIndicator
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { signup, login, resetPassword } = useAuth();

  const validateForm = () => {
    if (!email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = isLogin 
        ? await login(email, password)
        : await signup(email, password);

      if (!result.success) {
        // Cas spécial : email déjà utilisé
        if (result.code === 'auth/email-already-in-use') {
          Alert.alert(
            'Email déjà utilisé',
            `Un compte existe déjà avec l'email ${email}.\n\nVoulez-vous vous connecter à la place ?`,
            [
              {
                text: 'Modifier mon email',
                style: 'cancel',
                onPress: () => {
                  // L'utilisateur reste sur le formulaire pour changer son email
                  setPassword(''); // On efface le mot de passe par sécurité
                }
              },
              {
                text: 'Me connecter',
                onPress: () => {
                  // Basculer en mode connexion
                  setIsLogin(true);
                  // Le mot de passe est déjà rempli
                }
              }
            ]
          );
        } else {
          // Autres erreurs
          Alert.alert('Erreur', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
  };

  const handleResetPassword = async () => {
    if (!resetEmail.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setResetLoading(true);
    try {
      const result = await resetPassword(resetEmail);
      if (result.success) {
        Alert.alert(
          '✅ Succès',
          result.message + '\n\nConsulte ta boîte mail pour créer un nouveau mot de passe.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowResetPassword(false);
                setResetEmail('');
              }
            }
          ]
        );
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/Home-BG-2.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header avec style gaming */}
            <View style={styles.header}>
              <Text style={styles.logo}>⚔️</Text>
              <Text style={styles.title}>FITNESSRPG</Text>
              <Text style={styles.subtitle}>
                Transforme tes entraînements en quête épique
              </Text>
            </View>

            {/* Form Card avec effet néon */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <TouchableOpacity
                  style={[styles.modeTab, isLogin && styles.modeTabActive]}
                  onPress={() => !loading && setIsLogin(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modeTabText, isLogin && styles.modeTabTextActive]}>
                    Connexion
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeTab, !isLogin && styles.modeTabActive]}
                  onPress={() => !loading && setIsLogin(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modeTabText, !isLogin && styles.modeTabTextActive]}>
                    Inscription
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>📧 Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    mode="flat"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="ton@email.com"
                    placeholderTextColor="rgba(148, 163, 184, 0.5)"
                    style={styles.input}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    theme={{
                      colors: {
                        text: '#FFFFFF',
                        placeholder: 'rgba(148, 163, 184, 0.5)',
                        primary: '#4D9EFF',
                        background: 'rgba(15, 23, 42, 0.8)'
                      }
                    }}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>🔒 Mot de passe</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    mode="flat"
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor="rgba(148, 163, 184, 0.5)"
                    style={styles.input}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    theme={{
                      colors: {
                        text: '#FFFFFF',
                        placeholder: 'rgba(148, 163, 184, 0.5)',
                        primary: '#4D9EFF',
                        background: 'rgba(15, 23, 42, 0.8)'
                      }
                    }}
                  />
                </View>

                {/* "Forgot password?" link - only shown in login mode */}
                {isLogin && (
                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={() => setShowResetPassword(true)}
                    disabled={loading}
                  >
                    <Text style={styles.forgotPasswordText}>🔑 Mot de passe oublié ?</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (loading || !email || !password) && styles.submitButtonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={loading || !email || !password}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isLogin ? '⚔️ Commencer l\'aventure' : '🚀 Créer mon compte'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={toggleMode}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.toggleButtonText}>
                    {isLogin 
                      ? '✨ Pas de compte ? Inscris-toi ici' 
                      : '✨ Déjà un compte ? Connecte-toi'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Info badge */}
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>
                💡 Rejoins la communauté et progresse vers tes objectifs !
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Reset Password Modal */}
      {showResetPassword && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowResetPassword(false);
                setResetEmail('');
              }}
              disabled={resetLoading}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>🔑 Réinitialiser mot de passe</Text>
            
            <Text style={styles.modalDescription}>
              Saisis ton email et tu recevras un lien pour créer un nouveau mot de passe.
            </Text>

            <TextInput
              value={resetEmail}
              onChangeText={setResetEmail}
              mode="flat"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="ton@email.com"
              placeholderTextColor="rgba(148, 163, 184, 0.5)"
              style={styles.modalInput}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{
                colors: {
                  text: '#FFFFFF',
                  placeholder: 'rgba(148, 163, 184, 0.5)',
                  primary: '#4D9EFF',
                  background: 'rgba(15, 23, 42, 0.8)'
                }
              }}
              editable={!resetLoading}
            />

            <TouchableOpacity
              style={[
                styles.resetButton,
                (resetLoading || !resetEmail) && styles.resetButtonDisabled
              ]}
              onPress={handleResetPassword}
              disabled={resetLoading || !resetEmail}
              activeOpacity={0.8}
            >
              {resetLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.resetButtonText}>Envoyer le lien</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowResetPassword(false);
                setResetEmail('');
              }}
              disabled={resetLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 72,
    marginBottom: 8,
    textShadowColor: '#4D9EFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textShadowColor: '#4D9EFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(77, 158, 255, 0.3)',
    overflow: 'hidden',
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77, 158, 255, 0.2)',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modeTabActive: {
    backgroundColor: 'rgba(77, 158, 255, 0.15)',
    borderBottomWidth: 3,
    borderBottomColor: '#4D9EFF',
  },
  modeTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  modeTabTextActive: {
    color: '#4D9EFF',
    fontWeight: '700',
  },
  cardContent: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.3)',
    fontSize: 16,
    color: '#FFFFFF',
    paddingHorizontal: 16,
    height: 52,
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#4D9EFF',
    borderWidth: 2,
    borderColor: '#7B61FF',
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    borderColor: 'rgba(148, 163, 184, 0.5)',
    shadowOpacity: 0.2,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#4D9EFF',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  infoBadge: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(77, 158, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(77, 158, 255, 0.3)',
    alignItems: 'center',
  },
  infoBadgeText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  forgotPasswordButton: {
    marginTop: 12,
    marginBottom: 16,
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#4D9EFF',
    fontWeight: '500',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(77, 158, 255, 0.4)',
    padding: 24,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(77, 158, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modalDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    marginBottom: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    color: '#FFFFFF',
  },
  resetButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#4D9EFF',
    borderWidth: 2,
    borderColor: '#7B61FF',
    shadowColor: '#4D9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  resetButtonDisabled: {
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    borderColor: 'rgba(148, 163, 184, 0.5)',
    shadowOpacity: 0.2,
    elevation: 2,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cancelButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
});

export default AuthScreen;
