import firestore from '@react-native-firebase/firestore';

/**
 * Service pour gérer le classement global des utilisateurs
 */

/**
 * Récupère le rang d'un utilisateur dans le classement global basé sur l'XP
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<{rank: number, totalUsers: number}>}
 */
export const getUserGlobalRank = async (userId) => {
  try {
    if (!userId) {
      console.warn('⚠️ getUserGlobalRank: userId is required');
      return { rank: null, totalUsers: 0 };
    }

    // Récupérer l'utilisateur actuel
    const userDoc = await firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      console.warn('⚠️ getUserGlobalRank: user not found');
      return { rank: null, totalUsers: 0 };
    }

    const userData = userDoc.data();
    const userXP = userData.globalXP || 0;

    // Compter combien d'utilisateurs ont plus d'XP
    const higherRankedUsers = await firestore()
      .collection('users')
      .where('globalXP', '>', userXP)
      .get();

    // Le rang est le nombre d'utilisateurs avec plus d'XP + 1
    const rank = higherRankedUsers.size + 1;

    // Compter le nombre total d'utilisateurs (optionnel, peut être mis en cache)
    const totalUsersSnapshot = await firestore()
      .collection('users')
      .get();
    
    const totalUsers = totalUsersSnapshot.size;

    console.log(`📊 User rank: #${rank} out of ${totalUsers} users (${userXP} XP)`);

    return { rank, totalUsers };
  } catch (error) {
    console.error('❌ Error getting user rank:', error);
    return { rank: null, totalUsers: 0 };
  }
};

/**
 * Récupère le classement global (top N utilisateurs)
 * @param {number} limit - Nombre d'utilisateurs à récupérer
 * @returns {Promise<Array>}
 */
export const getGlobalLeaderboard = async (limit = 10) => {
  try {
    const snapshot = await firestore()
      .collection('users')
      .orderBy('globalXP', 'desc')
      .limit(limit)
      .get();

    const leaderboard = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        rank: index + 1,
        userId: doc.id,
        username: data.displayName || 'Utilisateur',
        globalXP: data.globalXP || 0,
        globalLevel: data.globalLevel || 0,
        title: data.title || 'Débutant',
        avatarId: data.avatarId || 0,
      };
    });

    return leaderboard;
  } catch (error) {
    console.error('❌ Error getting leaderboard:', error);
    return [];
  }
};

/**
 * Récupère les utilisateurs autour d'un utilisateur spécifique dans le classement
 * @param {string} userId - ID de l'utilisateur
 * @param {number} range - Nombre d'utilisateurs avant et après (ex: 2 = 2 avant + user + 2 après)
 * @returns {Promise<Array>}
 */
export const getLeaderboardAround = async (userId, range = 2) => {
  try {
    const { rank } = await getUserGlobalRank(userId);
    
    if (!rank) return [];

    // Calculer les rangs à récupérer
    const startRank = Math.max(1, rank - range);
    const endRank = rank + range;
    
    // Récupérer tous les utilisateurs triés par XP
    const snapshot = await firestore()
      .collection('users')
      .orderBy('globalXP', 'desc')
      .limit(endRank)
      .get();

    const allUsers = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        rank: index + 1,
        userId: doc.id,
        username: data.displayName || 'Utilisateur',
        globalXP: data.globalXP || 0,
        globalLevel: data.globalLevel || 0,
        title: data.title || 'Débutant',
        avatarId: data.avatarId || 0,
        isCurrentUser: doc.id === userId,
      };
    });

    // Filtrer pour garder seulement la plage demandée
    return allUsers.filter(user => user.rank >= startRank && user.rank <= endRank);
  } catch (error) {
    console.error('❌ Error getting leaderboard around user:', error);
    return [];
  }
};
