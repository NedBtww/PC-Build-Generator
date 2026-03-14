# SaaS ConfigBuilder

Générateur de configurations PC prébuild en ligne à partir d’un budget et d’un usage (gaming, montage, etc.).  
L’utilisateur indique son budget et son usage principal, et l’outil propose 1 à 2 PC prébuild optimisés.

## Fonctionnalités

- Saisie du budget et de l’usage (1080p, 1440p, 4K, e-sport…).
- Sélection intelligente de 1 à 2 PC :
  - 1 PC sous le budget (le plus proche possible).
  - 1 PC légèrement au-dessus (max +100 €).
- Fiches détaillées (CPU, GPU, RAM, stockage, prix, lien marchand).
- Données basées sur un fichier `prebuild_pc.json` de PCs prébuild.
- Design responsive pensé pour un usage desktop et mobile.
- Message d’avertissement : les prix sont gérés par les sites marchands.

## Tech Stack

- Frontend : HTML, CSS, JavaScript (vanilla).
- Backend : Node.js + Express.
- Données : fichier JSON (`prebuild_pc.json`) contenant les PC prébuild.

## Installation (local)

1. Cloner le projet :
   
git clone https://github.com/<ton-user>/Saas_ConfigBuilder.git
cd Saas_ConfigBuilder

2. Installer les dépendances :

npm install


3. Lancer le serveur en local :

node server.js

L’application sera accessible sur `http://localhost:3000` (ou le port configuré).

## Utilisation

1. Ouvrir la page d’accueil dans le navigateur.
2. Entrer un budget (en €).
3. Choisir un usage (ex. “1080p gaming”, “1440p”, “4K”, etc.).
4. Lancer la génération pour voir les configurations recommandées.
5. Cliquer sur “Voir le PC” pour être redirigé vers le site marchand.

Les prix affichés sont indicatifs : ils sont gérés directement par les sites marchands (stocks et promotions indépendants).

## Roadmap (idées futures)

- Compte utilisateur et historique des recherches.
- Limite gratuite par jour + offre premium illimitée.
- Intégration plus avancée de liens d’affiliation.
- Support des configurations PC à monter soi‑même.
- Mode “débutant / confirmé” avec plus ou moins de détails.
