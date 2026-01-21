import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, Filter, TrendingDown, Package, Calendar, ArrowUpDown, FileDown, Check, ChevronDown, FileSpreadsheet, AlertCircle, Sparkles, Bot } from 'lucide-react';
// Données d'exemple basées sur l'image fournie
import { exportToProfessionalExcel } from './excelExport';
import { initDB, saveProductsToDB, getProductsFromDB } from './db';

const SAMPLE_DATA = [
  {
    id: 1,
    category: "HPE OfficeConnect 1820 Switch Series",
    productNumber: "J9979A",
    productDescription: "HPE OfficeConnect 1820 8G Switch",
    replacementProductNumber: "JL380A",
    replacementProductDescription: "HPE OfficeConnect 1820 8G (J9979A) Switch",
    endOfSaleDate: "2018-12-31",
    notes: ""
  },
  // ... (Garder quelques samples pour la démo si vide)
];


const HPEEOSManager = () => {
  // États principaux
  const [products, setProducts] = useState(SAMPLE_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'productNumber', direction: 'asc' });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [selectedComparisonProduct, setSelectedComparisonProduct] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Chargement initial
  // Chargement initial
  useEffect(() => {
    const loadData = async () => {
      let currentData = [];

      // 1. D'abord charger la base locale (vos 7700 lignes)
      try {
        const dbData = await getProductsFromDB();
        if (dbData && dbData.length > 0) {
            console.log(`Chargé depuis DB: ${dbData.length} produits`);
            currentData = dbData;
        } else {
            console.log("DB vide, chargement initial SAMPLE_DATA");
            currentData = SAMPLE_DATA;
        }
      } catch (e) {
        console.error("Erreur chargement DB:", e);
        currentData = SAMPLE_DATA;
      }

      // 2. Fusion "CLOUD FIRST" : Récupération des données automatisées (GitHub > Local)
      let importedData = [];
      const GITHUB_URL = 'https://raw.githubusercontent.com/borispech-png/hpe-aruba-eos/main/public/hpe-enriched-data.json';
    
      try {
        // A. Tentative Cloud (Dernière version automatique)
        console.log("☁️ Vérification des mises à jour...");
        // Ajout du timestamp pour forcer le rafraîchissement (Anti-Cache)
        const response = await fetch(`${GITHUB_URL}?t=${new Date().getTime()}`);
        if (response.ok) {
            const json = await response.json();
            importedData = json.data || [];
            console.log(`✅ Cloud Sync: ${importedData.length} produits récupérés.`);
            if (json.metadata && json.metadata.lastUpdated) {
                console.log(`📅 Date des données Cloud : ${json.metadata.lastUpdated}`);
            }
        } else {
            throw new Error("Cloud inaccessible");
        }
      } catch (cloudErr) {
        // B. Repli Local (Mode hors ligne ou dev)
        console.warn("⚠️ Mode Hors-Ligne (Repli Local) :", cloudErr);
        try {
            // Utilisation d'un chemin relatif strict pour GitHub Pages (évite le / racine)
            const response = await fetch('./hpe-enriched-data.json');
            if (response.ok) {
                const json = await response.json();
                importedData = json.data || [];
                console.log(`🏠 Données Locales récupérées (${importedData.length} produits)`);
            } else {
                 throw new Error(`Erreur HTTP ${response.status}`);
            }
        } catch (localErr) {
            console.error("❌ Aucune source de données disponible (ni Cloud, ni Local).", localErr);
        }
      }

      // Logique de fusion unifiée
      if (importedData.length > 0) {
        try {
            const jsonData = { data: importedData };
            console.log(`Données enrichies trouvées: ${jsonData.data.length} produkty`);
            
            // Fusion intelligente
            const existingMap = new Map();
            currentData.forEach(p => existingMap.set((p.productNumber || p.id).toString(), p));

            let mergedCount = 0;
            let addedCount = 0;

            jsonData.data.forEach(enrichedItem => {
                const key = (enrichedItem.productNumber || enrichedItem.name).toString();
                let match = existingMap.get(key);
                
                if (!match) {
                     currentData.push(enrichedItem);
                     addedCount++;
                } else {
                    Object.assign(match, { 
                        ...enrichedItem, 
                        specs: enrichedItem.specs || match.specs,
                        id: match.id 
                    });
                    mergedCount++;
                }
            });
            
            console.log(`Fusion terminée: ${mergedCount} mis à jour, ${addedCount} ajoutés.`);
        } catch (e) {
            console.warn("Erreur pendant la fusion des données:", e);
        }
      }

      // 3. Nettoyage final et assignation des IDs manquants (CRITIQUE pour l'erreur DB)
      if (currentData.length > 0) console.log("🔍 Structure premier produit avant nettoyage:", currentData[0]);

      const sanitizedData = currentData
        .map((p, index) => ({
            ...p,
            id: p.id || `gen-${Date.now()}-${index}`,
            category: p.category || 'Non catégorisé',
            productNumber: (p.productNumber || p.name || p.Reference || '').trim(),
            productDescription: (p.productDescription || p.description || p.Description || (p.specs ? 'Voir spécifications' : '')).trim(),
            replacementProductNumber: (p.replacementProductNumber || p.replacementRef || '').trim(),
            replacementProductDescription: (p.replacementProductDescription || p.replacementDesc || '').trim(),
            notes: p.notes || ''
        }))
        // Filtrage des lignes parasites ("Indirect replacement", en-têtes répétés...)
        .filter(p => {
             const lowerDesc = p.productDescription.toLowerCase();
             const lowerNum = p.productNumber.toLowerCase();
             // On exclut si la description ressemble à une instruction de tableau
             if (lowerDesc.includes('indirect replacement') || lowerDesc.includes('available now')) return false;
             // On exclut si le numéro de produit est invalide ou ressemble à un header
             if (!p.productNumber || lowerNum === 'product number' || lowerNum === 'référence') return false;
             return true;
        });

      // Déduplication par Product Number
      const seen = new Set();
      const uniqueData = sanitizedData.filter(p => {
          const duplicate = seen.has(p.productNumber);
          seen.add(p.productNumber);
          return !duplicate;
      });

      setProducts(uniqueData);
      setIsDbLoaded(true);
    };

    loadData();
  }, []);

  // Sauvegarde automatique dans IndexedDB
  useEffect(() => {
    if (isDbLoaded && products.length > 0) {
        const save = async () => {
            try {
                await saveProductsToDB(products);
                console.log('Produits sauvegardés dans IndexedDB');
            } catch (e) {
                console.error("Erreur sauvegarde DB:", e);
            }
        };
        save();
    }
  }, [products, isDbLoaded]);


  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Extraction des catégories uniques
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return ['all', ...cats.sort()];
  }, [products]);


  // Helper pour le statut
  const getProductStatus = (dateStr) => {
    if (!dateStr) return { label: 'Inconnu', color: 'bg-gray-100 text-gray-800', dot: 'bg-gray-400', code: 'unknown' };
    
    const today = new Date();
    const eos = new Date(dateStr);
    const diffTime = eos - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Critique', color: 'bg-red-100 text-red-800', dot: 'bg-red-500', code: 'critical' };
    if (diffDays < 90) return { label: 'Urgent', color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', code: 'urgent' };
    if (diffDays < 365) return { label: 'À surveiller', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500', code: 'warning' };
    return { label: 'OK', color: 'bg-green-100 text-green-800', dot: 'bg-green-500', code: 'ok' };
  };

  // Statistiques
  const stats = useMemo(() => {
    const total = products.length;
    const categoriesCount = new Set(products.map(p => p.category)).size;
    const withReplacement = products.filter(p => p.replacementProductNumber).length;
    const byYear = products.reduce((acc, p) => {
      const year = p.endOfSaleDate ? p.endOfSaleDate.split('-')[0] : 'N/A';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    // Status counts
    const statusCounts = products.reduce((acc, p) => {
        const { code } = getProductStatus(p.endOfSaleDate);
        acc[code] = (acc[code] || 0) + 1;
        return acc;
    }, { critical: 0, urgent: 0, warning: 0, ok: 0, unknown: 0 });

    return { total, categoriesCount, withReplacement, byYear, statusCounts };
  }, [products]);

  // Filtrage et tri
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.productNumber || '').toLowerCase().includes(term) ||
        (p.productDescription || '').toLowerCase().includes(term) ||
        (p.replacementProductNumber || '').toLowerCase().includes(term) ||
        (p.replacementProductDescription || '').toLowerCase().includes(term) ||
        (p.category || '').toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [products, searchTerm, selectedCategory, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Catégorie', 'Référence Produit', 'Description Produit', 'Référence Remplacement', 'Description Remplacement', 'Date Fin Vente', 'Notes'];
    const csvContent = [
      headers.join(';'),
      ...filteredAndSortedProducts.map(p => [
        `"${p.category}"`, `"${p.productNumber}"`, `"${p.productDescription}"`, `"${p.replacementProductNumber}"`, `"${p.replacementProductDescription}"`, p.endOfSaleDate, `"${p.notes}"`
      ].join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `HPE_EOS_Products_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setShowExportMenu(false);
  };

  // Export Excel
  const exportToExcel = () => {
    exportToProfessionalExcel(filteredAndSortedProducts, stats);
    setShowExportMenu(false);
  };


  const handleImport = () => {
    try {
        // Essai de parsing JSON (Nouveau format Scraper V2)
        try {
            const jsonData = JSON.parse(importText);
            if (jsonData.metadata && jsonData.data && Array.isArray(jsonData.data)) {
                // Format JSON valide
                setProducts(jsonData.data);
                if (jsonData.metadata.lastUpdated) {
                    setLastUpdated(new Date(jsonData.metadata.lastUpdated));
                }
                setImportText('');
                setShowImportModal(false);
                alert(`${jsonData.data.length} produits importés depuis le JSON.`);
                return;
            }
        } catch (e) {
            // Ce n'est pas du JSON, on continue vers le CSV
        }

      const lines = importText.trim().split('\n');
      const newProducts = [];
      lines.forEach((line, index) => {
         if (!line.trim()) return;
         const cleanLine = line.trim();
         if (index === 0 && (cleanLine.includes('Famille') || cleanLine.includes('Catégorie'))) return;
         const parts = cleanLine.split(/[;\t]/).map(p => p.replace(/^"|"$/g, '').trim());
         if (parts.length < 2) return;

         newProducts.push({
          id: Date.now() + index, // Use unique ID based on timestamp
          category: parts[0] || 'Non catégorisé',
          productNumber: parts[1] || '',
          productDescription: parts[2] || '',
          replacementProductNumber: parts[3] || '',
          replacementProductDescription: parts[4] || '',
          endOfSaleDate: parts[5] || '',
          notes: parts[6] || ''
        });
      });

      const validProducts = newProducts.filter(p => p.productNumber && p.productNumber.toLowerCase() !== 'référence');
      setProducts(prev => {
          // Merge logic: avoid duplicates by product number? Or just append? 
          // Appending for now, but duplicates might be an issue. User didn't specify.
          return [...prev, ...validProducts];
      });
      // Update freshness to now if manual CSV import
      setLastUpdated(new Date());
      
      setImportText('');
      setShowImportModal(false);
      alert(`${validProducts.length} produits importés.`);
    } catch (error) {
       console.error(error);
       alert('Erreur lors de l\'import.');
    }
  };

  // AI Analysis & Enrichment
  const analyzeMigration = async (p) => {
    setAnalysisLoading(true);
    setAnalysisResult(null);
    try {
        const apiKey = import.meta.env.VITE_MISTRAL_API_KEY; 
        if(!apiKey) throw new Error("Clé API manquante (.env)");

        const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "mistral-small-latest", // Better for JSON
                response_format: { type: "json_object" },
                messages: [
                    {role: "system", content: "You are a network expert. Output JSON only."},
                    {role: "user", content: `Analyze the migration from obsolete product "${p.productDescription}" (${p.productNumber}) to replacement "${p.replacementProductDescription}" (${p.replacementProductNumber}).
                    
                    Return a JSON object with this EXACT structure:
                    {
                      "specs": {
                        "series": "Short Series Name",
                        "ports_count": "Number or String (e.g. 24, 48)",
                        "poe_version": "String (e.g. PoE+, Class 4)",
                        "uplink_type": "String (e.g. SFP+, SFP56)"
                      },
                      "coach": "Markdown text with 3 sections: \n1. 🚀 **Avantages** (3 technical points)\n2. ⚠️ **Vigilance** (Architecture/License changes)\n3. 💡 **Argumentaire** (1 persuasive sentence). Keep it French and professional."
                    }`}
                ]
            })
        });
        
        const data = await res.json();
        if(data.choices && data.choices[0]) {
            const content = JSON.parse(data.choices[0].message.content);
            
            // 1. Afficher l'analyse
            setAnalysisResult(content.coach);

            // 2. Sauvegarder les specs enrichies
            if (content.specs) {
                const enrichedProduct = { ...p, specs: content.specs };
                
                // Update local list (trigger autosave DB)
                setProducts(prev => prev.map(prod => prod.id === p.id ? enrichedProduct : prod));
                
                // Update modal view immediately
                setSelectedComparisonProduct(enrichedProduct);
            }
        } else {
             setAnalysisResult("Pas de réponse de l'IA.");
        }
    } catch(e) {
        console.error(e);
        setAnalysisResult("Erreur : " + e.message);
    } finally {
        setAnalysisLoading(false);
    }
  };

  // Helper pour surligner le texte
  const HighlightText = ({ text, highlight }) => {
    if (!highlight || !text) return <span>{text}</span>;
    
    // Échapper les caractères spéciaux pour regex
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const term = escapeRegExp(highlight);
    const parts = text.toString().split(new RegExp(`(${term})`, 'gi'));
    
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-yellow-300 text-gray-900 rounded-sm font-semibold px-0.5">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">HPE/Aruba EOS Manager</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{isDbLoaded ? 'Synchronisé' : 'Chargement...'}</span>
                    <span>•</span>
                    {lastUpdated ? (
                        <span className="flex items-center text-green-600 font-medium">
                            <Check className="w-3 h-3 mr-1" />
                            MAJ : {lastUpdated.toLocaleDateString()}
                        </span>
                    ) : (
                        <span className="text-orange-500">Données non datées</span>
                    )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 items-center">
                <button
                  onClick={async () => {
                    if(confirm("Voulez-vous vraiment vider la base de données locale ?")) {
                        await saveProductsToDB([]); // Efface tout
                        setProducts([]);
                        setLastUpdated(null);
                        alert("Base vidée.");
                    }
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Vider</span>
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Importer</span>
                </button>
                
                {/* Export Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                        <FileDown className="w-4 h-4" />
                        <span>Exporter</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5">
                            <div className="py-1">
                                <button
                                    onClick={exportToCSV}
                                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <FileDown className="w-4 h-4 mr-2" />
                                    Format CSV
                                </button>
                                <button
                                    onClick={exportToExcel}
                                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                                    Format Excel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
              </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Nouveau Dashboard : Alertes et Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cycle de Vie & Alertes</h2>
            
            <div className="flex flex-col md:flex-row gap-8">
                {/* Jauges circulaires ou Cartes d'alerte */}
                <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 min-w-[140px] text-center">
                        <p className="text-red-600 font-medium text-sm">Fin de vie passée</p>
                        <p className="text-3xl font-bold text-red-700 mt-2">{stats.statusCounts.critical}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 min-w-[140px] text-center">
                        <p className="text-orange-600 font-medium text-sm">Urgent (&lt; 3 mois)</p>
                        <p className="text-3xl font-bold text-orange-700 mt-2">{stats.statusCounts.urgent}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 min-w-[140px] text-center">
                        <p className="text-yellow-600 font-medium text-sm">À surveiller (&lt; 1 an)</p>
                        <p className="text-3xl font-bold text-yellow-700 mt-2">{stats.statusCounts.warning}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100 min-w-[140px] text-center">
                        <p className="text-green-600 font-medium text-sm">OK (&gt; 1 an)</p>
                        <p className="text-3xl font-bold text-green-700 mt-2">{stats.statusCounts.ok}</p>
                    </div>
                </div>

                {/* Frise Chronologique Simplifiée */}
                <div className="flex-1 border-l border-gray-100 pl-8 hidden md:block">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Projection des 24 prochains mois</h3>
                    <div className="relative pt-6">
                        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded"></div>
                        <div className="flex justify-between relative z-10">
                            {[0, 6, 12, 18, 24].map((month) => {
                                const date = new Date();
                                date.setMonth(date.getMonth() + month);
                                const label = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
                                return (
                                    <div key={month} className="flex flex-col items-center">
                                        <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm mb-2"></div>
                                        <span className="text-xs text-gray-500 font-medium uppercase">{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-400 text-center italic">
                        Visualisation des échéances EOS à venir
                    </div>
                </div>
            </div>
          </div>

            {/* Statistiques View Products */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Produits</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Catégories</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.categoriesCount}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Filter className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Avec Remplacement</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.withReplacement}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Résultats Filtrés</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{filteredAndSortedProducts.length}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Search className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filtres */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par référence, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'Toutes les catégories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Catégorie</span>
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('productNumber')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Référence</span>
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Description Produit
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('replacementProductNumber')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Réf. Remplacement</span>
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Description Remplacement
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('endOfSaleDate')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Fin Vente</span>
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAndSortedProducts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          Aucun produit trouvé
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product) => (
                        <tr 
                            key={product.id} 
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedComparisonProduct(product)}
                        >
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                              {(product.category || '').split(' ').slice(0, 3).join(' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900">
                             <HighlightText text={product.productNumber} highlight={searchTerm} />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                             <HighlightText text={product.productDescription} highlight={searchTerm} />
                          </td>
                          <td className="px-4 py-3 text-sm font-mono font-semibold text-green-700">
                             <HighlightText text={product.replacementProductNumber || '—'} highlight={searchTerm} />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                             <HighlightText text={product.replacementProductDescription || '—'} highlight={searchTerm} />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {(() => {
                                const status = getProductStatus(product.endOfSaleDate);
                                return (
                                    <div className="flex flex-col items-start gap-1">
                                        {product.endOfSaleDate ? (
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${status.color}`}>
                                                <span className={`w-2 h-2 rounded-full mr-2 ${status.dot}`}></span>
                                                {new Date(product.endOfSaleDate).toLocaleDateString('fr-FR')}
                                            </span>
                                        ) : '—'}
                                        {product.endOfSaleDate && (
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold ml-1">
                                                {status.label}
                                            </span>
                                        )}
                                    </div>
                                );
                            })()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination Controls */}
            {filteredAndSortedProducts.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-4 px-4">
                    <div className="text-sm text-gray-700">
                        Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)}</span> sur <span className="font-medium">{filteredAndSortedProducts.length}</span> résultats
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            Précédent
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredAndSortedProducts.length / itemsPerPage)))}
                            disabled={currentPage >= Math.ceil(filteredAndSortedProducts.length / itemsPerPage)}
                            className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage >= Math.ceil(filteredAndSortedProducts.length / itemsPerPage) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}
            
            <div className="mt-2 text-center text-xs text-gray-400">
              <p>Total global : {products.length} produits</p>
            </div>
      </div>

      {/* Modal de Comparaison */}
      {selectedComparisonProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Comparaison Technique</h3>
                <button 
                    onClick={() => {
                        setSelectedComparisonProduct(null);
                        setAnalysisResult(null);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                >
                    <span className="text-2xl">&times;</span>
                </button>
            </div>
            
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Produit Actuel (EOS) */}
                    <div className="bg-red-50 rounded-xl p-6 border border-red-100 relative">
                        <div className="absolute -top-3 left-6 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase rounded-full tracking-wider">
                            Actuel (EOS)
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mt-2">{selectedComparisonProduct.productNumber}</h4>
                        <p className="text-sm text-gray-600 mb-6">{selectedComparisonProduct.productDescription}</p>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Date Fin de Vente</p>
                                <p className="font-mono text-red-700 font-bold">
                                    {selectedComparisonProduct.endOfSaleDate || 'Non définie'}
                                </p>
                            </div>
                            {/* Données Techniques (IA Enrichie) */}
                            {selectedComparisonProduct.specs ? (
                                <>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Série / Modèle</p>
                                        <p className="font-medium">{selectedComparisonProduct.specs.series || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Ports</p>
                                        <p className="font-medium">{selectedComparisonProduct.specs.ports_count ? `${selectedComparisonProduct.specs.ports_count} ports` : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">PoE</p>
                                        <p className="font-medium">{selectedComparisonProduct.specs.poe_version || 'Non'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Uplink</p>
                                        <p className="font-medium">{selectedComparisonProduct.specs.uplink_type || '-'}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-gray-100 p-3 rounded text-xs text-gray-500 italic">
                                    Spécifications techniques non disponibles. <br/>
                                    L'enrichissement par IA n'a pas encore traité ce produit.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Produit Remplaçant */}
                    <div className="bg-green-50 rounded-xl p-6 border border-green-100 relative">
                         <div className="absolute -top-3 left-6 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wider">
                            Remplaçant Recommandé
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mt-2">{selectedComparisonProduct.replacementProductNumber || 'Aucun'}</h4>
                        <p className="text-sm text-gray-600 mb-6">{selectedComparisonProduct.replacementProductDescription || 'Pas de remplacement direct identifié'}</p>
                        
                         {selectedComparisonProduct.replacementProductNumber ? (
                             <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Status</p>
                                    <span className="inline-flex items-center px-2 py-1 rounded bg-green-200 text-green-800 text-xs font-bold">
                                        ACTIF
                                    </span>
                                </div>
                                {/* Mock Data for Demo - In a real app, we would fetch specs based on the ID */}
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Ports</p>
                                    <p className="font-medium flex items-center text-green-700">
                                        <Check className="w-4 h-4 mr-1" />
                                        24x 10/100/1000 PoE+ (Layer 3 Lite)
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Switching Capacity</p>
                                    <p className="font-medium flex items-center text-green-700">
                                         <TrendingDown className="w-4 h-4 mr-1 transform rotate-180" /> {/* Arrow Up actually */}
                                        128 Gbps
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">PoE Budget</p>
                                    <p className="font-medium flex items-center text-green-700">
                                         <Check className="w-4 h-4 mr-1" />
                                        370W
                                    </p>
                                </div>
                            </div>
                         ) : (
                             <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                 <AlertCircle className="w-12 h-12 mb-2" />
                                 <p>Aucune information technique disponible</p>
                             </div>
                         )}
                    </div>
                </div>

                {/* Section Coach IA */}
                <div className="mt-8 border-t border-gray-100 pt-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Coach de Migration IA</h4>
                        </div>
                        
                        {!analysisResult && !analysisLoading && (
                            <div className="text-center py-4">
                                <p className="text-gray-600 mb-4">L'IA peut analyser ces deux produits pour vous donner un argumentaire de migration sur mesure.</p>
                                <button 
                                    onClick={() => analyzeMigration(selectedComparisonProduct)}
                                    className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition flex items-center mx-auto space-x-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Lancer l'analyse technique</span>
                                </button>
                            </div>
                        )}

                        {analysisLoading && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                                <p className="text-gray-500 font-medium animate-pulse">Analyse de la compatibilité en cours...</p>
                            </div>
                        )}

                        {analysisResult && (
                            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 prose prose-sm max-w-none text-gray-700">
                                <pre className="whitespace-pre-wrap font-sans text-sm">{analysisResult}</pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'import */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Importer des produits</h3>
            <p className="text-sm text-gray-600 mb-4">
              Collez vos données au format CSV ou TSV (catégorie; référence; description; réf. remplacement; desc. remplacement; date fin vente)
            </p>
            <div className="flex flex-col space-y-4 mb-4">
              <div className="flex items-center space-x-4">
                 <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer w-full">
                    <FileDown className="w-5 h-5 mr-2 text-gray-500" />
                    <span>Choisir un fichier CSV</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setImportText(event.target.result);
                        };
                        reader.readAsText(file);
                      }}
                    />
                 </label>
              </div>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Exemple:&#10;HPE OfficeConnect;J9979A;HPE Switch 8G;JL380A;HPE Switch 8G New;2018-12-31"
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportText('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Importer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HPEEOSManager;
