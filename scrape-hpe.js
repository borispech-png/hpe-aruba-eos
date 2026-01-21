import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const URL = 'https://support.hpe.com/docs/display/public/hpe-networking-eos/index.html';

async function scrapeHpeEos() {
  console.log(`🚀 Démarrage du scraping de : ${URL}`);

  try {
    const { data } = await axios.get(URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    const products = [];

    $('h3').each((index, element) => {
      const titleElement = $(element);
      const productName = titleElement.text().trim();

      const ignoredTitles = [
        'Announcement Type', 'Category', 'Recent Announcements', 
        'Legacy Announcements', 'End of Sale Products',
        'HPE Networking Product End of Life information', 'HPE Networking product life cycle milestones:'
      ];

      if (ignoredTitles.some(t => productName.includes(t)) || productName.length < 3) {
        return;
      }

      // Fonction de recherche de liste
      const findList = (startElement, isParentLevel = false) => {
        let current = startElement.next();
        let limit = 10; // On cherche un peu plus loin (ex: sibling +5)
        
        while(current.length && limit > 0) {
          // Si on trouve une liste directement
          if (current.is('ul') || current.is('ol')) {
            return current;
          }
          
          // Si l'élément contient une liste
          const innerList = current.find('ul, ol');
          if (innerList.length > 0) {
            return innerList.first();
          }

          // Si on touche un autre titre, on arrête (fin de section)
          // Attention: si on est au niveau parent, le titre suivant est probablement dans un div/span
          if (current.is('h3') || current.find('h3').length > 0) {
            // Sauf si c'est le même h3 (improbable en next())
            return null;
          }

          current = current.next();
          limit--;
        }
        return null;
      };

      // Essai 1 : Frères directs
      let listElement = findList(titleElement);

      // Essai 2 : Frères du parent (si h3 isolé dans un div)
      if (!listElement) {
        listElement = findList(titleElement.parent(), true);
      }

      if (listElement && listElement.length > 0) {
        const announcements = [];
        listElement.find('a').each((i, link) => {
          const linkEl = $(link);
          const href = linkEl.attr('href');
          const text = linkEl.text().trim();

          if (href) {
            let fullUrl = href;
            if (!href.startsWith('http')) {
                // Gestion du slash initial
                const path = href.startsWith('/') ? href : `/${href}`;
                fullUrl = `https://support.hpe.com${path}`;
            }
            announcements.push({
              title: text || 'Lien',
              url: fullUrl
            });
          }
        });

        if (announcements.length > 0) {
          products.push({
            name: productName,
            announcements: announcements
          });
        }
      }
    });

    console.log(`✅ ${products.length} produits trouvés.`);
    
    // Sauvegarde JSON - Structure améliorée V2
    const outputData = {
        metadata: {
            lastUpdated: new Date().toISOString(),
            source: URL,
            count: products.length
        },
        data: products
    };
    
    const outputPath = path.resolve('hpe-eos-data.json');
    await fs.writeFile(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
    
    // Sauvegarde CSV (car demandé souvent pour Excel)
    const csvContent = products.map(p => {
        // Juste le premier lien/annonce pour simplifier, ou répéter les lignes
        return p.announcements.map(a => `"${p.name}";"${a.title}";"${a.url}"`).join('\n');
    }).join('\n');
    await fs.writeFile(path.resolve('hpe-eos-data.csv'), 'Produit;Titre;URL\n' + csvContent, 'utf-8');
    
    console.log(`💾 Données sauvegardées (JSON & CSV)`);
    return products;

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return [];
  }
}

scrapeHpeEos();
