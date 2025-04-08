# TL;DR - Analyseur de Conditions Générales

Une extension Chrome qui permet d'analyser les conditions générales d'un site lors de l'inscription via l'API OpenAI ou Deepseek.

## Fonctionnalités

- Analyse des conditions générales d'utilisation des sites web
- Support de deux services d'IA : OpenAI et Deepseek
- Résumé clair et structuré des points importants dans une page dédiée
- Mise en évidence des éléments préoccupants pour la vie privée et la sécurité des données
- Stockage et organisation des analyses par site web
- Historique complet de toutes les analyses effectuées
- Extraction automatique des conditions générales depuis les pages web
- Interface utilisateur intuitive et moderne

## Services d'IA supportés

L'extension vous permet de choisir entre différents services d'IA pour analyser les conditions générales :

### OpenAI (GPT-3.5 Turbo)
- Excellente capacité de compréhension du langage juridique
- Analyse structurée et détaillée
- Mise en évidence précise des points importants
- Nécessite une clé API OpenAI (obtenue sur [OpenAI Platform](https://platform.openai.com/))

### Deepseek
- Alternative à OpenAI avec des performances similaires
- Peut offrir des analyses complémentaires
- Utile comme solution de secours en cas de problème avec OpenAI
- Nécessite une clé API Deepseek (obtenue sur [Deepseek AI](https://platform.deepseek.ai/))

### Pourquoi proposer deux services ?
- Redondance en cas d'indisponibilité d'un service
- Possibilité de comparer les analyses pour une meilleure compréhension
- Flexibilité pour les utilisateurs selon leurs préférences ou accès aux API
- Différentes limites de requêtes et tarifications selon les services

Pour obtenir les meilleurs résultats, nous recommandons d'essayer les deux services sur un même texte de conditions générales et de comparer les analyses.

## Installation

1. Téléchargez ou clonez ce dépôt sur votre ordinateur
2. Ouvrez Chrome et accédez à `chrome://extensions/`
3. Activez le "Mode développeur" (en haut à droite)
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier contenant les fichiers de l'extension

## Utilisation

1. Cliquez sur l'icône de l'extension dans la barre d'outils de Chrome
2. Entrez votre clé API OpenAI ou Deepseek (vous devez avoir un compte sur l'un de ces services)
3. Sélectionnez le service à utiliser dans le menu déroulant
4. Sur la page contenant des conditions générales :
   - Utilisez le bouton "Extraire automatiquement" pour détecter le texte des conditions
   - Ou copiez-collez le texte manuellement dans la zone de texte
5. Cliquez sur "Analyser" pour obtenir un résumé détaillé
6. Consultez les résultats dans une nouvelle page dédiée
7. Sauvegardez l'analyse pour y accéder ultérieurement

## Fonctionnalités avancées

### Historique des analyses
- Accédez à l'historique complet via le bouton "Historique" en haut de l'interface
- Visualisez toutes vos analyses précédentes triées par date
- Possibilité de supprimer des analyses individuelles ou tout l'historique

### Détection automatique des analyses précédentes
- Un bouton "Voir l'analyse sauvegardée" apparaît automatiquement lorsque vous revisitez un site déjà analysé

### Gestion des analyses
- Copiez les résultats dans le presse-papiers avec un simple clic
- Sauvegardez explicitement les analyses importantes
- Interface responsive pour une lecture confortable des résumés

## Configuration requise

- Google Chrome (version 88 ou supérieure)
- Une clé API OpenAI ou Deepseek valide

## Structure du projet

L'extension est organisée selon la structure suivante :

- `manifest.json` - Configuration de l'extension Chrome
- `popup.html` - Interface principale de l'extension
- `popup.css` - Styles pour l'interface principale
- `popup.js` - Script principal pour gérer les interactions de l'interface
- `content.js` - Script qui s'exécute sur les pages web pour extraire les conditions générales
- `results.html` - Page dédiée pour afficher les résultats d'analyse
- `results.css` - Styles pour la page de résultats
- `results.js` - Script pour gérer la page de résultats
- `history.html` - Page pour afficher l'historique des analyses
- `history.js` - Script pour gérer l'historique des analyses
- `images/` - Dossier contenant les icônes de l'extension
- `README.md` - Documentation du projet

### Flux de données

1. L'utilisateur entre sa clé API et sélectionne le service (OpenAI ou Deepseek)
2. Extraction du texte des conditions générales (manuelle ou automatique)
3. Envoi du texte à l'API sélectionnée pour analyse
4. Traitement et formatage des résultats
5. Affichage dans une page dédiée et stockage local
6. Organisation des analyses par site web dans l'historique

## Confidentialité

Cette extension utilise votre clé API OpenAI ou Deepseek pour analyser les conditions générales. Les données sont envoyées directement aux API respectives et ne sont stockées que localement dans votre navigateur. Les analyses sont stockées dans le stockage local de Chrome et peuvent être supprimées à tout moment. Votre clé API est stockée localement (via chrome.storage.sync) et n'est jamais partagée. 