import firestore from '@react-native-firebase/firestore';

export const checkCompanionEvolution = async (userId, newTier, oldTier) => {
  const evolutionThresholds = [0, 2, 4, 6, 8];

  const oldLevel = evolutionThresholds.findIndex(t => oldTier < evolutionThresholds[t + 1]);
  const newLevel = evolutionThresholds.findIndex(t => newTier < evolutionThresholds[t + 1]);

  if (newLevel > oldLevel) {
    const companionRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('companion')
      .doc('data');

    await companionRef.update({
      currentTier: newTier,
      lastUpdated: firestore.FieldValue.serverTimestamp(),
      evolutionHistory: firestore.FieldValue.arrayUnion({
        tier: newTier,
        date: new Date().toISOString(),
        message: getEvolutionMessage(newLevel)
      })
    });

    return true; // Évolution détectée
  }

  return false;
};

const getEvolutionMessage = (level) => {
  const messages = {
    1: "Ton companion devient plus fort !",
    2: "Transformation en athlète confirmé !",
    3: "Niveau expert atteint !",
    4: "Forme légendaire débloquée !"
  };
  return messages[level] || "Évolution en cours...";
};
