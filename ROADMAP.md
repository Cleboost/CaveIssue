# ROADMAP - Gestion d'Incidents Cave Viticole

Ce fichier suit l'avancement du projet de gestion d'incidents. L'objectif est de permettre un signalement rapide et une analyse automatisée par IA pour faciliter la maintenance et la qualité.

## Vision du projet
Une application simple, modulaire et intelligente pour les employés de la cave, les responsables de service et le responsable qualité (admin).

---

## Fonctionnalités et Avancement

### 1. Authentification et Rôles
- [x] Mise à jour du schéma de base de données (ajout des rôles)
- [x] Configuration de Better-Auth pour les rôles
- [x] UI de connexion et affichage du rôle

### 2. Signalement d'Incident (Employé)
- [x] Création du formulaire ultra-minimaliste (champ texte uniquement)
- [x] Gestion de l'envoi de la description au backend
- [x] Ajout dynamique des informations manquantes demandées par l'IA

### 3. Intelligence Artificielle (Analyse)
- [x] Intégration du provider compatible OpenAI (NVIDIA NIM via lib official openai)
- [x] Design du Prompt système pour l'analyse d'incident
- [x] Parsing de la réponse JSON structurée
- [x] Gestion du niveau de confiance et des informations manquantes

### 4. Validation et Prévisualisation
- [x] Page de revue après analyse IA
- [x] Formulaire d'édition rapide des propositions IA
- [x] Actions Valider / Modifier / Annuler

### 5. Persistance des Incidents
- [x] Création de la table `incident` dans Drizzle
- [x] Logique d'enregistrement définitif en base
- [x] Création automatique du journal d'historique à la création

### 6. Tableau de Bord et Listes
- [x] Page de liste globale des incidents
- [x] Filtrage automatique par rôle (l'employé ne voit que ses incidents)
- [x] Affichage visuel des gravités et statuts via Badges

### 7. Détail de l'Incident
- [x] Page dédiée par incident
- [x] Affichage complet des informations (Résumé IA, Actions suggérées)
- [x] Intégration de la gestion de statut, des commentaires et de l'historique

### 8. Cycle de Vie et Statuts
- [x] Système de transition de statuts (Nouveau -> En cours -> ...)
- [x] Logique de clôture réservée à l'administrateur

### 9. Assignation Automatique
- [x] Mapping automatique Catégorie -> Responsable/Service via l'IA
- [x] Respect des règles d'assignation configurées par l'admin

### 10. Supervision Qualité (Admin)
- [x] Dashboard de supervision avec indicateurs clés (KPIs)
- [x] Accès rapide aux derniers incidents

### 11. Collaboration (Commentaires)
- [x] Système de commentaires pour les responsables
- [x] Affichage chronologique dans le détail de l'incident

### 12. Résolution (Actions Correctives)
- [x] Saisie des actions réalisées pour corriger le problème
- [x] Distinction visuelle des actions correctives

### 13. Audit et Historique
- [x] Enregistrement automatique de chaque modification importante (Statut, Création)
- [x] Affichage du journal d'activité sur la fiche incident

### 14. Sécurité et Droits d'Accès
- [x] Middleware de protection des routes par rôle
- [x] Masquage des actions non autorisées (ex: Clôture réservée à l'admin)

### 15. Configuration et Modularité
- [x] Interface de gestion des Zones (Ajout/Suppression)
- [x] Interface de gestion des Catégories (Ajout/Suppression)
- [x] Interface de gestion des Règles d'assignation

### 16. Données de Test (Seeding)
- [x] Script de génération de données réalistes (Zones et Catégories) : `bun db:seed`

### 17. Polissage UI/UX
- [x] Refonte esthétique complète (Navigation, Dashboard, Listes, Détails)
- [x] Design moderne et professionnel adapté au secteur viticole
- [x] Utilisation de composants Shadcn avancés (Dropdown, Tabs, ScrollArea)

### 18. Validation Finale
- [ ] Test du parcours utilisateur complet (Employé -> IA -> Responsable -> Admin)
- [ ] Vérification de la cohérence des notifications (Sonner)

---

## Prochaines étapes
1. Effectuer une passe de test final pour valider le parcours complet.
2. Préparer la documentation finale.
