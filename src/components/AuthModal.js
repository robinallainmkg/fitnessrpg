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
 * AuthModal - Modal d'authentification Phone (MVP)
 * 
 * Flow:
 * 1. Entrer numéro de téléphone
 * 2. Recevoir code SMS
 * 3. Vérifier code → linkWithPhoneNumber() au compte anonymous
 * 4. Données guest automatiquement conservées ✓
 * 
 * Note: Email auth sera ajouté plus tard
 */
const AuthModal = ({ visible, onClose, onSuccess }) => {
  const [identifier, setIdentifier] = useState(''); // Email ou téléphone
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input'); // 'input' | 'verify'
  const [confirmation, setConfirmation] = useState(null);
  const [identifierType, setIdentifierType] = useState(null); // 'email' | 'phone'
  
  const { sendVerificationCode, verifyCode } = useAuth();

  // Réinitialiser les champs
  const resetForm = () => {
    setIdentifier('');
    setVerificationCode('');
    setLoading(false);
    setStep('input');
    setConfirmation(null);
    setIdentifierType(null);
  };

  // Détecter si c'est un email ou un téléphone
  const detectIdentifierType = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s+()-]+$/;
    
    const cleanValue = value.trim();
    if (emailRegex.test(cleanValue)) {
      return 'email';
    } else if (phoneRegex.test(cleanValue.replace(/\s/g, ''))) {
      return 'phone';
    }
    return null;
  };

  // === ENVOYER CODE (SMS ou Email) ===
  const handleSendCode = async () => {
    if (!identifier || identifier.length < 5) {
      Alert.alert('⚠️ Champ requis', 'Entre ton email ou numéro de téléphone');
      return;
    }

    const type = detectIdentifierType(identifier);
    
    if (!type) {
      Alert.alert(
        '⚠️ Format invalide',
        'Entre un email valide (ex: ton@email.com)\nou un numéro de téléphone (ex: +33612345678 ou 0612345678)'
      );
      return;
    }

    setIdentifierType(type);
    setLoading(true);

    try {
      if (type === 'phone') {
        console.log('📱 Envoi SMS à:', identifier);
        const result = await sendVerificationCode(identifier);
      
      if (result.success) {
        console.log('✅ Code SMS envoyé');
        setConfirmation(result.confirmation);
        setStep('verify');
        Alert.alert(
          '📱 SMS envoyé !',
          `Un code à 6 chiffres a été envoyé à ${result.phoneNumber}`
        );
      } else {
        Alert.alert('Erreur', result.error || 'Impossible d\'envoyer le code');
      }
      } else {
        // Email - TODO: implémenter envoi email
        Alert.alert(
          '⚠️ En développement',
          'L\'authentification par email arrive bientôt !\nUtilise un numéro de téléphone pour le moment.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Erreur envoi code:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le code. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  // === VÉRIFIER CODE ET LIER AU COMPTE ANONYME ===
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Code invalide', 'Entre les 6 chiffres du code');
      return;
    }

    if (!confirmation) {
      Alert.alert('Erreur', 'Session expirée. Réessaie avec ton numéro.');
      setStep('input');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Vérification code et linking...');
      const result = await verifyCode(confirmation, verificationCode);
      
      if (result.success) {
        console.log('✅ Compte lié avec succès! UID:', result.user.uid);
        
        Alert.alert(
          '🎉 Compte créé !',
          'Tes progrès sont maintenant sauvegardés en ligne.',
          [{ 
            text: 'OK', 
            onPress: () => {
              onSuccess();
              onClose();
              resetForm();
            }
          }]
        );
      } else {
        Alert.alert('Code incorrect', result.error || 'Vérifie le code reçu par SMS');
      }
    } catch (error) {
      console.error('❌ Erreur vérification:', error);
      Alert.alert('Erreur', 'Impossible de vérifier le code');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  const handleBackToInput = () => {
    if (!loading) {
      setStep('input');
      setVerificationCode('');
      setConfirmation(null);
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
                    {step === 'input' && '⚔️ Connexion / Inscription'}
                    {step === 'verify' && '🔐 Vérification'}
                  </Text>
                  <Text style={styles.subtitle}>
                    {step === 'input' && 'Email ou téléphone'}
                    {step === 'verify' && `Code envoyé à ${identifier}`}
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
              {step === 'input' && (
                <>
                  {/* Email ou Téléphone */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>📧 Email ou 📱 Téléphone</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="ton@email.com ou +33612345678"
                      placeholderTextColor="#94A3B8"
                      value={identifier}
                      onChangeText={setIdentifier}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <Text style={styles.hint}>
                      Format: email@exemple.com ou 0612345678
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      💡 Ton compte sera créé automatiquement !{'\n'}
                      Tes progrès seront sauvegardés en ligne.
                    </Text>
                  </View>

                  {/* Bouton envoyer */}
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSendCode}
                    disabled={loading || identifier.length < 5}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.buttonText}>
                        📨 Envoyer le code
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {step === 'verify' && (
                <>
                  {/* Code de vérification */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Code de vérification (6 chiffres)</Text>
                    <TextInput
                      style={[styles.input, styles.codeInput]}
                      placeholder="000000"
                      placeholderTextColor="#94A3B8"
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!loading}
                    />
                    <Text style={styles.hint}>
                      Code reçu par SMS à {confirmation?.phoneNumber}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      🕐 Le code expire dans 5 minutes
                    </Text>
                  </View>

                  {/* Bouton valider */}
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleVerifyCode}
                    disabled={loading || verificationCode.length !== 6}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.buttonText}>
                        ✓ Vérifier et se connecter
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Retour */}
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackToInput}
                    disabled={loading}
                  >
                    <Text style={styles.backButtonText}>
                      ← Modifier l'identifiant
                    </Text>
                  </TouchableOpacity>
                </>
              )}

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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
  },
  prefix: {
    paddingLeft: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  inputPhone: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 8,
    paddingRight: 16,
    fontSize: 16,
    color: '#FFFFFF',
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
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: 'rgba(77, 158, 255, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#4D9EFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
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
  backButton: {
    paddingVertical: 12,
    marginTop: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  backButtonText: {
    fontSize: 14,
    color: '#4D9EFF',
    fontWeight: '600',
  },
});

export default AuthModal;
