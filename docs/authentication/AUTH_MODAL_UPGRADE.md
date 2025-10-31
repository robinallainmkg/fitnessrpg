# 🔐 AuthModal - Système d'authentification RPG unifié

## Vue d'ensemble

Remplacement de `SignupModal` par `AuthModal` - un système d'authentification modernisé avec design RPG cohérent.

## ✨ Nouvelles fonctionnalités

### 1. **Authentification flexible**
- ✅ **Email** : Authentification par email (en développement)
- ✅ **Téléphone** : Authentification par SMS (actif)
- ✅ **Auto-détection** : Détecte automatiquement le type d'identifiant

### 2. **Expérience utilisateur améliorée**
- 🎨 Design RPG cohérent avec le reste de l'app
- 🔄 Un seul modal pour connexion ET inscription
- 🚫 **Pas de mot de passe** : Authentification par code uniquement
- 💡 Messages d'aide contextuels

### 3. **Flow simplifié**

**Étape 1 : Identifiant**
```
Entre ton email ou numéro de téléphone
→ Auto-détection du type
→ Envoi du code de vérification
```

**Étape 2 : Vérification**
```
Code à 6 chiffres reçu
→ Vérification
→ Connexion automatique (nouveau compte créé si nécessaire)
```

## 🎨 Design RPG

### Couleurs
- **Background** : `#0F172A` (dark slate)
- **Header** : Gradient `#1A2244` → `#2D3A5F`
- **Accents** : `#4D9EFF` (neon blue)
- **Bordures** : `rgba(77, 158, 255, 0.3)` (glow effect)

### Icônes
- 🛡️ Shield : Sécurité
- ⚔️ Épée : Titre principal
- 📱 Smartphone : Téléphone
- 📧 Email : Email
- 🔑 Clé : Code de vérification

### Effets visuels
- Glow effects sur les bordures
- Gradients sur les boutons
- Ombres portées neon
- Animations fluides

## 📋 Migration depuis SignupModal

### Avant (SignupModal)
```javascript
<SignupModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => handleSuccess()}
  guestData={guestData}
/>
```

### Après (AuthModal)
```javascript
<AuthModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => handleSuccess()}
  guestData={guestData}
/>
```

**Note** : L'API est identique, remplacement drop-in !

## 🔧 Implémentation technique

### Détection d'identifiant
```javascript
const detectIdentifierType = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[\d\s+()-]+$/;
  
  if (emailRegex.test(value)) return 'email';
  if (phoneRegex.test(value.replace(/\s/g, ''))) return 'phone';
  return null;
};
```

### Flow authentification téléphone
```javascript
// Étape 1 : Envoi SMS
const result = await sendVerificationCode(phoneNumber);
setConfirmation(result.confirmation);
setStep('verify');

// Étape 2 : Vérification code
const result = await verifyCode(confirmation, code);
if (result.success) {
  // Utilisateur connecté !
  // Nouveau compte créé automatiquement si première connexion
}
```

### Sauvegarde données invité
```javascript
if (guestData && result.user) {
  await firestore()
    .collection('users')
    .doc(result.user.uid)
    .set({
      phoneNumber: identifier,
      userProgress: guestData.programs || {},
      activePrograms: guestData.activePrograms || [],
      selectedPrograms: guestData.selectedPrograms || [],
    }, { merge: true });
}
```

## 🚀 Fonctionnalités futures

### Email avec code
```javascript
// TODO: Implémenter sendgrid ou Firebase Email Link
if (type === 'email') {
  // Envoyer code par email
  const code = generateVerificationCode();
  await sendEmailWithCode(email, code);
  
  // Stocker code temporairement (ex: Firestore)
  await storeVerificationCode(email, code);
  
  setStep('verify');
}
```

### Vérification email
```javascript
// TODO: Vérifier le code saisi
const handleVerifyEmailCode = async () => {
  const isValid = await verifyEmailCode(email, code);
  
  if (isValid) {
    // Créer/connecter utilisateur Firebase Auth
    const result = await auth().signInWithCustomToken(customToken);
  }
};
```

## 📱 Exemple d'utilisation

### ProfileScreen (Mode invité → Connexion)
```javascript
import AuthModal from '../components/AuthModal';

const ProfileScreen = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isGuest, user } = useAuth();
  
  return (
    <>
      {isGuest && (
        <TouchableOpacity onPress={() => setShowAuthModal(true)}>
          <Text>✨ Créer mon compte</Text>
        </TouchableOpacity>
      )}
      
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          // Recharger les données
        }}
        guestData={{
          programs: userPrograms,
          activePrograms: activePrograms,
          selectedPrograms: selectedPrograms
        }}
      />
    </>
  );
};
```

## 🎯 Avantages

### UX
- ✅ Plus simple : un seul champ
- ✅ Plus rapide : pas de mot de passe
- ✅ Plus sécurisé : codes temporaires
- ✅ Plus clair : nouveau vs existant géré automatiquement

### Design
- ✅ Cohérent avec le thème RPG
- ✅ Visuellement attrayant
- ✅ Animations fluides
- ✅ Feedback clair

### Technique
- ✅ Code plus propre
- ✅ Moins de branches conditionnelles
- ✅ Meilleure gestion d'erreurs
- ✅ Extensible (email à venir)

## 🐛 Debugging

### Logs utiles
```javascript
console.log('📱 Envoi SMS à:', identifier);
console.log('🔐 Vérification code SMS...');
console.log('✅ Authentification réussie !');
console.log('💾 Sauvegarde des programmes invité...');
```

### Erreurs courantes

**"Format invalide"**
- Vérifier regex email/phone
- Tester avec : `+33612345678` ou `test@email.com`

**"Impossible d'envoyer le SMS"**
- Vérifier configuration Firebase Auth
- Vérifier numéro au format international (+33...)

**"Code incorrect"**
- Vérifier que le code n'a pas expiré (10 min)
- Redemander un code

## 🔒 Sécurité

- ✅ Codes expiration automatique (Firebase)
- ✅ Rate limiting sur envoi de codes
- ✅ Validation côté serveur Firebase
- ✅ HTTPS obligatoire
- ✅ Pas de stockage de mots de passe

## 📚 Références

- [Firebase Phone Auth](https://rnfirebase.io/auth/phone-authentication)
- [Firebase Email Link Auth](https://rnfirebase.io/auth/email-link-authentication)
- [RPG Theme Guide](../RPG_THEME_GUIDE.md)
