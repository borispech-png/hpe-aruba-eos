# 📦 Installation de HPE EOS Manager

## 📥 Fichiers téléchargés

Vous avez reçu les fichiers suivants :

1. **hpe-eos-manager-app.tar.gz** (34 KB) - Archive complète du projet
2. **README.md** - Documentation complète
3. **DEMARRAGE-RAPIDE.md** - Guide de démarrage rapide
4. **extract-hpe-data.js** - Script d'extraction des données HPE

## 🚀 Installation Étape par Étape

### Windows

#### 1️⃣ Installer Node.js
```
1. Télécharger Node.js depuis : https://nodejs.org/
2. Choisir la version LTS (recommandée)
3. Lancer l'installateur
4. Accepter les options par défaut
5. Redémarrer votre ordinateur
```

#### 2️⃣ Extraire le projet
```
1. Clic droit sur "hpe-eos-manager-app.tar.gz"
2. Extraire avec 7-Zip ou WinRAR
   (ou utiliser Windows 11 qui supporte .tar.gz nativement)
3. Vous obtenez un dossier "hpe-eos-manager"
```

#### 3️⃣ Installer les dépendances
```
1. Ouvrir le dossier "hpe-eos-manager"
2. Dans la barre d'adresse, taper "cmd" et appuyer sur Entrée
3. Dans la fenêtre qui s'ouvre, taper :
   npm install
4. Attendre la fin (1-2 minutes)
```

#### 4️⃣ Lancer l'application
```
1. Dans la même fenêtre, taper :
   npm run dev
2. L'application s'ouvre automatiquement dans votre navigateur
3. URL : http://localhost:3000
```

### macOS / Linux

#### 1️⃣ Installer Node.js
```bash
# macOS avec Homebrew
brew install node

# Linux Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Linux Fedora
sudo dnf install nodejs npm
```

#### 2️⃣ Extraire et installer
```bash
# Extraire l'archive
tar -xzf hpe-eos-manager-app.tar.gz
cd hpe-eos-manager

# Installer les dépendances
npm install

# Lancer l'application
npm run dev
```

## 📊 Récupérer les données HPE

### Méthode automatique (recommandée)

1. Ouvrir : https://www.hpe.com/us/en/networking/end-of-sale-products.html
2. Appuyer sur **F12** (ouvre la console développeur)
3. Cliquer sur l'onglet **"Console"**
4. Ouvrir le fichier `extract-hpe-data.js` avec un éditeur de texte
5. **Copier tout le contenu**
6. **Coller** dans la console
7. Appuyer sur **Entrée**
8. Un fichier CSV est téléchargé automatiquement ! 🎉

### Méthode manuelle

1. Sur la page HPE, **sélectionner** les données du tableau
2. **Copier** avec Ctrl+C (Windows) ou Cmd+C (Mac)
3. Dans l'application, cliquer sur **"Importer"**
4. **Coller** les données
5. Cliquer sur **"Importer"**

## ✅ Vérification

L'application est correctement installée si :
- ✅ Le navigateur s'ouvre sur http://localhost:3000
- ✅ Vous voyez "HPE/Aruba EOS Manager"
- ✅ Des données d'exemple sont affichées
- ✅ Les boutons "Importer" et "Exporter" fonctionnent

## 🆘 Problèmes Courants

### "npm n'est pas reconnu"
**Solution** : Node.js n'est pas correctement installé
```
1. Redémarrer l'ordinateur
2. Ouvrir une nouvelle fenêtre de commande
3. Taper : node --version
4. Si erreur : réinstaller Node.js
```

### "Erreur lors de npm install"
**Solution** : Problème de permissions ou de réseau
```
1. Fermer la fenêtre de commande
2. Relancer en tant qu'administrateur (Windows)
3. Ou utiliser sudo sur Linux/Mac : sudo npm install
```

### "Port 3000 déjà utilisé"
**Solution** : Un autre programme utilise le port
```
L'application proposera automatiquement un autre port
OU
Fermer les autres applications Node.js en cours
```

### "Cannot find module"
**Solution** : Dépendances mal installées
```bash
# Supprimer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Utilisation Quotidienne

### Lancer l'application
```bash
cd hpe-eos-manager
npm run dev
```

### Arrêter l'application
Appuyer sur **Ctrl+C** dans la fenêtre de commande

### Créer une version production (optionnel)
```bash
npm run build
# Les fichiers sont dans le dossier "dist/"
```

## 📦 Mettre à jour

Pour mettre à jour l'application plus tard :
```bash
# Mettre à jour les dépendances
npm update

# Ou réinstaller complètement
rm -rf node_modules
npm install
```

## 🔧 Configuration Avancée

### Changer le port
Éditer `vite.config.js` :
```javascript
server: {
  port: 3001, // Changer ici
  open: true,
}
```

### Personnaliser les données
Éditer `src/App.jsx` et modifier la constante `SAMPLE_DATA`

## 📞 Support

### Logs utiles
```bash
# Voir la version de Node.js
node --version

# Voir la version de npm
npm --version

# Nettoyer le cache npm
npm cache clean --force
```

### Fichiers de log
En cas d'erreur, partager :
- Le contenu de la console
- Le fichier `package-lock.json`
- La version de Node.js

## 🎉 Prêt !

Votre application est maintenant installée et prête à l'emploi !

**Prochaines étapes :**
1. ✅ Lancer l'application : `npm run dev`
2. ✅ Extraire les données HPE avec le script
3. ✅ Importer dans l'application
4. ✅ Filtrer, trier, exporter selon vos besoins

**Bon travail ! 🚀**
