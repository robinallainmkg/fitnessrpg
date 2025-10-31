import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

export const PhoneLoginScreen = ({ navigation, route }) => {
  const { sendVerificationCode, verifyCode, setGuestMode } = useContext(AuthContext);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const isExistingUser = route?.params?.isExistingUser;

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return;
    }

    setLoading(true);
    const result = await sendVerificationCode(phoneNumber);
    setLoading(false);

    if (result.success) {
      setConfirmation(result.confirmation);
      Alert.alert(
        'Code envoyé ✅',
        `Un code de vérification a été envoyé au ${result.phoneNumber}`
      );
    } else {
      Alert.alert('Erreur', result.error || 'Impossible d\'envoyer le code');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le code reçu par SMS');
      return;
    }

    setLoading(true);
    const result = await verifyCode(confirmation, verificationCode);
    setLoading(false);

    if (result.success) {
      // Navigation automatique par AuthContext
      console.log('✅ Connexion réussie !');
    } else {
      Alert.alert('Erreur', result.error || 'Code incorrect');
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, '#1a0a2e']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isExistingUser ? '🔐 Connexion' : '📱 Inscription'}
          </Text>
          <Text style={styles.subtitle}>
            {confirmation
              ? 'Entrez le code reçu par SMS'
              : 'Entrez votre numéro de téléphone'}
          </Text>
        </View>

        {!confirmation ? (
          // ÉTAPE 1 : Saisie du numéro
          <View style={styles.form}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="06 12 34 56 78"
              placeholderTextColor="#666"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoFocus
              editable={!loading}
            />
            <Text style={styles.hint}>
              Format accepté : 06 XX XX XX XX ou +33 6 XX XX XX XX
            </Text>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Recevoir le code</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // ÉTAPE 2 : Saisie du code
          <View style={styles.form}>
            <Text style={styles.label}>Code de vérification</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor="#666"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              editable={!loading}
            />
            <Text style={styles.hint}>Code à 6 chiffres reçu par SMS</Text>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Vérifier le code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                setConfirmation(null);
                setVerificationCode('');
              }}
            >
              <Text style={styles.linkText}>← Modifier le numéro</Text>
            </TouchableOpacity>
          </View>
        )}

        {!confirmation && (
          <>
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.switchText}>← Retour</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={async () => {
                try {
                  await setGuestMode();
                  // AuthContext handles navigation automatically
                } catch (error) {
                  Alert.alert('Erreur', 'Impossible d\'activer le mode invité');
                }
              }}
            >
              <Text style={styles.guestText}>Continuer en mode invité</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  switchText: {
    color: '#aaa',
    fontSize: 14,
  },
  guestButton: {
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
  },
  guestText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
