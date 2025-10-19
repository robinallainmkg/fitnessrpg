# Play Store Assets - Guide de préparation

## 📋 Checklist des assets nécessaires

### 1. Icône de l'application (OBLIGATOIRE)
- **Dimensions** : 512 x 512 px
- **Format** : PNG (32-bit)
- **Important** : Pas de transparence, fond uni
- **Localisation** : `assets/icon.png` (à créer)

### 2. Feature Graphic (OBLIGATOIRE)
- **Dimensions** : 1024 x 500 px
- **Format** : JPG ou PNG
- **Contenu** : Image promotionnelle de l'app
- **Localisation** : À créer

### 3. Screenshots (MINIMUM 2, OBLIGATOIRE)
- **Dimensions min** : 320 px (côté court)
- **Dimensions max** : 3840 px (côté long)
- **Format** : PNG ou JPG
- **Quantité** : 2 minimum, 8 maximum

#### Screenshots recommandés :
1. **Écran d'accueil** avec les programmes et quêtes
2. **Workout en cours** avec timer et exercices
3. **Arbre de compétences** avec progression
4. **Graphiques de progression**
5. **Écran de profil** avec statistiques

### 4. Description courte (OBLIGATOIRE)
**80 caractères maximum**

Exemple :
```
Transforme tes workouts en quêtes RPG ! Gagne XP, monte de niveau 💪⚔️
```

### 5. Description complète (OBLIGATOIRE)
**4000 caractères maximum**

Voir contenu dans ce document.

### 6. Politique de confidentialité (OBLIGATOIRE)
**URL obligatoire**

Options :
- Héberger sur GitHub Pages
- Utiliser un générateur gratuit : https://app-privacy-policy-generator.nisrulz.com/
- Héberger sur votre site web

### 7. Catégorie (OBLIGATOIRE)
- **Catégorie recommandée** : Santé et remise en forme

### 8. Coordonnées (OBLIGATOIRE)
- **Email** : Visible publiquement
- **Téléphone** : Optionnel

## 🎨 Comment créer les assets

### Icône 512x512
Utilisez votre `assets/icon.png` actuel et redimensionnez-le à 512x512 px.

### Feature Graphic 1024x500
Créez une bannière avec :
- Logo de l'app
- Titre "FitnessRPG"
- Slogan "Transforme tes workouts en aventure"
- Fond violet (#7B61FF)

### Screenshots
1. Lancez l'app sur émulateur ou téléphone
2. Naviguez vers chaque écran important
3. Prenez des captures d'écran
4. Redimensionnez si nécessaire

## ⚠️ Erreurs courantes à éviter

- ❌ Icône avec transparence (doit avoir fond uni)
- ❌ Screenshots de mauvaise qualité ou pixelisés
- ❌ Description avec fautes d'orthographe
- ❌ Feature Graphic sans texte lisible
- ❌ Moins de 2 screenshots

## 📝 Politique de confidentialité - Template

Si vous n'avez pas encore de politique de confidentialité, voici un template minimal :

```markdown
# Politique de confidentialité - FitnessRPG

Date d'effet : 9 octobre 2025

## Collecte de données

FitnessRPG collecte les données suivantes :
- Adresse email (pour l'authentification)
- Données de progression (workouts, XP, niveaux)
- Statistiques d'entraînement

## Utilisation des données

Les données sont utilisées uniquement pour :
- Synchroniser votre progression entre appareils
- Afficher vos statistiques personnelles
- Améliorer l'expérience utilisateur

## Stockage des données

Les données sont stockées de manière sécurisée sur Firebase (Google Cloud).

## Partage des données

Nous ne partageons JAMAIS vos données avec des tiers.

## Suppression des données

Vous pouvez demander la suppression de vos données en contactant : [VOTRE EMAIL]

## Contact

Pour toute question : [VOTRE EMAIL]
```

## 🚀 Prochaines étapes

1. ✅ Compléter "Store listing" avec toutes les infos
2. ✅ Upload des assets graphiques
3. ✅ Créer et héberger la politique de confidentialité
4. ✅ Faire un "Closed test" (test fermé) obligatoire
5. ✅ Attendre 14 jours avec 20 testeurs minimum
6. ✅ Ensuite seulement : publier en production
