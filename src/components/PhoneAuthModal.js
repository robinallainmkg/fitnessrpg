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
 * PhoneAuthModal - Authentification par numéro de téléphone (SMS)
 * 
 * Flow:
 * 1. Entrer le numéro de téléphone
 * 2. Recevoir un SMS avec un code 6 chiffres
 * 3. Entrer le code pour se connecter
 * 4. Sauvegarder les données guest (programmes sélectionnés)
 */
const PhoneAuthModal = ({ visible, onClose, onSuccess, guestData }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('phone'); // 'phone' | 'code'
  const [confirmation, setConfirmation] = useState(null);
  
  const { sendVerificationCode, verifyCode } = useAuth();

  // Réinitialiser les champs
  const resetForm = () => {
    setPhoneNumber('');
    setVerificationCode('');
    setLoading(false);
    setStep('phone');
    setConfirmation(null);
  };

  // === ENVOYER CODE SMS ===
  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      Alert.alert('Numéro invalide', 'Entre un numéro de téléphone valide (ex: 612345678 ou 06 12 34 56 78)');
      return;
    }

    setLoading(true);
    try {
      console.log('📱 Envoi code SMS à:', phoneNumber);
      const result = await sendVerificationCode(phoneNumber);
      
      if (result.success) {
        console.log('✅ Code SMS envoyé');
        setConfirmation(result.confirmation);
        setStep('code');
        Alert.alert(
          'SMS envoyé ! 📲',
          `Un code à 6 chiffres a été envoyé à ${result.phoneNumber}`
        );
      } else {
        Alert.alert('Erreur', result.error || 'Impossible d\'envoyer le code');
      }
    } catch (error) {
      console.error('❌ Erreur envoi SMS:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le code. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  // === VÉRIFIER CODE ET CONNECTER ===
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Code invalide', 'Entre les 6 chiffres du code');
      return;
    }

    if (!confirmation) {
      Alert.alert('Erreur', 'Session expirée. Réessaie avec ton numéro.');
      setStep('phone');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Vérification code...');
      const result = await verifyCode(confirmation, verificationCode);
      
      if (result.success) {
        console.log('✅ Code validé, utilisateur connecté:', result.user.uid);
        
        // Sauvegarder les programmes sélectionnés
        if (guestData && result.user) {
          console.log('💾 Sauvegarde des programmes sélectionnés...');
          console.log('guestData:', guestData);
          try {
            // Préparer les données (défendre contre les valeurs nulles)
            const programsToSave = guestData.programs || guestData.userProgress || {};
            const activePrograms = guestData.activePrograms || guestData.selectedPrograms?.slice(0, 2) || [];
            const selectedPrograms = guestData.selectedPrograms || [];
            
            await firestore()
              .collection('users')
              .doc(result.user.uid)
              .set({
                phoneNumber: result.user.phoneNumber,
                userProgress: programsToSave,
                activePrograms: activePrograms,
                selectedPrograms: selectedPrograms,
              }, { merge: true });
            
            console.log('✅ Programmes sauvegardés');
          } catch (error) {
            console.error('⚠️ Erreur sauvegarde programmes:', error);
            // Continue quand même
          }
        } else {
          console.log('ℹ️ Pas de guestData à sauvegarder');
        }
        
        onSuccess();
        onClose();
        resetForm();
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

  const handleBackToPhone = () => {
    if (!loading) {
      setStep('phone');
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
                    {step === 'phone' && '📱 Connexion par SMS'}
                    {step === 'code' && '🔐 Vérification'}
                  </Text>
                  <Text style={styles.subtitle}>
                    {step === 'phone' && 'Sauvegarde ta progression'}
                    {step === 'code' && 'Entre le code reçu par SMS'}
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
              {step === 'phone' && (
                <>
                  {/* Numéro de téléphone */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Numéro de téléphone</Text>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.prefix}>🇫🇷 +33</Text>
                      <TextInput
                        style={styles.inputPhone}
                        placeholder="6 XX XX XX XX"
                        placeholderTextColor="#94A3B8"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        editable={!loading}
                      />
                    </View>
                    <Text style={styles.hint}>Format: 06 12 34 56 78 ou 612345678</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      ℹ️ Tu recevras un SMS avec un code de vérification
                    </Text>
                  </View>

                  {/* Bouton envoyer */}
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSendCode}
                    disabled={loading || phoneNumber.length < 9}
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

              {step === 'code' && (
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
                    onPress={handleBackToPhone}
                    disabled={loading}
                  >
                    <Text style={styles.backButtonText}>
                      ← Modifier le numéro
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

export default PhoneAuthModal;
