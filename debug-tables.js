import axios from 'axios';
import * as cheerio from 'cheerio';

const URL = 'https://support.hpe.com/docs/display/public/hpe-networking-eos/index.html';

async function checkTables() {
  console.log('🔍 Recherche de tableaux dans le HTML...');
  try {
    const { data } = await axios.get(URL, { 
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
        } 
    });
    const $ = cheerio.load(data);
    
    const tables = $('table');
    console.log(`📊 Nombre de tableaux trouvés : ${tables.length}`);

    tables.each((i, table) => {
        const headers = [];
        $(table).find('th').each((j, th) => {
            headers.push($(th).text().trim());
        });
        
        // Si pas de th, essayons la première ligne tr
        if (headers.length === 0) {
            $(table).find('tr').first().find('td').each((j, td) => {
                headers.push($(td).text().trim());
            });
        }

        if (headers.length > 0) {
            console.log(`Tableau ${i+1} Headers: [${headers.join(' | ')}]`);
        }
    });

  } catch (error) { console.error(error); }
}

checkTables();
