User Flow - Fitness RPG App
1. Première Visite (Nouvel Utilisateur)
A. Authentification
Écran de lancement
↓
Sign Up / Log In
↓
[Création compte ou connexion]
B. Onboarding
Écran Welcome
├─ Titre: "Bienvenue dans HybridRPG"
├─ Sous-titre: "Ton corps est ton avatar"
├─ Features (3 blocs):
│  ├─ Progression & XP
│  ├─ Arbre de Compétences
│  └─ Quêtes & Maîtrise
└─ CTA: "Commencer mon aventure"
    ↓
Écran de sélection de programmes
├─ Liste des programmes disponibles
├─ Chaque programme affiche:
│  ├─ Nom + Icon
│  ├─ Difficulté
│  ├─ Description courte
│  └─ Nombre de compétences
├─ Sélection: 1-2 programmes max
└─ Bouton "Valider ma sélection"
    ↓
[AUTOMATIQUE] Activation du/des programmes
├─ Ajout à activePrograms[]
├─ Génération queue initiale (première compétence, niveau 1)
└─ Redirection vers Home

2. Écran d'Accueil (Dashboard)
Home (Tableau de bord)
│
├─ HEADER
│  ├─ Nom utilisateur
│  ├─ Niveau actuel + badge
│  └─ Barre progression XP (X/100 XP)
│
├─ SECTION: Programmes Actifs (si activePrograms.length > 0)
│  ├─ Carte programme 1
│  │  ├─ Nom + emoji
│  │  ├─ Progression: "X compétences débloquées"
│  │  └─ Tap → Skill Tree
│  ├─ Carte programme 2 (si 2 programmes actifs)
│  └─ Bouton: "Gérer mes programmes"
│      ↓
│      ManageActivePrograms Screen
│      ├─ Liste programmes actifs
│      ├─ Bouton "Désactiver" par programme
│      └─ Bouton "Activer un nouveau programme" (si < 2)
│
├─ SECTION: Séances Recommandées (Queue)
│  ├─ Titre: "Prochaines séances disponibles"
│  ├─ Liste 3-4 séances max
│  │  ├─ Nom séance
│  │  ├─ Compétence + Niveau
│  │  ├─ Type (Force, Cardio, etc.)
│  │  └─ Bouton "Commencer"
│  │      ↓
│  │      Workout Screen
│  └─ Critères affichage:
│     ├─ Séance débloquée (prérequis OK)
│     ├─ Séance non complétée
│     └─ Programme actif
│
├─ SECTION: Dernières Séances
│  ├─ Liste 2-3 dernières complétées
│  │  ├─ Nom séance
│  │  ├─ Date relative ("Il y a 2 jours")
│  │  └─ XP gagné
│  └─ Bouton: "Voir tout l'historique"
│
└─ BOTTOM NAVIGATION
   ├─ Home (actif)
   ├─ Progression
   └─ Profil
État vide (Aucun programme actif)
Home sans programmes actifs
├─ Message: "Aucun programme actif"
├─ Sous-texte: "Active un programme pour voir tes séances"
└─ Bouton: "Activer un programme"
    ↓
    ManageActivePrograms Screen

3. Arbre de Compétences (Skill Tree)
Tap sur programme actif (depuis Home)
↓
SkillTree Screen
├─ HEADER
│  ├─ Nom du programme + icon
│  ├─ Progression globale (X/Y compétences)
│  └─ Bouton retour
│
├─ TREE VIEW (scrollable)
│  ├─ Compétences organisées par tiers
│  │  ├─ Node = Compétence
│  │  │  ├─ État: locked / available / in-progress / completed
│  │  │  ├─ Icon + Nom
│  │  │  └─ Indicateur niveau (X/Y niveaux)
│  │  └─ Lignes de connexion (prérequis)
│  │
│  └─ Tap sur compétence
│      ↓
│      Skill Detail Modal
│      ├─ Nom + Description
│      ├─ Difficulté
│      ├─ Stats bonuses
│      ├─ Prérequis (liste)
│      ├─ Niveaux disponibles
│      │  └─ Pour chaque niveau:
│      │     ├─ Nom niveau
│      │     ├─ État: locked / available / completed
│      │     └─ Bouton "Commencer"
│      │         ↓
│      │         Workout Screen
│      └─ Bouton fermer modal

4. Séance d'Entraînement (Workout)
Workout Screen
│
├─ HEADER
│  ├─ Nom niveau
│  ├─ Barre progression (% complété)
│  └─ Bouton "Abandonner" (avec confirmation)
│
├─ EXERCICE ACTUEL
│  ├─ Nom exercice
│  ├─ Description
│  ├─ Tips
│  ├─ RPE (intensité)
│  ├─ Info série: "Série X/Y"
│  ├─ Objectif: "Z reps" ou "Z secondes"
│  └─ Bouton: "Voir description complète"
│      ↓
│      Modal description
│
├─ INPUT UTILISATEUR
│  ├─ Label: "Combien de reps/secondes as-tu fait?"
│  ├─ Champ numérique
│  └─ Bouton "Valider la série"
│      ↓
│      [Si série < total] → Repos
│      [Si série = total & exercice < total] → Exercice suivant
│      [Si dernier exercice terminé] → WorkoutSummary Screen
│
├─ ÉCRAN REPOS (entre séries)
│  ├─ Timer countdown
│  ├─ Bouton "Passer le repos"
│  └─ Info: "Prochaine série: [nom exercice]"
│
└─ NAVIGATION
   └─ Info: "Exercice X/Y"
Fin de séance
WorkoutSummary Screen
├─ 🎉 Félicitations
├─ Récapitulatif:
│  ├─ XP gagné
│  ├─ Stats gagnées (Force +X, etc.)
│  ├─ Durée totale
│  └─ Score (% objectifs atteints)
├─ Niveau suivant débloqué? (si oui, afficher)
└─ Boutons:
   ├─ "Retour à l'accueil"
   └─ "Voir l'arbre de compétences"

5. Onglet Progression
Progression Screen
├─ Stats globales
│  ├─ Niveau global
│  ├─ XP total
│  └─ Streak (jours consécutifs)
│
├─ Graphiques progression
│  ├─ XP par semaine
│  └─ Séances par mois
│
├─ Historique séances
│  ├─ Liste chronologique
│  │  ├─ Date
│  │  ├─ Programme + Compétence
│  │  ├─ XP gagné
│  │  └─ Tap → Détail séance
│  └─ Filtre par programme
│
└─ Stats par programme
   ├─ Pour chaque programme actif:
   │  ├─ XP accumulé
   │  ├─ Compétences complétées
   │  └─ Temps total d'entraînement
   └─ Graphique radar (5 stats)

6. Onglet Profil
Profil Screen
├─ EN-TÊTE
│  ├─ Avatar/Initiales
│  ├─ Nom utilisateur
│  ├─ Niveau global + badge (Débutant, Guerrier, etc.)
│  └─ Barre XP
│
├─ SECTION: Caractéristiques (Stats)
│  ├─ Force: X
│  ├─ Endurance: X
│  ├─ Puissance: X
│  ├─ Vitesse: X
│  └─ Souplesse: X
│
├─ SECTION: Programmes
│  ├─ Bouton: "Gérer mes programmes"
│  └─ Bouton: "Parcourir les programmes"
│
├─ SECTION: Succès/Badges (futur)
│  └─ [À implémenter plus tard]
│
└─ SECTION: Paramètres
   ├─ Notifications
   ├─ Langue
   └─ Déconnexion

7. Gestion des Programmes Actifs
ManageActivePrograms Screen
├─ HEADER
│  ├─ Titre: "Mes programmes actifs"
│  └─ Info: "(Max 2 programmes)"
│
├─ SECTION: Programmes Actifs
│  ├─ Liste programmes actifs (1-2)
│  │  ├─ Nom + icon
│  │  ├─ Progression
│  │  └─ Bouton "Désactiver"
│  │      ↓
│  │      Confirmation modal
│  │      └─ [OK] → Retrait de activePrograms[]
│  └─ [Si aucun] Message: "Aucun programme actif"
│
├─ SECTION: Ajouter un Programme
│  ├─ Bouton: "Activer un nouveau programme"
│  │   ↓
│  │   [Si activePrograms.length >= 2]
│  │   → Alert: "Désactive un programme d'abord"
│  │   
│  │   [Si activePrograms.length < 2]
│  │   → ProgramSelection Modal/Screen
│  │      ├─ Liste programmes disponibles
│  │      ├─ Filtres (difficulté, type)
│  │      └─ Tap sur programme
│  │         ↓
│  │         Confirmation
│  │         └─ [OK] → Activation automatique
│  │            ├─ Ajout à activePrograms[]
│  │            ├─ Génération queue (niveau 1, compétence 1)
│  │            └─ Retour à Home
│  └─ Message si limite atteinte
│
└─ Bouton: "Retour"

8. Flow de Déblocage Progressif
Logique de déblocage des compétences
Programme activé
↓
Première compétence disponible (tier 0, pas de prérequis)
↓
User complète niveau 1
↓
Niveau 2 débloqué (même compétence)
↓
User complète tous les niveaux de la compétence
↓
Compétence marquée "completed"
↓
Compétences suivantes débloquées (selon prerequisites[])
↓
Queue mise à jour automatiquement
Critères d'affichage dans la queue
Pour qu'une séance apparaisse dans "Séances recommandées":
├─ Programme est dans activePrograms[]
├─ Compétence est débloquée (prérequis complétés)
├─ Niveau n'est pas encore complété
└─ Ordre: prochain niveau non complété de chaque compétence débloquée

9. Cas d'Usage Principaux
UC1: Premier entraînement
User ouvre l'app (première fois)
→ Onboarding
→ Sélection programme(s)
→ Activation automatique
→ Redirection Home
→ Voit "Séances recommandées"
→ Tap "Commencer" sur première séance
→ Workout Screen
→ Complète la séance
→ WorkoutSummary (gains XP/stats)
→ Retour Home (queue mise à jour)
UC2: Consultation progression
User sur Home
→ Tap onglet "Progression"
→ Voit graphiques + historique
→ Tap sur séance passée
→ Détail séance (exercices, score)
→ Retour Progression
UC3: Exploration arbre compétences
User sur Home
→ Tap sur carte "Programme actif"
→ SkillTree Screen
→ Explore les nœuds (compétences)
→ Tap sur compétence débloquée
→ Skill Detail Modal
→ Voit niveaux disponibles
→ Tap "Commencer niveau X"
→ Workout Screen
UC4: Changement de programme
User sur Home
→ Tap "Gérer mes programmes"
→ ManageActivePrograms Screen
→ Tap "Désactiver" sur programme actif
→ Confirmation
→ Tap "Activer un nouveau programme"
→ ProgramSelection
→ Tap sur nouveau programme
→ Activation automatique
→ Retour Home (queue mise à jour avec nouveau programme)

10. Navigation Globale
BOTTOM NAVIGATION (toujours visible)
├─ Home
│  └─ Écran d'accueil (dashboard)
├─ Progression
│  └─ Stats + Historique
└─ Profil
   └─ Stats détaillées + Paramètres

SCREENS SECONDAIRES (navigation modale/stack)
├─ SkillTree (depuis Home)
├─ Workout (depuis Home ou SkillTree)
├─ WorkoutSummary (depuis Workout)
├─ ManageActivePrograms (depuis Home ou Profil)
└─ ProgramSelection (depuis ManageActivePrograms ou Onboarding)

11. États et Conditions
État de l'app selon utilisateur
if (nouvel utilisateur) {
  → Onboarding complet
}

if (user.activePrograms.length === 0) {
  → Home affiche état vide + CTA "Activer un programme"
}

if (user.activePrograms.length > 0) {
  → Home affiche dashboard complet (programmes + queue)
}
Queue de séances
Génération automatique:
- Lors de l'activation d'un programme
- Après complétion d'une séance (si nouveau niveau débloqué)

Affichage:
- Max 4 séances visibles
- Triées par priorité (prochain niveau de chaque compétence active)
- Filtrées: seulement séances débloquées et non complétées

Résumé des Écrans Principaux

Onboarding (première visite uniquement)
Home (dashboard principal)
SkillTree (arbre de compétences)
Workout (séance d'entraînement)
WorkoutSummary (récapitulatif post-séance)
Progression (statistiques et historique)
Profil (stats détaillées + paramètres)
ManageActivePrograms (gestion programmes actifs)
ProgramSelection (sélection nouveaux programmes)

Navigation totale : 9 écrans principaux