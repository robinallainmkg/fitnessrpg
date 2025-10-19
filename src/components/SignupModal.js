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
  Alert,
  ActivityIndicator
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { rpgTheme } from '../theme/rpgTheme';
import firestore from '@react-native-firebase/firestore';

/**
 * SignupModal simplifié - Gère signup ET login proprement
 * 
 * Flows:
 * 1. SIGNUP: Nouvel utilisateur crée un compte
 * 2. LOGIN: Utilisateur existant se connecte
 * 3. RESET PASSWORD: Utilisateur a oublié son mot de passe
 */
const SignupModal = ({ visible, onClose, onSuccess, guestData }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('signup'); // 'signup' | 'login' | 'reset'
  
  const { convertGuestToUser, login, resetPassword, user } = useAuth();

  // Réinitialiser les champs
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setLoading(false);
  };

  // Validation email
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // === RESET PASSWORD ===
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Email requis', 'Entre ton adresse email');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Email invalide', 'Vérifie ton adresse email');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        Alert.alert(
          'Email envoyé ! 📧',
          `Un lien de réinitialisation a été envoyé à ${email}`,
          [{ 
            text: 'OK', 
            onPress: () => {
              setMode('login');
              setPassword('');
            }
          }]
        );
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'email');
    } finally {
      setLoading(false);
    }
  };

  // === LOGIN ===
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Entre ton email et mot de passe');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Email invalide', 'Vérifie ton adresse email');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Login:', email);
      const result = await login(email, password);
      
      if (result.success) {
        console.log('✅ Login OK');
        
        // Si on a des programmes à sauvegarder (mode invité → login)
        if (guestData && result.user) {
          console.log('💾 Sauvegarde des programmes sélectionnés...');
          try {
            await firestore()
              .collection('users')
              .doc(result.user.uid)
              .set({
                email: result.user.email,
                totalXP: 0,
                level: 1,
                completedPrograms: [],
                userProgress: guestData.programs || {},
                activePrograms: guestData.activePrograms || guestData.selectedPrograms?.slice(0, 2) || [],
                selectedPrograms: guestData.selectedPrograms || [],
                streak: 0,
                lastWorkoutDate: null,
                createdAt: firestore.FieldValue.serverTimestamp(),
              }, { merge: true }); // merge pour ne pas écraser si compte existe déjà
            
            console.log('✅ Programmes sauvegardés');
          } catch (error) {
            console.error('⚠️ Erreur sauvegarde programmes:', error);
            // Continue quand même, les programmes seront sauvegardés plus tard
          }
        }
        
        onSuccess();
        onClose();
        resetForm();
      } else {
        Alert.alert('Erreur de connexion', result.error || 'Email ou mot de passe incorrect');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('Erreur', 'Impossible de se connecter');
    } finally {
      setLoading(false);
    }
  };

  // === SIGNUP ===
  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Entre ton email et mot de passe');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Email invalide', 'Vérifie ton adresse email');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Mot de passe trop court', 'Minimum 6 caractères');
      return;
    }

    setLoading(true);
    try {
      console.log('📝 Signup:', email);
      const result = await convertGuestToUser(email, password);
      
      if (result.success) {
        console.log('✅ Signup OK');
        
        // Sauvegarder les programmes sélectionnés
        if (guestData && result.user) {
          console.log('💾 Sauvegarde des programmes sélectionnés...');
          try {
            await firestore()
              .collection('users')
              .doc(result.user.uid)
              .set({
                userProgress: guestData.programs || {},
                activePrograms: guestData.activePrograms || guestData.selectedPrograms?.slice(0, 2) || [],
                selectedPrograms: guestData.selectedPrograms || [],
              }, { merge: true }); // merge pour ne pas écraser les données du convertGuestToUser
            
            console.log('✅ Programmes sauvegardés');
          } catch (error) {
            console.error('⚠️ Erreur sauvegarde programmes:', error);
            // Continue quand même
          }
        }
        
        onSuccess();
        onClose();
        resetForm();
      } else {
        // Email déjà utilisé -> proposer de se connecter
        if (result.code === 'auth/email-already-in-use') {
          Alert.alert(
            'Compte existant',
            `Un compte existe déjà avec ${email}. Veux-tu te connecter ?`,
            [
              { text: 'Non', style: 'cancel' },
              { 
                text: 'Oui, me connecter', 
                onPress: () => setMode('login')
              }
            ]
          );
        } else {
          Alert.alert('Erreur', result.error || 'Impossible de créer le compte');
        }
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      Alert.alert('Erreur', 'Impossible de créer le compte');
    } finally {
      setLoading(false);
    }
  };

  // Bouton principal selon le mode
  const handleSubmit = () => {
    if (mode === 'reset') {
      handleResetPassword();
    } else if (mode === 'login') {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
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
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            
            {/* Header */}
            <LinearGradient
              colors={['#7B61FF', '#4D9EFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>
                    {mode === 'reset' && '🔑 Mot de passe oublié'}
                    {mode === 'login' && '🔐 Connexion'}
                    {mode === 'signup' && '✨ Sauvegarde ta progression'}
                  </Text>
                  <Text style={styles.subtitle}>
                    {mode === 'reset' && 'On t\'envoie un lien par email'}
                    {mode === 'login' && 'Content de te revoir !'}
                    {mode === 'signup' && 'Crée un compte pour sauvegarder'}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleCancel} disabled={loading}>
                  <X size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Form */}
            <ScrollView 
              style={styles.form}
              keyboardShouldPersistTaps="handled"
            >
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ton@email.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              {/* Password (pas en mode reset) */}
              {mode !== 'reset' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="6 caractères minimum"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              )}

              {/* Bouton principal */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {mode === 'reset' && 'Envoyer le lien'}
                    {mode === 'login' && 'Se connecter'}
                    {mode === 'signup' && 'Créer mon compte'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Links de navigation */}
              <View style={styles.links}>
                {mode === 'signup' && (
                  <>
                    <TouchableOpacity 
                      onPress={() => setMode('login')}
                      disabled={loading}
                    >
                      <Text style={styles.link}>
                        Déjà un compte ? <Text style={styles.linkBold}>Se connecter</Text>
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {mode === 'login' && (
                  <>
                    <TouchableOpacity 
                      onPress={() => setMode('reset')}
                      disabled={loading}
                    >
                      <Text style={styles.link}>
                        🔑 Mot de passe oublié ?
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setMode('signup')}
                      disabled={loading}
                      style={{ marginTop: 12 }}
                    >
                      <Text style={styles.link}>
                        Pas de compte ? <Text style={styles.linkBold}>S'inscrire</Text>
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {mode === 'reset' && (
                  <TouchableOpacity 
                    onPress={() => setMode('login')}
                    disabled={loading}
                  >
                    <Text style={styles.link}>
                      Retour à la <Text style={styles.linkBold}>connexion</Text>
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: rpgTheme.colors.background.card,
    borderRadius: 20,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    ...rpgTheme.effects.shadows.heavy,
  },
  header: {
    padding: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: rpgTheme.colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: rpgTheme.colors.neon.blue,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    ...rpgTheme.effects.shadows.glow,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  links: {
    marginTop: 24,
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  linkBold: {
    color: rpgTheme.colors.neon.blue,
    fontWeight: 'bold',
  },
});

export default SignupModal;
