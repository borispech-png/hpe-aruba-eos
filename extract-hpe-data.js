/**
 * Script d'extraction ROBUSTE des produits EOS pour support.hpe.com
 * 
 * INSTRUCTIONS:
 * 1. Allez sur https://support.hpe.com/docs/display/public/hpe-networking-eos/index.html
 * 2. Sélectionnez "Legacy Announcements" puis "Switches".
 * 3. Attendez que les tableaux s'affichent.
 * 4. Ouvrez la console (F12 > Console).
 * 5. Collez TOUT le contenu de ce fichier et faites Entrée.
 * 6. Un fichier CSV compatible Excel sera téléchargé.
 */

(function extractHPEEOSProducts() {
  console.log('🚀 Extraction des données HPE EOS...');
  const tables = document.querySelectorAll('table');
  const products = [];

  tables.forEach((table, index) => {
    // 1. Trouver le titre (Famille de produit)
    let category = `Tableau ${index + 1}`;
    let prev = table.previousElementSibling;
    let attempts = 0;
    while (prev && attempts < 10) {
      if (['H1','H2','H3','H4','H5','STRONG'].includes(prev.tagName)) {
        category = prev.innerText.trim();
        break;
      }
      prev = prev.previousElementSibling;
      attempts++;
    }

    // 2. Identifier les colonnes
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length < 2) return; // Pas assez de données

    // Essayer de trouver le header
    let headerRow = table.querySelector('thead tr') || rows[0];
    const headers = Array.from(headerRow.querySelectorAll('th, td')).map(c => c.innerText.trim().toLowerCase());
    
    // Logique de mapping des colonnes
    const findIdx = (keywords) => headers.findIndex(h => keywords.some(k => h.includes(k)));
    
    let pNumIdx = findIdx(['product number', 'part number', 'sku', 'product #']);
    let pDescIdx = findIdx(['product description', 'description']);
    let rNumIdx = findIdx(['replacement product #', 'replacement part', 'replacement product number']);
    let rDescIdx = findIdx(['replacement product description', 'replacement description']);

    // Fallback si header non clair mais 4 colonnes
    if (pNumIdx === -1 && headers.length >= 4) {
         pNumIdx = 0; pDescIdx = 1; rNumIdx = 2; rDescIdx = 3;
    }

    if (pNumIdx === -1) return;

    // 3. Extraire les lignes
    rows.forEach((row, rIdx) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 2) return;
      
      // Ignorer la ligne si c'est le header (répété)
      if (cells[0].innerText.toLowerCase().includes('product number')) return;

      const pNum = cells[pNumIdx] ? cells[pNumIdx].innerText.trim() : '';
      if (!pNum) return;

      products.push({
        id: products.length + 1,
        category: category,
        productNumber: pNum,
        productDescription: cells[pDescIdx] ? cells[pDescIdx].innerText.trim() : '',
        replacementProductNumber: cells[rNumIdx] ? cells[rNumIdx].innerText.trim() : '',
        replacementProductDescription: cells[rDescIdx] ? cells[rDescIdx].innerText.trim() : '',
        endOfSaleDate: '',
        notes: ''
      });
    });
  });

  console.log(`✅ ${products.length} produits extraits.`);

  if (products.length === 0) {
    alert('Aucun produit trouvé ! Assurez-vous d\'avoir sélectionné "Legacy Announcements" et "Switches" et que les tableaux sont visibles.');
    return;
  }

  // Génération CSV avec BOM pour Excel
  const csvHeaders = ['Famille;Référence;Description;Remplacement Réf;Remplacement Desc;Date Fin;Notes'];
  const csvRows = products.map(p => 
    `"${p.category.replace(/"/g,'""')}";"${p.productNumber}";"${p.productDescription.replace(/"/g,'""')}";"${p.replacementProductNumber}";"${p.replacementProductDescription.replace(/"/g,'""')}";"${p.endOfSaleDate}";"${p.notes}"`
  );
  
  const csvContent = '\uFEFF' + csvHeaders.concat(csvRows).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `hpe_eos_full_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log('Fichier CSV téléchargé !');
})();
