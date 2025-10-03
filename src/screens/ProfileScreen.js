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
import { migrateExistingUsers, previewMigration, testMigrationSingleUser } from '../utils/userMigration';
import { migrateAllUsers, verifyMigration, previewMigration as previewNewMigration } from '../utils/migrateUsers';
import UserStatsCard from '../components/UserStatsCard';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, resetUserData } = useAuth();

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
              await logout();
            } catch (error) {
              console.error('Erreur déconnexion:', error);
              Alert.alert('Erreur', 'Impossible de vous déconnecter');
            }
          },
        },
      ]
    );
  };



  const handleMigration = async () => {
    Alert.alert(
      '🔄 Migration Base de Données',
      'Ajouter les nouveaux champs (globalXP, stats, programs) à tous les utilisateurs ?',
      [
        { text: 'Preview', onPress: handlePreviewMigration },
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Migrer',
          style: 'destructive',
          onPress: async () => {
            try {
              Alert.alert('⏳', 'Migration en cours...');
              const result = await migrateExistingUsers();
              
              if (result.success) {
                Alert.alert(
                  '✅ Migration Réussie',
                  `Migrés: ${result.migrated}\nIgnorés: ${result.skipped}\nErreurs: ${result.errors}`
                );
              } else {
                Alert.alert('❌ Erreur Migration', result.error);
              }
            } catch (error) {
              Alert.alert('❌ Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  const handlePreviewMigration = async () => {
    try {
      Alert.alert('⏳', 'Analyse en cours...');
      const preview = await previewMigration();
      
      if (preview) {
        console.log('📊 Preview Migration:', preview);
        Alert.alert(
          '👀 Preview Migration',
          `${preview.length} utilisateurs analysés.\nVoir les détails dans la console.`
        );
      }
    } catch (error) {
      Alert.alert('❌ Erreur Preview', error.message);
    }
  };

  // NOUVELLES FONCTIONS DE MIGRATION MULTI-PROGRAMMES
  const handleNewMigration = async () => {
    try {
      Alert.alert(
        '🆕 Migration Multi-Programmes v1.0',
        'Nouvelle migration avec structure complète :\n\n• Système multi-programmes\n• Stats individuelles\n• Titres et niveaux globaux\n\nChoisir une action :',
        [
          {
            text: '👁️ Prévisualisation',
            onPress: () => handleNewPreviewMigration()
          },
          {
            text: '🔍 Vérification',
            onPress: () => handleVerifyMigration()
          },
          {
            text: '🚀 Migration Complète',
            style: 'destructive',
            onPress: () => handleNewFullMigration()
          },
          {
            text: 'Annuler',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      Alert.alert('❌ Erreur', error.message);
    }
  };

  const handleNewPreviewMigration = async () => {
    try {
      const result = await previewNewMigration();
      if (result) {
        Alert.alert(
          '👁️ Prévisualisation Migration v1.0',
          `📊 Total utilisateurs: ${result.totalUsers}\n🔄 À migrer: ${result.toMigrate}\n✅ Déjà migrés: ${result.alreadyMigrated}\n\nVoir console pour détails complets.`
        );
      }
    } catch (error) {
      Alert.alert('❌ Erreur Prévisualisation', error.message);
    }
  };

  const handleVerifyMigration = async () => {
    try {
      const result = await verifyMigration();
      if (result) {
        const successRate = result.totalUsers > 0 ? Math.round((result.migratedUsers / result.totalUsers) * 100) : 0;
        Alert.alert(
          '🔍 Vérification Migration v1.0',
          `📊 Total: ${result.totalUsers}\n✅ Migrés: ${result.migratedUsers}\n❌ Non migrés: ${result.nonMigratedUsers}\n📈 Taux de succès: ${successRate}%`
        );
      }
    } catch (error) {
      Alert.alert('❌ Erreur Vérification', error.message);
    }
  };

  const handleNewFullMigration = async () => {
    try {
      Alert.alert(
        '⚠️ MIGRATION MULTI-PROGRAMMES v1.0',
        'Cette migration va :\n\n✅ Ajouter globalXP et globalLevel\n✅ Créer le système de stats\n✅ Structurer programs.street\n✅ Ajouter les titres utilisateur\n✅ Préserver toutes les données\n\n⚠️ Action irréversible\n\nContinuer ?',
        [
          {
            text: 'Annuler',
            style: 'cancel'
          },
          {
            text: '🚀 MIGRER MAINTENANT',
            style: 'destructive',
            onPress: async () => {
              Alert.alert('⏳', 'Migration en cours...');
              const success = await migrateAllUsers();
              if (success) {
                Alert.alert('✅ Migration Réussie !', 'Tous les utilisateurs ont été migrés vers la structure v1.0 avec succès !');
              } else {
                Alert.alert('❌ Échec Migration', 'La migration a échoué. Consulter les logs pour plus de détails.');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('❌ Erreur Migration', error.message);
    }
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

      {/* Stats utilisateur (test) */}
      <UserStatsCard 
        stats={{
          strength: user?.stats?.strength || 15,
          endurance: user?.stats?.endurance || 8,
          power: user?.stats?.power || 12,
          speed: user?.stats?.speed || 5,
          flexibility: user?.stats?.flexibility || 3
        }}
      />

      {/* Paramètres */}
      <Card style={styles.settingsCard}>
        <Card.Content style={styles.settingsContent}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          
          <List.Section style={styles.settingsList}>
            <List.Item
              title="Notifications"
              description="Recevoir des rappels d'entraînement"
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textSecondary }}
              left={() => <List.Icon icon="bell-outline" color={colors.textSecondary} />}
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
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textSecondary }}
              left={() => <List.Icon icon="calendar-clock" color={colors.textSecondary} />}
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
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textSecondary }}
              left={() => <List.Icon icon="theme-light-dark" color={colors.textSecondary} />}
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

      {/* Gestion des programmes */}
      <Card style={styles.programsCard}>
        <Card.Content style={styles.programsContent}>
          <Text style={styles.sectionTitle}>Mes Programmes</Text>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              icon="dumbbell"
              onPress={() => navigation.navigate('ProgramSelection')}
              style={styles.manageProgramsButton}
              contentStyle={styles.buttonContent}
              buttonColor={colors.primary}
            >
              Gérer mes programmes
            </Button>
          </View>
          
          <Text style={styles.programsDescription}>
            Ajoute, retire ou modifie tes programmes d'entraînement
          </Text>
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

      {/* Outils développeur */}
      {user?.email === 'robinallainmkg@gmail.com' && (
        <Card style={[styles.logoutCard, { backgroundColor: colors.warning + '20' }]}>
          <Card.Content style={styles.logoutContent}>
            <Button
              mode="outlined"
              icon="restart"
              onPress={() => {
                Alert.alert(
                  'Reset compte',
                  'Réinitialiser toutes tes données ? (XP, progression, etc.)',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Reset',
                      style: 'destructive',
                      onPress: async () => {
                        const result = await resetUserData();
                        if (result.success) {
                          Alert.alert('✅', 'Compte réinitialisé !');
                        } else {
                          Alert.alert('❌', result.error);
                        }
                      }
                    }
                  ]
                );
              }}
              style={[styles.logoutButton, { borderColor: colors.warning, marginBottom: 8 }]}
              contentStyle={styles.buttonContent}
              labelStyle={{ color: colors.warning }}
            >
              🔄 Reset Compte (Dev)
            </Button>
            
            <Button
              mode="outlined"
              icon="database-sync"
              onPress={handleMigration}
              style={[styles.logoutButton, { borderColor: colors.primary, marginBottom: 8 }]}
              contentStyle={styles.buttonContent}
              labelStyle={{ color: colors.primary }}
            >
              🗄️ Migration DB (Legacy)
            </Button>
            
            <Button
              mode="outlined"
              icon="database-plus"
              onPress={handleNewMigration}
              style={[styles.logoutButton, { borderColor: colors.success }]}
              contentStyle={styles.buttonContent}
              labelStyle={{ color: colors.success }}
            >
              🆕 Migration Multi-Programmes v1.0
            </Button>
          </Card.Content>
        </Card>
      )}

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
  programsCard: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    elevation: 4,
  },
  programsContent: {
    padding: 20,
  },
  manageProgramsButton: {
    marginBottom: 8,
  },
  programsDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
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
