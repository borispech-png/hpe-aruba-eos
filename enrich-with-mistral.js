import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const API_KEY = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;
const INPUT_FILE = 'hpe-eos-data.json';
const OUTPUT_FILE = 'hpe-enriched-data.json';

if (!API_KEY) {
  console.error("❌ Erreur : La clé API Mistral n'est pas définie. Veuillez créer un fichier .env avec MISTRAL_API_KEY=...");
  process.exit(1);
}

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

async function dodo(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function enrichProduct(product) {
  const prompt = `
  Tu es un expert en équipements réseau HPE/Aruba.
  Analyse le nom et la description du produit suivant pour en extraire les spécifications techniques.
  
  Produit : "${product.name}"
  
  Réponds UNIQUEMENT avec un objet JSON (sans markdown, sans explications) suivant cette structure :
  {
    "series": "string (ex: 2930F)",
    "ports_count": number (ex: 24, 48...),
    "poe_version": "string (Non, PoE+, PoE++, Class 4...)",
    "uplink_type": "string (SFP, SFP+, SFP56...)",
    "form_factor": "string (1U, Modular...)"
  }
  Si une info est introuvable, mets null.
  `;

  try {
    const response = await axios.post(
      MISTRAL_URL,
      {
        model: "mistral-tiny", // Modèle rapide et économique
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const specs = JSON.parse(content);
    
    console.log(`✅ Enrichi : ${product.name} -> Ports: ${specs.ports_count}, PoE: ${specs.poe_version}`);
    return { ...product, specs };

  } catch (error) {
    console.error(`⚠️ Erreur sur ${product.name}:`, error.response ? error.response.data : error.message);
    return product; // On retourne le produit sans specs en cas d'erreur
  }
}

async function main() {
  try {
    console.log("🚀 Démarrage de l'enrichissement via Mistral AI...");
    
    // Lire le fichier source
    const rawData = await fs.readFile(path.resolve(INPUT_FILE), 'utf-8');
    const json = JSON.parse(rawData);
    
    // Support pour le format V2 { metadata, data } ou V1 [array]
    let products = Array.isArray(json) ? json : (json.data || []);

    if (products.length === 0) {
        console.log("Aucun produit à traiter.");
        return;
    }

    console.log(`📦 ${products.length} produits chargés. Début du traitement (Batch de 5 pour test)...`);
    
    // Limiter à 5 pour le test pour ne pas brûler les crédits
    const batch = products.slice(0, 5); 
    const enrichedBatch = [];

    for (const product of batch) {
        const enriched = await enrichProduct(product);
        enrichedBatch.push(enriched);
        await dodo(1000); // Pause respectueuse pour l'API
    }

    // Sauvegarde
    const outputData = {
        metadata: {
            lastUpdated: new Date().toISOString(),
            enriched: true,
            provider: "Mistral AI"
        },
        data: enrichedBatch // Pour la prod, il faudrait merger avec le reste
    };

    await fs.writeFile(path.resolve(OUTPUT_FILE), JSON.stringify(outputData, null, 2), 'utf-8');
    console.log(`💾 Terminée ! Données enrichies sauvegardées dans ${OUTPUT_FILE}`);

  } catch (error) {
    console.error("❌ Erreur critique:", error);
  }
}

main();
