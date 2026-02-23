# Wami Pisciculture - Application Mobile

Application mobile de gestion intelligente de pisciculture avec contrôle de robot poisson.

## 🐟 Fonctionnalités

### 1. **Tableau de Bord - Suivi de la Qualité de l'Eau**
- Surveillance en temps réel des paramètres de l'eau
- Affichage des valeurs : température, pH, oxygène, ammoniaque, turbidité, salinité
- Indicateurs de statut colorés (optimal, acceptable, danger)
- Graphiques d'historique sur 24h
- Rafraîchissement par pull-to-refresh

### 2. **Prédictions**
- Analyse prédictive basée sur l'IA
- Prédictions sur différentes périodes (24h, 7j, 30j)
- Graphiques de tendances
- Alertes prédictives avec recommandations
- Sélection de paramètres multiples

### 3. **Recommandations**
- Actions suggérées pour optimiser la pisciculture
- Priorisation des recommandations (urgent, modéré, faible)
- Instructions détaillées étape par étape
- Estimation du temps et impact des actions
- Interface intuitive avec modales détaillées

### 4. **Assistant IA (Chatbot)**
- Communication par texte ou vocal
- Reconnaissance vocale pour les questions
- Synthèse vocale pour les réponses
- Actions rapides prédéfinies
- Historique de conversation
- Réponses contextuelles basées sur les données

### 5. **Contrôle du Robot Poisson**
- Pilotage directionnel (avant, arrière, gauche, droite)
- Contrôle de profondeur (monter, descendre)
- Modes de fonctionnement : surveillance, inspection, nettoyage, alimentation
- Affichage du statut en temps réel (batterie, profondeur, vitesse)
- Vue caméra en direct
- Paramètres : mode automatique, caméra, éclairage
- Bouton d'arrêt d'urgence

## 🚀 Installation

### Prérequis

1. **Node.js** (version 18 ou supérieure)
   - Télécharger depuis : https://nodejs.org/

2. **Expo Go** (sur votre téléphone)
   - iOS : https://apps.apple.com/app/expo-go/id982107779
   - Android : https://play.google.com/store/apps/details?id=host.exp.exponent

### Étapes d'installation

1. **Installer les dépendances**
   ```bash
   cd c:\Users\pc\Documents\ProjetWami
   npm install
   ```

2. **Lancer l'application**
   ```bash
   npm start
   ```

3. **Scanner le QR code**
   - Ouvrez Expo Go sur votre téléphone
   - Scannez le QR code affiché dans le terminal
   - L'application se chargera sur votre téléphone

## 📱 Utilisation

### Navigation
L'application utilise une navigation par onglets en bas de l'écran :
- 🌊 **Tableau de bord** : Vue d'ensemble de la qualité de l'eau
- 📊 **Prédiction** : Analyse prédictive
- 💡 **Recommandations** : Actions suggérées
- 💬 **Assistant** : Chatbot IA
- 🤖 **Robot** : Contrôle du robot poisson

### Interaction avec le Chatbot
- **Mode texte** : Tapez votre question et appuyez sur envoyer
- **Mode vocal** : Maintenez le bouton micro enfoncé pour parler
- **Actions rapides** : Utilisez les boutons prédéfinis pour des questions courantes

### Contrôle du Robot
- Utilisez les flèches directionnelles pour déplacer le robot
- Changez de mode selon l'activité souhaitée
- Activez/désactivez la caméra et l'éclairage selon les besoins
- Le bouton d'arrêt d'urgence stoppe immédiatement le robot

## 🔧 Configuration de l'API

Pour connecter l'application à votre backend :

1. Ouvrez `src/services/api.js`
2. Modifiez la constante `API_BASE_URL` avec l'URL de votre API :
   ```javascript
   const API_BASE_URL = 'https://votre-api.com/api';
   ```

### Endpoints API requis

L'application s'attend à ces endpoints :

#### Qualité de l'eau
- `GET /water-quality/current` - Données actuelles
- `GET /water-quality/history` - Historique

#### Prédictions
- `GET /predictions` - Prédictions
- `GET /predictions/alerts` - Alertes

#### Recommandations
- `GET /recommendations` - Liste des recommandations
- `POST /recommendations/:id/apply` - Appliquer une recommandation

#### Chatbot
- `POST /chatbot/message` - Envoyer un message
- `POST /chatbot/transcribe` - Transcrire l'audio

#### Robot
- `GET /robot/status` - Statut du robot
- `POST /robot/command` - Envoyer une commande
- `POST /robot/mode` - Changer le mode
- `PATCH /robot/settings` - Modifier les paramètres
- `POST /robot/emergency-stop` - Arrêt d'urgence

#### Authentification
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion

## 🎨 Personnalisation

### Couleurs
Les couleurs principales sont définies dans chaque écran. Pour modifier le thème :
- Bleu cyan : `#0891b2` (Tableau de bord)
- Violet : `#6366f1` (Prédictions)
- Vert : `#10b981` (Recommandations)
- Rose : `#ec4899` (Assistant)
- Bleu : `#3b82f6` (Robot)

### Icônes
L'application utilise `@expo/vector-icons` (Ionicons). Consultez :
https://icons.expo.fyi/

## 📦 Structure du Projet

```
ProjetWami/
├── App.js                      # Point d'entrée, navigation
├── app.json                    # Configuration Expo
├── package.json                # Dépendances
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.js         # Suivi qualité eau
│   │   ├── PredictionScreen.js        # Prédictions
│   │   ├── RecommendationsScreen.js   # Recommandations
│   │   ├── ChatbotScreen.js           # Assistant IA
│   │   └── RobotControlScreen.js      # Contrôle robot
│   ├── components/
│   │   └── WaterQualityCard.js        # Carte paramètre eau
│   └── services/
│       └── api.js                      # Services API
└── assets/                     # Images et ressources
```

## 🔐 Sécurité

- Les tokens d'authentification sont stockés de manière sécurisée avec AsyncStorage
- Les requêtes API incluent automatiquement le token d'authentification
- Gestion automatique de l'expiration des tokens

## 🐛 Dépannage

### L'application ne démarre pas
- Vérifiez que Node.js est installé : `node --version`
- Supprimez `node_modules` et réinstallez : `npm install`
- Effacez le cache Expo : `npx expo start -c`

### Erreurs de connexion API
- Vérifiez que l'URL de l'API est correcte dans `api.js`
- Assurez-vous que votre backend est accessible
- Vérifiez les logs de la console pour plus de détails

### Problèmes de permissions (audio/caméra)
- Accordez les permissions dans les paramètres de votre téléphone
- Redémarrez l'application après avoir accordé les permissions

## 📝 Développement Futur

### Fonctionnalités à ajouter
- [ ] Notifications push pour les alertes critiques
- [ ] Graphiques interactifs avec zoom
- [ ] Export des données en CSV/PDF
- [ ] Mode hors ligne avec synchronisation
- [ ] Gestion multi-bassins
- [ ] Intégration avec des capteurs IoT
- [ ] Historique détaillé des actions du robot
- [ ] Partage de données avec d'autres utilisateurs
- [ ] Rapports automatiques hebdomadaires/mensuels

### Améliorations techniques
- [ ] Tests unitaires et d'intégration
- [ ] Optimisation des performances
- [ ] Support du mode sombre
- [ ] Internationalisation (i18n)
- [ ] Amélioration de l'IA du chatbot avec un vrai LLM
- [ ] Streaming vidéo en temps réel du robot
- [ ] WebSocket pour les mises à jour en temps réel

## 🤝 Contribution

Pour contribuer au projet :
1. Créez une branche pour votre fonctionnalité
2. Committez vos changements
3. Créez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Support

Pour toute question ou problème :
- Créez une issue sur le repository
- Contactez l'équipe de développement

---

**Développé avec ❤️ pour la gestion intelligente de pisciculture**
