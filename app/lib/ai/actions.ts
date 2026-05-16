'use server';

import OpenAI from 'openai';
import { incidentAnalysisSchema } from './schema';
import { db } from '@/app/lib/db';
import { zone as zoneTable, category as categoryTable } from '@/app/lib/db/schema';

export async function analyzeIncident(description: string) {
  // Récupération des zones et catégories existantes pour guider l'IA
  const zones = await db.select({ name: zoneTable.name }).from(zoneTable);
  const categories = await db.select({ name: categoryTable.name }).from(categoryTable);
  
  const zoneList = zones.map(z => z.name).join(', ');
  const categoryList = categories.map(c => c.name).join(', ');

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant expert en gestion d'incidents pour une cave viticole.
          
          CONTRINTES IMPORTANTES :
          1. Choisis la ZONE uniquement parmi cette liste : [${zoneList}]. Si aucune ne correspond vraiment, choisis la plus proche.
          2. Choisis la CATEGORIE uniquement parmi cette liste : [${categoryList}].
          
          Tu dois répondre UNIQUEMENT par un objet JSON respectant ce schéma :
          {
            "title": "titre court",
            "zone": "nom de la zone exacte choisie dans la liste",
            "category": "nom de la catégorie exacte choisie dans la liste",
            "priority": "basse" | "moyenne" | "haute" | "critique",
            "responsible_service": "service responsable suggéré",
            "summary": "résumé clair et professionnel",
            "suggested_actions": ["action 1", "action 2"],
            "missing_info_list": ["liste des informations manquantes pour une résolution complète"],
            "confidence": 0.0 à 1.0 (ton niveau de certitude)
          }`
        },
        {
          role: 'user',
          content: `Analyse cet incident : "${description}"`
        }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const text = completion.choices[0]?.message?.content || '';

    try {
      const parsed = JSON.parse(text);
      return incidentAnalysisSchema.parse(parsed);
    } catch (e) {
      console.error('Failed to parse AI JSON:', text);
      throw new Error('Format JSON invalide reçu de l\'IA');
    }
  } catch (error) {
    console.error('AI Analysis failed with OpenAI library:', error);
    return {
      title: 'Incident à qualifier',
      zone: 'Inconnue',
      category: 'Inconnue',
      priority: 'moyenne' as const,
      responsible_service: 'Maintenance',
      summary: description,
      suggested_actions: ['Vérifier la zone', 'Sécuriser le périmètre'],
      missing_info_list: ['Détails supplémentaires'],
      confidence: 0,
    };
  }
}
