import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
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
  const { signup, login } = useAuth();

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
        Alert.alert('Erreur', result.error);
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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🏋️ Fitness Game</Text>
            <Text style={styles.subtitle}>
              Transforme tes entraînements en aventure
            </Text>
          </View>

          {/* Form Card */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.formTitle}>
                {isLogin ? 'Connexion' : 'Inscription'}
              </Text>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                theme={{
                  colors: {
                    primary: colors.primary,
                    outline: colors.border,
                    background: colors.surface,
                    onSurface: colors.text,
                    onSurfaceVariant: colors.textSecondary
                  }
                }}
              />

              <TextInput
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                theme={{
                  colors: {
                    primary: colors.primary,
                    outline: colors.border,
                    background: colors.surface,
                    onSurface: colors.text,
                    onSurfaceVariant: colors.textSecondary
                  }
                }}
              />

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading || !email || !password}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
              >
                {loading ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  isLogin ? 'Se connecter' : 'S\'inscrire'
                )}
              </Button>

              <Button
                mode="text"
                onPress={toggleMode}
                disabled={loading}
                style={styles.toggleButton}
                labelStyle={{ color: colors.primary }}
              >
                {isLogin 
                  ? 'Pas de compte ? S\'inscrire' 
                  : 'Déjà un compte ? Se connecter'}
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    elevation: 4,
  },
  cardContent: {
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: colors.primary,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  toggleButton: {
    marginTop: 8,
  },
});

export default AuthScreen;
