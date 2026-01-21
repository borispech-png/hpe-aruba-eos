import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

const URL = 'https://support.hpe.com/docs/display/public/hpe-networking-eos/index.html';

async function findDataInScripts() {
  console.log('Searching for data scripts...');
  const { data } = await axios.get(URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const $ = cheerio.load(data);
  
  $('script').each((i, el) => {
    const content = $(el).html();
    if (!content) return;
    
    // Critères pour trouver la data
    if (content.includes('Product Number') || content.includes('JL380A') || content.includes('J9979A')) {
        console.log(`\n found potential data in Script ${i} (Length: ${content.length})`);
        console.log('---------------------------------------------------');
        console.log(content.substring(0, 500) + '...');
        console.log('---------------------------------------------------');
    }
  });
}

findDataInScripts();
