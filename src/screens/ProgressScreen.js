import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getFirestore } from '../config/firebase.simple';
import { useAuth } from '../contexts/AuthContext';
import { getWithRetry } from '../utils/firestoreRetry';
import { rpgTheme } from '../theme/rpgTheme';
import { Flame, Zap, Wind, Activity, Dumbbell } from 'lucide-react-native';

const firestore = getFirestore();

const ProgressScreen = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ strength: 0, endurance: 0, speed: 0, flexibility: 0, power: 0 });
  const [sessionHistory, setSessionHistory] = useState([]);
  const { user, isGuest } = useAuth();

  useEffect(() => { loadUserData(); }, [user]);

  const loadUserData = async () => {
    // ═══ NOUVELLE ARCHITECTURE: Les invités ont un user.uid Firebase ═══
    if (!user || !user.uid) {
      console.log('⏭️ ProgressScreen: No user');
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('📊 ProgressScreen: Loading data for user', user.uid, isGuest ? '(guest)' : '(authenticated)');
      
      // Charger user data et sessions en parallèle
      const [userDoc, sessionsSnapshot] = await Promise.all([
        firestore.collection('users').doc(user.uid).get(),
        firestore
          .collection('workoutSessions')
          .where('userId', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .limit(10)
          .get()
      ]);
      
      if (userDoc.exists) {
        const data = userDoc.data();
        setUserData(data);
        if (data.stats) setStats(data.stats);
      }
      
      console.log('🔥 Sessions chargées:', sessionsSnapshot.size);
      
      const sessions = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSessionHistory(sessions);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      
      // Si erreur d'index manquant
      if (error.message?.includes('index') || error.code === 'failed-precondition') {
        console.warn('🔥 INDEX FIRESTORE MANQUANT - Vérifiez firestore.indexes.json');
      }
      
      setSessionHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (t) => { if (!t) return ''; const d = t.toDate ? t.toDate() : new Date(t); return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); };
  const getScoreColor = (s) => s >= 900 ? '#4ADE80' : s >= 750 ? '#60A5FA' : s >= 600 ? '#FBBF24' : '#F87171';

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}><ActivityIndicator size="large" color={rpgTheme.colors.neon.blue} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <View style={{ marginHorizontal: 16, marginBottom: 24, marginTop: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF', marginBottom: 16 }}>Statistiques</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {[
            { label: 'Force', value: stats.strength, color: '#EF4444', iconComp: <Dumbbell size={24} color="#EF4444" strokeWidth={2.5} /> },
            { label: 'Endurance', value: stats.endurance, color: '#10B981', iconComp: <Activity size={24} color="#10B981" strokeWidth={2.5} /> },
            { label: 'Vitesse', value: stats.speed, color: '#FBBF24', iconComp: <Zap size={24} color="#FBBF24" strokeWidth={2.5} /> },
            { label: 'Souplesse', value: stats.flexibility, color: '#8B5CF6', iconComp: <Wind size={24} color="#8B5CF6" strokeWidth={2.5} /> },
            { label: 'Puissance', value: stats.power, color: '#F97316', iconComp: <Flame size={24} color="#F97316" strokeWidth={2.5} /> }
          ].map(s => (
            <View key={s.label} style={{ width: '48%', backgroundColor: 'rgba(30,41,59,0.8)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(77,158,255,0.2)' }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(77,158,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                {s.icon ? <Text style={{ fontSize: 24 }}>{s.icon}</Text> : s.iconComp}
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: 4, textTransform: 'uppercase' }}>{s.label}</Text>
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFF', marginBottom: 8 }}>{s.value || 0}</Text>
              <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: Math.min(s.value || 0, 100) + '%', backgroundColor: s.color, borderRadius: 3 }} />
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF', marginBottom: 16 }}>Historique des séances</Text>
        {sessionHistory.length === 0 ? (
          <View style={{ paddingVertical: 48, alignItems: 'center' }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}></Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 8 }}>Aucune séance effectuée</Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Commence ton premier entraînement !</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {sessionHistory.map(s => {
              // Déterminer si c'est un challenge ou une séance normale
              const isChallenge = s.type === 'challenge';
              const displayName = isChallenge 
                ? `🏆 ${s.exercises?.[0]?.name || 'Challenge'}` 
                : (s.skillName || s.workoutName || 'Séance');
              const displayIcon = isChallenge ? '🏆' : (s.programIcon || '💪');
              
              return (
                <View key={s.id} style={{ backgroundColor: 'rgba(30,41,59,0.8)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: isChallenge ? 'rgba(255,215,0,0.3)' : 'rgba(77,158,255,0.2)' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isChallenge ? 'rgba(255,215,0,0.15)' : 'rgba(77,158,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 2, borderColor: isChallenge ? 'rgba(255,215,0,0.3)' : 'rgba(77,158,255,0.3)' }}>
                      <Text style={{ fontSize: 24 }}>{displayIcon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 4 }} numberOfLines={1}>{displayName}</Text>
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{formatDate(s.createdAt || s.endTime || s.date)}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      {isChallenge ? (
                        <>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFD700' }}>VALIDÉ</Text>
                          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>challenge</Text>
                        </>
                      ) : (
                        <>
                          <Text style={{ fontSize: 24, fontWeight: '700', color: getScoreColor(s.score || 0) }}>{s.score || 0}</Text>
                          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>pts</Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}>
                    {[
                      { label: 'XP gagné', value: '+' + (s.xpEarned || 0) },
                      { label: isChallenge ? 'Type' : 'Exercices', value: isChallenge ? 'Challenge' : (s.exercises?.length || 0) },
                      { label: 'Niveau', value: (s.levelNumber || 1) }
                    ].map(st => (
                      <View key={st.label} style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{st.label}</Text>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: isChallenge ? '#FFD700' : rpgTheme.colors.neon.blue }}>{st.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

export default ProgressScreen;

