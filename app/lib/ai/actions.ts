'use server';

import OpenAI from 'openai';
import { incidentAnalysisSchema } from './schema';

export async function analyzeIncident(description: string) {
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
          Tu dois répondre UNIQUEMENT par un objet JSON respectant ce schéma :
          {
            "title": "titre court",
            "zone": "zone concernée",
            "category": "catégorie",
            "priority": "basse" | "moyenne" | "haute" | "critique",
            "responsible_service": "service responsable",
            "summary": "résumé clair",
            "suggested_actions": ["action 1", "action 2"],
            "missing_info_list": ["info manquante 1", "info manquante 2"],
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
