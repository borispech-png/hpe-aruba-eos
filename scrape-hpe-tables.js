import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

const URL = 'https://support.hpe.com/docs/display/public/hpe-networking-eos/index.html';

async function scrapeHpeTables() {
  console.log(`🚀 Démarrage du scraping robuste...`);
  
  const { data } = await axios.get(URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const $ = cheerio.load(data);
  const allProducts = [];

  $('table').each((tIdx, table) => {
      const $table = $(table);
      
      // 1. Identification des colonnes
      let headerCells = $table.find('thead th');
      if (headerCells.length === 0) headerCells = $table.find('tr').first().find('td, th');
      
      const headers = [];
      headerCells.each((_, c) => headers.push($(c).text().toLowerCase().replace(/\s+/g, ' ').trim()));

      const idxProd = headers.findIndex(h => h.includes('product number') || h.includes('part number'));
      const idxDesc = headers.findIndex(h => h.includes('description'));
      const idxRepProd = headers.findIndex(h => (h.includes('replacement') && (h.includes('#') || h.includes('number'))) );
      const idxRepDesc = headers.findIndex(h => (h.includes('replacement') && h.includes('description')));

      // if (tIdx < 3) console.log(`Table ${tIdx}: Found headers [${headers}] -> IdxProd: ${idxProd}`);

      if (idxProd === -1) return; // Table ignorée

      // 2. Récupération du titre (Famille de produit)
      let title = "Autre";
      let prev = $table.prev();
      // On remonte 5 éléments max pour trouver un titre
      for(let k=0; k<5; k++) {
          if (prev.length === 0) {
              // try escaping parent div
              const parentPrev = $table.parent().prev();
              if (parentPrev.length) prev = parentPrev;
          }
          const tag = prev.prop('tagName');
          if (tag && ['H1','H2','H3','H4','STRONG'].includes(tag)) {
              title = prev.text().trim();
              break;
          }
          prev = prev.prev();
      }

      // 3. Extraction des lignes
      let rows = $table.find('tbody tr');
      if (rows.length === 0) {
          rows = $table.find('tr');
          // On assume que la ligne 0 est le header si on a pris 'tr' globaux
          if (headerCells.is(rows.first().find('td,th'))) {
              rows = rows.slice(1);
          }
      }

      rows.each((_, row) => {
          const cells = $(row).find('td');
          if (cells.length < 2) return;

          const pNum = $(cells[idxProd]).text().trim();
          // Ignorer les lignes vides ou en-têtes répétés
          if (!pNum || pNum.toLowerCase().includes('product number')) return;

          allProducts.push({
              category: title,
              productNumber: pNum,
              productDescription: idxDesc>-1 ? $(cells[idxDesc]).text().trim() : '',
              replacementProductNumber: idxRepProd>-1 ? $(cells[idxRepProd]).text().trim() : '',
              replacementProductDescription: idxRepDesc>-1 ? $(cells[idxRepDesc]).text().trim() : '',
              endOfSaleDate: '', 
              source: `Table ${tIdx+1}`
          });
      });
  });

  console.log(`✅ ${allProducts.length} produits extraits.`);

  // Sauvegardes
  const csvRows = allProducts.map(p => 
    `"${p.category.replace(/"/g,'""')}";"${p.productNumber}";"${p.productDescription}";"${p.replacementProductNumber}";"${p.replacementProductDescription}"`
  ).join('\n');
  const csvContent = `Famille;Référence;Description;Remplacement Réf;Remplacement Desc\n${csvRows}`;

  await fs.writeFile('hpe-eos-detailed.csv', '\uFEFF' + csvContent);
  await fs.writeFile('src/hpe-eos-detailed.json', JSON.stringify(allProducts, null, 2));

  console.log('files written.');
}

scrapeHpeTables();
