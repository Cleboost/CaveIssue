# Spécification Technique : Authentification et Rôles

## Objectif
Permettre de distinguer les utilisateurs par leur fonction (Employé, Responsable, Administrateur) afin de restreindre les accès et personnaliser l'expérience utilisateur.

## Modèle de données
Modification de la table `user` dans `app/lib/db/schema.ts` :
- Ajout d'une colonne `role` de type texte ou enum.
- Valeurs possibles : `employe`, `responsable`, `administrateur`.
- Valeur par défaut : `employe`.

## Implémentation
1. **Drizzle Schema :** Définir un `pgEnum` pour les rôles.
2. **Better-Auth :** Configurer le plugin `admin` ou étendre le schéma utilisateur pour inclure le champ `role` dans la session.
3. **Migration :** Générer et exécuter une migration Drizzle pour mettre à jour la base PostgreSQL.
4. **Client-side :** Mettre à jour `auth-client.ts` pour que le typage TypeScript reflète le nouveau champ `role`.

## Actions
- Créer un script ou une action pour promouvoir le premier utilisateur créé en tant qu'administrateur.
