# Spécification Technique : Signalement d'Incident

## Objectif
Offrir l'interface la plus simple possible pour qu'un employé puisse signaler un problème sans friction.

## Composants UI
- Un champ texte de type `Textarea` pour la description "libre".
- Un bouton "Envoyer" qui déclenche l'analyse.

## Logique Backend
- Une Server Action ou une Route API qui reçoit la description.
- Validation de la longueur minimale de la description (Zod).
- Redirection vers la page de prévisualisation (Analyse IA).

## Modèle de données (Temporaire)
- La description peut être stockée temporairement dans l'URL ou dans un état de session (si l'IA n'est pas appelée immédiatement) avant d'être persistée dans la table `incident`.
