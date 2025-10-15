# Configuration GitHub Actions pour Build Android

## 🔐 Secrets à ajouter dans GitHub

Va sur ton repo GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Secrets requis :

1. **EXPO_TOKEN** (pour Expo CLI)
   - Va sur https://expo.dev/accounts/robinouchallain/settings/access-tokens
   - Crée un token
   - Copie-le dans un secret nommé `EXPO_TOKEN`

2. **ANDROID_KEYSTORE_BASE64** (pour signer l'APK)
   - Tu dois encoder ton keystore en base64
   - Commande PowerShell :
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("chemin/vers/ton/keystore.jks")) | Out-File keystore.txt
   ```
   - Copie le contenu du fichier `keystore.txt` dans un secret nommé `ANDROID_KEYSTORE_BASE64`

3. **KEYSTORE_PASSWORD**
   - Le mot de passe de ton keystore

4. **KEY_ALIAS**
   - L'alias de ta clé (généralement le nom que tu as donné lors de la création)

5. **KEY_PASSWORD**
   - Le mot de passe de la clé

## 🎯 Firebase Config (si tu as des variables d'environnement)

Ajoute aussi tous tes `EXPO_PUBLIC_*` :
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- etc.

## ✅ Utilisation

### Build automatique
Le build se lance automatiquement à chaque push sur `main`.

### Build manuel
1. Va sur GitHub → **Actions**
2. Sélectionne "Build Android APK"
3. Clique sur **Run workflow**
4. Attends 10-15 minutes
5. Télécharge l'artifact (APK ou AAB)

## 🆚 Alternatives gratuites

### Option 2 : Codemagic
- 500 minutes/mois gratuit
- Interface plus simple
- https://codemagic.io

### Option 3 : Bitrise
- Plan gratuit limité
- https://www.bitrise.io

### Option 4 : Build local (le plus simple maintenant)
```bash
npx eas build --platform android --profile production --local
```
Avantages :
- ✅ Totalement gratuit
- ✅ Pas de limite
- ✅ Contrôle total
Inconvénients :
- ⏱️ Utilise ton CPU (~30-45 min)
- 💾 Utilise ton disque (~15 GB d'espace)

## 💡 Recommandation

**Pour tester rapidement maintenant** : `eas build --local`

**Pour setup CI/CD long terme** : GitHub Actions
