# Spécification Technique : Configuration et Modularité

## Objectif
Rendre l'application flexible sans modifier le code source pour changer les paramètres métiers.

## Tables de Référence
- `zone` : Nom de la zone (ex: Cuverie, Embouteillage, Cave de stockage).
- `category` : Type d'incident (ex: Matériel, Hygiène, Sécurité).
- `assignation_rule` : Lien entre une catégorie et un service responsable.

## Interface Admin
- Pages CRUD simples pour gérer ces tables.
- Les formulaires de déclaration d'incident et de prévisualisation utiliseront ces tables dynamiquement au lieu de valeurs en dur.
