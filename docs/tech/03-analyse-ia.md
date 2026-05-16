# Spécification Technique : Analyse Automatique par IA

## Objectif
Extraire des informations structurées à partir d'une description textuelle libre.

## Intégration IA
- Utilisation de la bibliothèque `ai` (Vercel AI SDK) ou appel direct à une API compatible OpenAI.
- Configuration via variables d'environnement (`AI_API_URL`, `AI_API_KEY`, `AI_MODEL`).

## Prompt Engineering
- Rôle : "Assistant expert en gestion de maintenance et qualité pour cave viticole".
- Input : Description de l'employé.
- Output : Objet JSON structuré contenant :
  - `title`: Titre court.
  - `zone`: Identifiant de la zone (ex: "Cuverie").
  - `category`: Catégorie (ex: "Maintenance").
  - `priority`: Gravité (basse, moyenne, haute, critique).
  - `responsible_service`: Service à alerter.
  - `summary`: Résumé formel.
  - `suggested_actions`: Liste de conseils immédiats.
  - `missing_info`: Ce qui manque pour agir.
  - `confidence`: Score entre 0 et 1.

## Sécurité
- Ne jamais envoyer de données personnelles sensibles à l'IA.
- Valider le format JSON de la réponse.
