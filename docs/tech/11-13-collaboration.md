# Spécification Technique : Collaboration et Suivi

## Objectif
Permettre aux responsables d'agir sur l'incident et de communiquer sur l'avancement.

## Commentaires
- Table `comment` liée à `incident`.
- Affichage chronologique (plus récent en bas).

## Actions Correctives
- Champ spécifique dans l'incident ou table d'actions pour lister les travaux effectués.

## Historique d'Audit
- Table `incident_history` qui enregistre chaque changement de statut ou de responsable.
- Déclenché par les Server Actions de mise à jour.
