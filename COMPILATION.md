# Instructions de Compilation et Lancement

## ⚠️ Prérequis Important

Ce projet iOS **nécessite Xcode** pour être compilé et exécuté. VS Code peut être utilisé pour l'édition du code, mais la compilation doit se faire via Xcode.

## 🚀 Étapes de Compilation

### 1. Installation des Prérequis
- **Xcode 15.0+** (disponible sur le Mac App Store)
- **iOS 16.0+** (pour les tests)
- **macOS** (requis pour le développement iOS)

### 2. Configuration Firebase
Avant de compiler, vous devez configurer Firebase :

1. Créer un projet sur [Firebase Console](https://console.firebase.google.com/)
2. Ajouter une app iOS avec bundle ID : `com.example.FitnessGameApp`
3. Télécharger `GoogleService-Info.plist`
4. Placer le fichier dans le dossier `FitnessGameApp/` du projet

### 3. Ouverture dans Xcode
```bash
# Naviguer vers le projet
cd FitnessGameApp

# Ouvrir dans Xcode
open FitnessGameApp.xcodeproj
```

### 4. Configuration du Projet dans Xcode
1. Sélectionner le projet dans le navigateur
2. Dans l'onglet "Signing & Capabilities" :
   - Choisir votre équipe de développement
   - Xcode génèrera automatiquement un provisioning profile
3. Ajouter `GoogleService-Info.plist` au projet (drag & drop)

### 5. Installation des Dépendances
Le projet utilise Swift Package Manager. Dans Xcode :
1. File → Add Package Dependencies
2. Ajouter : `https://github.com/firebase/firebase-ios-sdk`
3. Sélectionner les packages :
   - FirebaseAuth
   - FirebaseFirestore
   - FirebaseFirestoreSwift

### 6. Compilation et Exécution
1. Sélectionner un simulateur iOS (iPhone 15, iOS 16+)
2. Appuyer sur ▶️ (Run) ou Cmd+R
3. L'app se lance dans le simulateur

## 🛠 Dépannage

### Erreurs Courantes

**"No such module 'Firebase'"**
- Vérifier que les packages Firebase sont bien ajoutés
- Clean Build Folder (Cmd+Shift+K) puis rebuilder

**"GoogleService-Info.plist not found"**
- Vérifier que le fichier est ajouté au projet
- S'assurer qu'il est dans le target "FitnessGameApp"

**Erreurs de signature de code**
- Vérifier la configuration de l'équipe de développement
- Utiliser un bundle ID unique si nécessaire

### Tests sur Appareil Réel
Pour tester sur un appareil iOS :
1. Connecter l'iPhone/iPad via USB
2. Trust the computer sur l'appareil
3. Sélectionner l'appareil dans Xcode
4. Compiler et exécuter

## 📱 Fonctionnalités Testables
Une fois l'app lancée, vous pourrez tester :
- ✅ Création de compte / Connexion
- ✅ Navigation dans les programmes
- ✅ Démarrage d'une séance d'entraînement
- ✅ Timer de repos entre séries
- ✅ Saisie des répétitions
- ✅ Calcul automatique du score
- ✅ Graphiques de progression
- ✅ Profil utilisateur et statistiques

## 🔧 Configuration Additionnelle

### Règles Firestore
Configurer les règles de sécurité dans Firebase Console :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /userProgress/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /workoutSessions/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Authentification Firebase
Activer "Email/Password" dans Firebase Console → Authentication → Sign-in method
