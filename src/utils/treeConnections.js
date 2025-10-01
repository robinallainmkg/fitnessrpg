/**
 * Helpers pour calculer et dessiner les connexions entre nœuds de l'arbre de compétences
 * Utilise la trigonométrie pour positionner et orienter les lignes de connexion
 */

/**
 * Calcule la position et l'orientation d'une ligne de connexion entre deux nœuds
 * 
 * @param {Object} fromPos - Position du nœud source { x, y }
 * @param {Object} toPos - Position du nœud destination { x, y }
 * @param {number} nodeSize - Taille d'un nœud en pixels (ex: 80, 100)
 * @returns {Object} Style object pour positionner la ligne
 */
export const calculateLinePosition = (fromPos, toPos, nodeSize) => {
  // 1. Calculer le centre de chaque nœud
  // Les positions fromPos et toPos correspondent au coin supérieur gauche des nœuds
  // On ajoute nodeSize/2 pour obtenir le centre exact
  const centerFrom = {
    x: fromPos.x + nodeSize / 2,
    y: fromPos.y + nodeSize / 2
  };
  
  const centerTo = {
    x: toPos.x + nodeSize / 2,
    y: toPos.y + nodeSize / 2
  };

  // 2. Calculer le vecteur de déplacement (delta) entre les centres
  const dx = centerTo.x - centerFrom.x;  // Déplacement horizontal
  const dy = centerTo.y - centerFrom.y;  // Déplacement vertical

  // 3. Calculer la distance euclidienne entre les deux centres
  // Utilise le théorème de Pythagore : distance = √(dx² + dy²)
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 4. Calculer l'angle de rotation nécessaire
  // Math.atan2(y, x) retourne l'angle en radians du vecteur (dx, dy)
  // On convertit en degrés en multipliant par (180 / π)
  // atan2 gère automatiquement tous les quadrants (-180° à +180°)
  const angleRadians = Math.atan2(dy, dx);
  const angleDegrees = angleRadians * (180 / Math.PI);

  // 5. Retourner l'objet de style pour positionner la ligne
  return {
    left: centerFrom.x,                    // Position X de départ (centre du nœud source)
    top: centerFrom.y,                     // Position Y de départ (centre du noeud source)
    width: distance,                       // Largeur = distance entre les centres
    height: 2,                            // Hauteur fixe de la ligne
    transform: `rotate(${angleDegrees}deg)`, // Rotation pour aligner vers le nœud destination
    transformOrigin: 'left center'         // Point de pivot : côté gauche, centre vertical
  };
};

/**
 * Retourne le style d'une connexion selon si elle mène vers un nœud débloqué
 * 
 * @param {boolean} isUnlocked - True si le nœud destination est débloqué
 * @returns {Object} Style object pour la ligne de connexion
 */
export const getConnectionStyle = (isUnlocked) => {
  return {
    backgroundColor: isUnlocked ? '#6C63FF' : '#444',  // Bleu si débloqué, gris sinon
    opacity: isUnlocked ? 0.6 : 0.2,                  // Plus opaque si débloqué
    height: 2,                                         // Hauteur constante
    position: 'absolute',                              // Positionnement absolu requis
    zIndex: 1,                                         // Derrière les nœuds mais visible
  };
};

/**
 * Calcule la position absolue d'un nœud basée sur sa position dans la grille
 * 
 * @param {Object} gridPosition - Position dans la grille { x, y }
 * @param {number} cellWidth - Largeur d'une cellule de grille (ex: 140px)
 * @param {number} cellHeight - Hauteur d'une cellule de grille (ex: 160px)
 * @returns {Object} Position absolue { x, y }
 */
export const calculateNodePosition = (gridPosition, cellWidth = 140, cellHeight = 160) => {
  return {
    x: gridPosition.x * cellWidth,
    y: gridPosition.y * cellHeight
  };
};

/**
 * Génère toutes les connexions pour un programme donné
 * 
 * @param {Object} program - Programme source avec unlocks array
 * @param {Array} allPrograms - Tous les programmes pour trouver les destinations
 * @param {Function} getProgramState - Fonction pour déterminer l'état d'un programme
 * @param {number} nodeSize - Taille des nœuds
 * @param {number} cellWidth - Largeur des cellules de grille
 * @param {number} cellHeight - Hauteur des cellules de grille
 * @returns {Array} Array d'objets de connexion avec style et clé unique
 */
export const generateConnectionsForProgram = (
  program, 
  allPrograms, 
  getProgramState, 
  nodeSize = 80,
  cellWidth = 140,
  cellHeight = 160
) => {
  const connections = [];

  // Si le programme n'a pas de déblocages, retourner un array vide
  if (!program.unlocks || program.unlocks.length === 0) {
    return connections;
  }

  // Calculer la position absolue du programme source
  const fromPos = calculateNodePosition(program.position, cellWidth, cellHeight);

  // Créer une connexion pour chaque programme débloqué
  program.unlocks.forEach(unlockedId => {
    const unlockedProgram = allPrograms.find(p => p.id === unlockedId);
    
    if (unlockedProgram) {
      const toPos = calculateNodePosition(unlockedProgram.position, cellWidth, cellHeight);
      const linePosition = calculateLinePosition(fromPos, toPos, nodeSize);
      const programState = getProgramState(unlockedProgram);
      const isUnlocked = programState !== 'LOCKED';
      const connectionStyle = getConnectionStyle(isUnlocked);

      connections.push({
        key: `${program.id}-${unlockedId}`,  // Clé unique pour React
        style: { ...linePosition, ...connectionStyle },
        fromId: program.id,
        toId: unlockedId,
        isUnlocked
      });
    }
  });

  return connections;
};

/**
 * Génère toutes les connexions pour un arbre de programmes complet
 * 
 * @param {Array} programs - Tous les programmes de l'arbre
 * @param {Function} getProgramState - Fonction pour déterminer l'état d'un programme
 * @param {number} nodeSize - Taille des nœuds
 * @returns {Array} Array de toutes les connexions
 */
export const generateAllConnections = (programs, getProgramState, nodeSize = 80) => {
  const allConnections = [];

  programs.forEach(program => {
    const programConnections = generateConnectionsForProgram(
      program,
      programs,
      getProgramState,
      nodeSize
    );
    allConnections.push(...programConnections);
  });

  return allConnections;
};

/**
 * Utilitaire pour débugger les connexions - affiche les informations dans la console
 * 
 * @param {Array} connections - Array des connexions
 */
export const debugConnections = (connections) => {
  console.log(`🔗 ${connections.length} connexions générées:`);
  connections.forEach(conn => {
    console.log(`  ${conn.fromId} → ${conn.toId} (${conn.isUnlocked ? '✅' : '🔒'})`);
  });
};
