# 🚀 Guide de Démarrage Rapide

## Installation en 3 étapes

### 1️⃣ Installer Node.js (si pas déjà installé)
Télécharger depuis : https://nodejs.org/
Version recommandée : 18.x ou supérieure

### 2️⃣ Installer les dépendances
```bash
npm install
```
⏱️ Temps estimé : 1-2 minutes

### 3️⃣ Lancer l'application
```bash
npm run dev
```
✅ L'application s'ouvre automatiquement sur http://localhost:3000

## 📥 Comment récupérer les données HPE ?

### Option 1 : Script automatique (le plus simple)
1. Aller sur : https://www.hpe.com/us/en/networking/end-of-sale-products.html
2. Appuyer sur **F12** pour ouvrir la console
3. Copier tout le contenu du fichier `extract-hpe-data.js`
4. Coller dans la console et appuyer sur **Entrée**
5. Un fichier CSV est téléchargé automatiquement ! 🎉

### Option 2 : Import manuel
1. Sur la page HPE, sélectionner les données du tableau
2. Copier avec **Ctrl+C**
3. Dans l'application, cliquer sur **"Importer"**
4. Coller les données
5. Cliquer sur **"Importer"**

## 🎯 Fonctionnalités principales

### Recherche
Taper n'importe quel mot-clé dans la barre de recherche :
- Référence produit (ex: "J9979A")
- Description (ex: "Switch")
- Catégorie (ex: "OfficeConnect")

### Filtrage
Sélectionner une catégorie dans le menu déroulant pour voir uniquement ces produits.

### Tri
Cliquer sur les en-têtes de colonnes pour trier :
- 1er clic : tri croissant ↑
- 2ème clic : tri décroissant ↓
- 3ème clic : retour à l'ordre initial

### Export
- **Export CSV** : Pour ouvrir dans Excel
- **Copier** : Pour coller dans un email ou document

## 💡 Astuces

### Pour Excel
Le CSV exporté s'ouvre directement dans Excel avec le bon encodage français.

### Pour un rapport
1. Filtrer les produits souhaités
2. Copier le tableau
3. Coller dans Word/PowerPoint

### Pour suivre régulièrement
Planifier un rappel mensuel pour :
1. Visiter la page HPE
2. Lancer le script d'extraction
3. Comparer avec les données précédentes

## ⚡ Commandes utiles

```bash
# Lancer en développement
npm run dev

# Créer une version de production
npm run build

# Prévisualiser la version de production
npm run preview

# Réinstaller les dépendances
npm install
```

## 🆘 Problèmes courants

### "npm n'est pas reconnu"
➡️ Node.js n'est pas installé. Télécharger depuis nodejs.org

### "Port 3000 déjà utilisé"
➡️ Un autre programme utilise le port 3000. Le fermer ou l'application proposera un autre port.

### "Les données ne s'importent pas"
➡️ Vérifier le format : doit être CSV (avec ;) ou TSV (avec tabulations)

## 📞 Besoin d'aide ?

1. Lire le README.md complet
2. Vérifier que Node.js est bien installé : `node --version`
3. Vérifier que npm fonctionne : `npm --version`

## 🎉 C'est tout !

Vous êtes prêt à gérer efficacement vos produits HPE EOS !

**Bon travail ! 🚀**
