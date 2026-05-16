'use server';

import OpenAI from 'openai';
import { z } from 'zod';
import { incidentAnalysisSchema } from './schema';
import { db } from '@/app/lib/db';
import { incident as incidentTable, zone as zoneTable, category as categoryTable } from '@/app/lib/db/schema';
import { ne, desc } from 'drizzle-orm';

type IncidentAnalysis = z.infer<typeof incidentAnalysisSchema>;

export async function analyzeIncident(description: string): Promise<IncidentAnalysis> {
  // 1. Récupération des données contextuelles
  const zones = await db.select({ name: zoneTable.name }).from(zoneTable);
  const categories = await db.select({ name: categoryTable.name }).from(categoryTable);
  
  // 2. Récupération des incidents récents NON CLÔTURÉS pour détection de doublons
  const openIncidents = await db.query.incident.findMany({
    where: ne(incidentTable.status, 'cloture'),
    orderBy: [desc(incidentTable.createdAt)],
    limit: 10,
    columns: {
      id: true,
      title: true,
      aiSummary: true,
    }
  });

  const zoneList = zones.map(z => z.name).join(', ');
  const categoryList = categories.map(c => c.name).join(', ');
  const existingIncidentsList = openIncidents.map(i => `ID: ${i.id}, TITRE: ${i.title}, RÉSUMÉ: ${i.aiSummary}`).join('\n---\n');

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
          
          Étape 1 : DÉTECTION DE DOUBLONS
          Vérifie si la description de l'utilisateur correspond à l'un de ces incidents récents ouverts :
          ${existingIncidentsList || 'Aucun incident ouvert actuellement.'}
          
          Si tu trouves un incident très similaire, remplis l'objet "potential_duplicate" avec son ID, son titre, son résumé et la raison de ta détection. Ne sois pas trop restrictif, si le problème semble identique (ex: même fuite sur la même cuve), signale-le.

          Étape 2 : ANALYSE DE L'INCIDENT
          CONTRINTES DE CHAMP :
          1. ZONE : Choisis en priorité parmi cette liste : [${zoneList}]. 
             SI ET SEULEMENT SI aucune zone de la liste ne correspond du tout, propose un nom de zone court préfixé par "[NON DÉCLARÉE] ".
          2. CATEGORIE : Choisis uniquement parmi cette liste : [${categoryList}].
          
          ESTIMATION DE LA PRIORITÉ (priority) :
          - basse : Confort, esthétique, ou impact nul sur le travail.
          - moyenne : Gênant mais avec solution de contournement.
          - haute : Impact production, qualité vin ou sécurité biens.
          - critique : Danger immédiat personnes, arrêt total production ou risque perte majeure vin.
          
          Tu dois répondre UNIQUEMENT par un objet JSON respectant ce schéma :
          {
            "title": "titre court",
            "zone": "zone choisie",
            "category": "catégorie choisie",
            "priority": "basse" | "moyenne" | "haute" | "critique",
            "responsible_service": "service suggéré",
            "summary": "résumé pro et concis",
            "suggested_actions": ["action 1", "action 2"],
            "missing_info_list": ["info manquante"],
            "confidence": 0.0 à 1.0,
            "potential_duplicate": { "id": "ID", "title": "Titre", "summary": "Résumé", "reason": "Pourquoi est-ce un doublon ?" } | null
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
      suggested_actions: ['Vérifier la zone'],
      missing_info_list: [],
      confidence: 0,
      potential_duplicate: null,
    };
  }
}
