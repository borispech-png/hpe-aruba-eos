import axios from 'axios';
import * as cheerio from 'cheerio';

const URL = 'https://support.hpe.com/docs/display/public/hpe-networking-eos/index.html';

async function debugHTML() {
  const { data } = await axios.get(URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const $ = cheerio.load(data);
  const firstTable = $('table').first();
  console.log(firstTable.html());
}

debugHTML();
