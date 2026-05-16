'use server';

import OpenAI from 'openai';
import { z } from 'zod';
import { incidentAnalysisSchema } from './schema';
import { db } from '@/app/lib/db';
import { zone as zoneTable, category as categoryTable } from '@/app/lib/db/schema';

type IncidentAnalysis = z.infer<typeof incidentAnalysisSchema>;

export async function analyzeIncident(description: string): Promise<IncidentAnalysis> {
  // Récupération des zones et catégories existantes pour guider l'IA
  const zones = await db.select({ name: zoneTable.name }).from(zoneTable);
  const categories = await db.select({ name: categoryTable.name }).from(categoryTable);
  
  const zoneList = zones.map(z => z.name).join(', ');
  const categoryList = categories.map(c => c.name).join(', ');

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENAI_API_BASE_URL || undefined,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant expert en gestion d'incidents pour une cave viticole.
          
          CONTRINTES IMPORTANTES :
          1. ZONE : Choisis en priorité parmi cette liste : [${zoneList}]. 
             SI ET SEULEMENT SI aucune zone de la liste ne correspond du tout (ex: salle de pause, parking), propose un nom de zone court et préfixe-le par "[NON DÉCLARÉE] " (ex: "[NON DÉCLARÉE] Salle de pause").
          2. CATEGORIE : Choisis uniquement parmi cette liste : [${categoryList}].
          
          FORMATAGE DU RÉSUMÉ (summary) :
          - Rédige un texte professionnel, concis et structuré.
          - Utilise un ton factuel.
          - Évite les fioritures.

          ESTIMATION DE LA PRIORITÉ (priority) :
          - basse : Incidents de confort, esthétiques ou n'impactant pas le travail (ex: écran cassé salle de pause, ampoule grillée couloir).
          - moyenne : Incidents gênants mais avec solution de contournement, n'arrêtant pas la production.
          - haute : Incidents impactant directement la production, la qualité du vin ou la sécurité des biens.
          - critique : Danger immédiat pour les personnes, arrêt total de la production, ou risque de perte majeure de stock de vin.
          
          Tu dois répondre UNIQUEMENT par un objet JSON respectant ce schéma :
          {
            "title": "titre court",
            "zone": "nom de la zone exacte choisie dans la liste",
            "category": "nom de la catégorie exacte choisie dans la liste",
            "priority": "basse" | "moyenne" | "haute" | "critique",
            "responsible_service": "service responsable suggéré",
            "summary": "résumé clair et professionnel",
            "suggested_actions": ["action 1", "action 2"],
            "missing_info_list": ["liste des informations manquantes"],
            "confidence": 0.0 à 1.0
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

    const text = completion.choices[0]?.message?.content || '{}';

    try {
      const parsed = JSON.parse(text);
      return incidentAnalysisSchema.parse(parsed);
    } catch (e) {
      console.error('Failed to parse AI JSON:', text);
      throw new Error('Format JSON invalide reçu de l\'IA');
    }
  } catch (error) {
    console.error('AI Analysis failed:', error);
    return {
      title: 'Incident à qualifier',
      zone: zones[0]?.name || 'Inconnue',
      category: categories[0]?.name || 'Inconnue',
      priority: 'moyenne',
      responsible_service: 'Maintenance',
      summary: description,
      suggested_actions: ['Vérifier la zone', 'Sécuriser le périmètre'],
      missing_info_list: ['Détails supplémentaires'],
      confidence: 0,
    };
  }
}
