# 📦 HPE/Aruba EOS Manager

Application React moderne pour gérer les produits HPE et Aruba en **fin de commercialisation** (End of Sale).

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🎯 Fonctionnalités

### ✨ Principales
- 📊 **Tableau interactif** avec tri multi-colonnes
- 🔍 **Recherche en temps réel** sur tous les champs
- 🏷️ **Filtrage par catégorie** de produits
- 📈 **Statistiques en temps réel** (total, catégories, remplacements)
- 📥 **Export CSV** avec encodage UTF-8 (compatible Excel)
- 📋 **Copie rapide** du tableau vers le presse-papiers
- 📲 **Import de données** en CSV/TSV

### 🎨 Interface
- Design moderne et responsive
- Thème HPE avec couleurs officielles
- Animations fluides
- Compatible mobile et desktop
- Impression optimisée

### 🔒 Sécurité
- Validation des données importées
- Pas de dépendances externes sensibles
- Code open source auditable

## 🚀 Installation Rapide

### Prérequis
- Node.js 18+ ([télécharger](https://nodejs.org/))
- npm ou yarn

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en mode développement
npm run dev

# 3. Ouvrir http://localhost:3000
```

L'application s'ouvrira automatiquement dans votre navigateur ! 🎉

## 📖 Guide d'utilisation

### 1️⃣ Extraire les données depuis HPE

Deux méthodes pour récupérer les données :

#### Méthode A : Script automatique (recommandé)

1. Ouvrir la page : https://www.hpe.com/us/en/networking/end-of-sale-products.html
2. Ouvrir la console (F12)
3. Copier-coller le contenu de `extract-hpe-data.js`
4. Appuyer sur Entrée
5. Le fichier CSV est téléchargé automatiquement ✅

#### Méthode B : Copie manuelle

1. Sélectionner les données du tableau sur la page HPE
2. Copier (Ctrl+C)
3. Dans l'application, cliquer sur "Importer"
4. Coller les données
5. Cliquer sur "Importer"

### 2️⃣ Utiliser l'application

#### Recherche
- Taper dans la barre de recherche
- La recherche se fait sur : référence, description, remplacement

#### Filtrage
- Sélectionner une catégorie dans le menu déroulant
- Combine avec la recherche pour affiner

#### Tri
- Cliquer sur les en-têtes de colonnes
- Tri ascendant → descendant → neutre

#### Export
- **CSV** : Cliquer sur "Exporter CSV" (compatible Excel)
- **Copie** : Cliquer sur "Copier" pour le presse-papiers

### 3️⃣ Formats d'import supportés

#### Format CSV (point-virgule)
```csv
Catégorie;Référence;Description;Réf. Rempl.;Desc. Rempl.;Date
HPE Switch;J9979A;Switch 8G;JL380A;Switch 8G New;2018-12-31
```

#### Format TSV (tabulation)
```tsv
Catégorie	Référence	Description	Réf. Rempl.	Desc. Rempl.	Date
HPE Switch	J9979A	Switch 8G	JL380A	Switch 8G New	2018-12-31
```

## 🏗️ Structure du projet

```
hpe-eos-manager/
├── src/
│   ├── App.jsx              # Composant principal
│   ├── main.jsx             # Point d'entrée React
│   └── index.css            # Styles Tailwind
├── public/                  # Assets statiques
├── index.html               # Page HTML
├── package.json             # Dépendances
├── vite.config.js           # Config Vite
├── tailwind.config.js       # Config Tailwind
├── postcss.config.js        # Config PostCSS
├── extract-hpe-data.js      # Script d'extraction
└── README.md                # Documentation
```

## 🔧 Scripts disponibles

```bash
# Développement avec hot-reload
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

## 🎨 Personnalisation

### Couleurs HPE
Le thème utilise les couleurs officielles HPE :
```javascript
colors: {
  'hpe-green': '#01A982',
  'hpe-dark': '#425563',
}
```

### Modifier les données par défaut
Éditer `src/App.jsx` et modifier la constante `SAMPLE_DATA`.

### Ajouter des colonnes
1. Ajouter le champ dans `SAMPLE_DATA`
2. Ajouter l'en-tête dans le tableau
3. Ajouter la cellule correspondante

## 📊 Statistiques affichées

- **Total Produits** : Nombre total de produits EOS
- **Catégories** : Nombre de catégories distinctes
- **Avec Remplacement** : Produits ayant un remplacement identifié
- **Résultats Filtrés** : Nombre après recherche/filtrage

## 🐛 Dépannage

### L'application ne démarre pas
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Le CSV n'affiche pas correctement dans Excel
- Le fichier utilise l'encodage UTF-8 avec BOM
- Utiliser "Importer des données" dans Excel
- Sélectionner "Délimité" puis "Point-virgule"

### Les icônes ne s'affichent pas
```bash
# Vérifier l'installation de lucide-react
npm install lucide-react
```

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

Les fichiers sont générés dans `dist/` et prêts à être déployés.

### Hébergement recommandé
- **Vercel** : `vercel deploy`
- **Netlify** : `netlify deploy`
- **GitHub Pages** : Via GitHub Actions
- **Serveur web** : Copier le contenu de `dist/`

## 📝 Cas d'usage métier

### Pour les achats IT
- ✅ Identifier rapidement les produits obsolètes
- ✅ Planifier les remplacements
- ✅ Comparer références anciennes/nouvelles
- ✅ Exporter pour rapports clients

### Pour les commerciaux
- ✅ Conseiller les clients sur les migrations
- ✅ Présenter les alternatives disponibles
- ✅ Créer des listes de renouvellement

### Pour la direction
- ✅ Vue d'ensemble des produits EOS
- ✅ Statistiques par catégorie
- ✅ Export pour analyses budgétaires

## 🔐 Confidentialité

- ✅ **100% local** : Aucune donnée n'est envoyée vers un serveur
- ✅ **Pas de cookies** : Aucun tracking
- ✅ **Pas d'analytics** : Respect total de la vie privée

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit (`git commit -m 'Ajout fonctionnalité'`)
4. Push (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

## 👨‍💻 Auteur

Développé avec ❤️ pour les équipes IT et procurement du secteur public.

## 🆘 Support

Pour toute question ou problème :
1. Consulter ce README
2. Vérifier les issues GitHub
3. Ouvrir une nouvelle issue si nécessaire

## 🎓 Technologies utilisées

- **React 18.3** - Framework UI
- **Vite 6** - Build tool ultra-rapide
- **Tailwind CSS 3.4** - Framework CSS utility-first
- **Lucide React** - Icônes modernes
- **PostCSS** - Traitement CSS

## 🔄 Roadmap

### Version 1.1 (à venir)
- [ ] Comparaison de prix ancien/nouveau produit
- [ ] Graphiques de répartition par catégorie
- [ ] Export Excel avancé (avec formules)
- [ ] Mode sombre
- [ ] Sauvegarde locale (localStorage)

### Version 1.2
- [ ] API REST pour synchronisation
- [ ] Multi-utilisateurs
- [ ] Historique des changements
- [ ] Notifications de nouveaux EOS

## 📚 Ressources

- [Documentation React](https://react.dev/)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)
- [Page officielle HPE EOS](https://www.hpe.com/us/en/networking/end-of-sale-products.html)

---

**⭐ Si ce projet vous est utile, n'oubliez pas de mettre une étoile !**
