import axios from 'axios';
import * as cheerio from 'cheerio';

const URL = 'https://support.hpe.com/docs/display/public/hpe-networking-eos/index.html';

async function debugHeaders() {
  try {
    const { data } = await axios.get(URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    
    $('table').slice(0, 5).each((i, table) => {
      console.log(`\n--- Table ${i+1} ---`);
      // Essayer thead/th
      let headers = [];
      $(table).find('th').each((j, th) => {
        headers.push(`"${$(th).text()}"`); // Voir les espaces exacts et sauts de ligne
      });
      
      if (headers.length === 0) {
        // Essayer première ligne tr
        const firstRow = $(table).find('tr').first();
        firstRow.find('td').each((j, td) => {
           headers.push(`"${$(td).text()}"`); 
        });
      }
      
      console.log(headers.join(' | '));
    });

  } catch (error) { console.error(error); }
}

debugHeaders();
