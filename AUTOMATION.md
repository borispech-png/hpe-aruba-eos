# 🤖 Automatisation du Scraping avec GitHub Actions

Ce projet est configuré pour mettre à jour automatiquement les données des produits EOS.

## Comment ça marche ?

Un "workflow" GitHub Actions est défini dans `.github/workflows/weekly-scrape.yml`.

1.  **Fréquence** : Il s'exécute automatiquement **tous les lundis à 8h00**.
2.  **Action** :
    - Il installe l'environnement Node.js.
    - Il lance le script `node scrape-hpe-tables.js` (notre scraper robuste).
    - Il copie les données générées dans le dossier `public/` pour l'application.
3.  **Intelligence** :
    - Il vérifie si les fichiers ont changé par rapport à la semaine dernière.
    - **SI rien n'a bougé** : Il ne fait rien (pas de bruit inutile).
    - **SI des changements sont détectés** : Il crée automatiquement un "Commit" sur le dépôt git avec les nouvelles données.

## Prérequis

Pour que cela fonctionne, vous devez :

1.  Héberger ce projet sur **GitHub**.
2.  C'est tout ! GitHub Actions est activé par défaut.

## Lancer manuellement

Si vous ne voulez pas attendre lundi prochain :

1.  Allez sur votre dépôt GitHub.
2.  Cliquez sur l'onglet **Actions**.
3.  Sélectionnez **Weekly HPE/Aruba EOS Data Refresh**.
4.  Cliquez sur le bouton **Run workflow**.

---

_Note : Si vous utilisez la fonction d'enrichissement AI (Mistral), il faudra ajouter votre clé `MISTRAL_API_KEY` dans les "Secrets" du dépôt GitHub (Settings > Secrets and variables > Actions)._
