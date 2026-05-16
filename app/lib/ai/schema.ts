import { z } from 'zod';

export const incidentAnalysisSchema = z.object({
  title: z.string().describe('Un titre court et explicite de l\'incident'),
  zone: z.string().describe('La zone de la cave concernée (ex: Cuverie, Embouteillage, Cave de stockage, Bureau, Extérieur)'),
  category: z.string().describe('La catégorie de l\'incident (ex: Maintenance, Hygiène, Sécurité, Qualité Produit, Matériel)'),
  priority: z.enum(['basse', 'moyenne', 'haute', 'critique']).describe('La gravité estimée de l\'incident'),
  responsible_service: z.string().describe('Le service ou la personne responsable (ex: Maintenance, Responsable Cuverie, Responsable Qualité, Sécurité)'),
  summary: z.string().describe('Un résumé clair et professionnel du problème'),
  suggested_actions: z.array(z.string()).describe('Liste de premières actions conseillées'),
  missing_info_list: z.array(z.string()).describe('Liste des informations manquantes importantes pour résoudre le problème (ex: ["Numéro de la cuve", "Type de vanne"])'),
  confidence: z.number().min(0).max(1).describe('Niveau de confiance de l\'IA dans son analyse (0 à 1)'),
  potential_duplicate: z.object({
    id: z.string(),
    title: z.string(),
    summary: z.string(),
    reason: z.string()
  }).optional().nullable().describe('Informations sur un incident similaire existant'),
});
