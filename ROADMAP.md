# ROADMAP - Gestion d'Incidents Cave Viticole

Ce fichier suit l'avancement du projet de gestion d'incidents. L'objectif est de permettre un signalement rapide et une analyse automatisée par IA pour faciliter la maintenance et la qualité.

## Vision du projet
Une application simple, modulaire et intelligente pour les employés de la cave, les responsables de service et le responsable qualité (admin).

---

## Fonctionnalités et Avancement

### 1. Authentification et Rôles
- [x] Mise à jour du schéma de base de données (ajout des rôles)
- [x] Configuration de Better-Auth pour les rôles
- [ ] Attribution du rôle admin au premier utilisateur
- [x] UI de connexion et redirection selon le rôle (Affichage du rôle)

### 2. Signalement d'Incident (Employé)
- [x] Création du formulaire ultra-minimaliste (champ texte uniquement)
- [ ] Gestion de l'envoi de la description au backend
- [ ] Ajout optionnel de photo (selon faisabilité)

### 3. Intelligence Artificielle (Analyse)
- [ ] Intégration du provider compatible OpenAI
- [ ] Design du Prompt système pour l'analyse d'incident
- [ ] Parsing de la réponse JSON structurée
- [ ] Gestion du niveau de confiance

### 4. Validation et Prévisualisation
- [ ] Page de revue après analyse IA
- [ ] Formulaire d'édition rapide des propositions IA
- [ ] Actions Valider / Modifier / Annuler

### 5. Persistance des Incidents
- [ ] Création de la table `incident` dans Drizzle
- [ ] Logique d'enregistrement définitif en base

### 6. Tableau de Bord et Listes
- [ ] Page de liste globale des incidents
- [ ] Implémentation des filtres (Statut, Gravité, Zone, Responsable)
- [ ] Optimisation de l'affichage mobile/tablette

### 7. Détail de l'Incident
- [ ] Page dédiée par incident
- [ ] Affichage complet des informations (Résumé IA, Actions suggérées, etc.)
- [ ] Vue de l'historique et des commentaires

### 8. Cycle de Vie et Statuts
- [ ] Système de transition de statuts (Nouveau -> En cours -> ...)
- [ ] Logique de clôture réservée à l'administrateur

### 9. Assignation Automatique
- [ ] Mapping automatique Catégorie -> Responsable/Service
- [ ] Notification ou indicateur visuel pour le responsable assigné

### 10. Supervision Qualité (Admin)
- [ ] Dashboard de supervision avec indicateurs clés (KPIs)
- [ ] Listes prioritaires (incidents critiques, anciens, non validés)

### 11. Collaboration (Commentaires)
- [ ] Système de commentaires pour les responsables
- [ ] Affichage chronologique dans le détail de l'incident

### 12. Résolution (Actions Correctives)
- [ ] Saisie des actions réalisées pour corriger le problème
- [ ] Distinction entre commentaire et action corrective

### 13. Audit et Historique
- [ ] Enregistrement automatique de chaque modification importante
- [ ] Affichage du journal d'activité sur la fiche incident

### 14. Sécurité et Droits d'Accès
- [ ] Middleware de protection des routes par rôle
- [ ] Masquage des actions non autorisées dans l'UI

### 15. Configuration et Modularité
- [ ] Interface de gestion des Zones
- [ ] Interface de gestion des Catégories
- [ ] Interface de gestion des Responsables et Règles d'assignation
- [ ] Paramétrage de l'IA (Modèle, Température, Prompt)

### 16. Données de Test (Seeding)
- [ ] Script de génération de données réalistes pour démonstration

### 17. Polissage UI/UX
- [ ] Refonte esthétique finale (Modernité, Simplicité)
- [ ] Retours utilisateurs (Toast, Loading states)

### 18. Validation Finale
- [ ] Test du parcours utilisateur complet (Employé -> IA -> Responsable -> Admin)

---

## Prochaines étapes immédiates
1. Implémenter la gestion des rôles dans la base de données et l'authentification.
2. Créer le formulaire de signalement initial.
