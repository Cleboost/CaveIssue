# Spécification Technique : Listes et Filtrage

## Objectif
Permettre aux utilisateurs de retrouver et suivre les incidents pertinents pour eux.

## Listes
- **Vue globale (Admin) :** Tous les incidents.
- **Vue Responsable :** Incidents assignés à son service ou à lui-même.
- **Vue Employé :** Incidents qu'il a créés.

## Filtrage
- Implémentation via les paramètres de recherche d'URL (`?status=en_cours&zone=cuverie`).
- Composants Shadcn UI : `Select` pour les filtres, `Table` pour l'affichage.

## Performance
- Utilisation de `Suspense` et de Server Components pour un chargement rapide.
- Pagination si nécessaire (plus tard).
