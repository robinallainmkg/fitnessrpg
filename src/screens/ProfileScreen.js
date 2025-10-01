import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  Alert
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Switch,
  Divider,
  List
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

const ProfileScreen = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              console.error('Erreur déconnexion:', error);
              Alert.alert('Erreur', 'Impossible de vous déconnecter');
            }
          },
        },
      ]
    );
  };

  const handleSendFeedback = () => {
    const email = 'feedback@fitnessapp.com';
    const subject = 'Feedback - Fitness RPG App';
    const body = `Bonjour,\n\nJ'aimerais partager mon retour sur l'application :\n\n`;
    
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailto).catch(() => {
      Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application email');
    });
  };

  const handleSupport = () => {
    const email = 'support@fitnessapp.com';
    const subject = 'Support - Fitness RPG App';
    const body = `Bonjour,\n\nJ'ai besoin d'aide avec l'application :\n\nProblème rencontré :\n\nÉtapes pour reproduire :\n\n`;
    
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailto).catch(() => {
      Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application email');
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profil utilisateur */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          
          <Text style={styles.userName}>
            {user?.displayName || 'Utilisateur'}
          </Text>
          
          <Text style={styles.userEmail}>
            {user?.email}
          </Text>
          
          <Text style={styles.memberSince}>
            Membre depuis {formatJoinDate(user?.metadata?.creationTime)}
          </Text>
        </Card.Content>
      </Card>

      {/* Paramètres */}
      <Card style={styles.settingsCard}>
        <Card.Content style={styles.settingsContent}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          
          <List.Section style={styles.settingsList}>
            <List.Item
              title="Notifications"
              description="Recevoir des rappels d'entraînement"
              left={() => <List.Icon icon="bell-outline" />}
              right={() => (
                <Switch
                  value={true}
                  onValueChange={() => {
                    // TODO: Implémenter les notifications
                    Alert.alert('Bientôt disponible', 'Cette fonctionnalité sera bientôt disponible');
                  }}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Rappels quotidiens"
              description="Notification pour s'entraîner"
              left={() => <List.Icon icon="calendar-clock" />}
              right={() => (
                <Switch
                  value={false}
                  onValueChange={() => {
                    Alert.alert('Bientôt disponible', 'Cette fonctionnalité sera bientôt disponible');
                  }}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Mode sombre"
              description="Utiliser le thème sombre"
              left={() => <List.Icon icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={false}
                  onValueChange={() => {
                    Alert.alert('Bientôt disponible', 'Cette fonctionnalité sera bientôt disponible');
                  }}
                />
              )}
            />
          </List.Section>
        </Card.Content>
      </Card>

      {/* Support et feedback */}
      <Card style={styles.supportCard}>
        <Card.Content style={styles.supportContent}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              icon="message-outline"
              onPress={handleSendFeedback}
              style={styles.supportButton}
              contentStyle={styles.buttonContent}
            >
              Envoyer un feedback
            </Button>
            
            <Button
              mode="outlined"
              icon="help-circle-outline"
              onPress={handleSupport}
              style={styles.supportButton}
              contentStyle={styles.buttonContent}
            >
              Contacter le support
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* À propos */}
      <Card style={styles.aboutCard}>
        <Card.Content style={styles.aboutContent}>
          <Text style={styles.sectionTitle}>À propos</Text>
          
          <Text style={styles.appName}>Fitness RPG</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          
          <Text style={styles.aboutText}>
            Une application de fitness gamifiée qui transforme tes entraînements en aventure RPG. 
            Gagne des points, débloque des niveaux et progresse vers tes objectifs !
          </Text>
          
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsTitle}>Crédits</Text>
            <Text style={styles.creditsText}>
              Développé avec React Native et Firebase
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Déconnexion */}
      <Card style={styles.logoutCard}>
        <Card.Content style={styles.logoutContent}>
          <Button
            mode="contained"
            icon="logout"
            onPress={handleLogout}
            style={styles.logoutButton}
            contentStyle={styles.buttonContent}
            buttonColor={colors.error}
          >
            Se déconnecter
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
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
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    elevation: 4,
  },
  profileContent: {
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  settingsCard: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    elevation: 4,
  },
  settingsContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  settingsList: {
    margin: 0,
    padding: 0,
  },
  supportCard: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    elevation: 4,
  },
  supportContent: {
    padding: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  supportButton: {
    borderColor: colors.primary,
  },
  buttonContent: {
    height: 48,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    elevation: 4,
  },
  aboutContent: {
    padding: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 20,
  },
  creditsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  creditsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  creditsText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  logoutCard: {
    backgroundColor: colors.surface,
    marginBottom: 32,
    elevation: 4,
  },
  logoutContent: {
    padding: 20,
  },
  logoutButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;
