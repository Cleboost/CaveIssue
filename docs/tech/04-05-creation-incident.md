# Spécification Technique : Validation et Création d'Incident

## Objectif
Permettre à l'utilisateur de vérifier et corriger les "devinettes" de l'IA avant que l'incident ne soit officiellement ouvert.

## UI de Prévisualisation
- Affichage des champs extraits sous forme de formulaire pré-rempli.
- Possibilité de modifier chaque champ manuellement.
- Bouton "Confirmer la création" pour enregistrer en base de données.
- Bouton "Annuler" pour revenir à la saisie initiale.

## Persistance (Table `incident`)
Colonnes :
- `id` (UUID)
- `reporter_id` (User)
- `original_description` (Text)
- `title` (Text)
- `zone_id` (FK Zone)
- `category_id` (FK Category)
- `priority` (Enum)
- `status` (Enum: nouveau, en_cours, ...)
- `assigned_to` (User/Service)
- `ai_summary` (Text)
- `ai_suggested_actions` (JSON/Text)
- `created_at`
- `updated_at`
