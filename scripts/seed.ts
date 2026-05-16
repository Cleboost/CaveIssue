import { db } from '../app/lib/db';
import { zone, category } from '../app/lib/db/schema';
import { nanoid } from 'nanoid';

async function seed() {
  console.log('🌱 Seeding database...');

  const zonesToInsert = [
    { id: nanoid(), name: 'Cuverie principale', description: 'Stockage des cuves inox' },
    { id: nanoid(), name: 'Ligne d\'embouteillage', description: 'Zone de mise en bouteille' },
    { id: nanoid(), name: 'Cave de vieillissement', description: 'Fûts de chêne' },
    { id: nanoid(), name: 'Quai de déchargement', description: 'Réception des vendanges' },
    { id: nanoid(), name: 'Laboratoire', description: 'Analyses œnologiques' },
  ];

  const categoriesToInsert = [
    { id: nanoid(), name: 'Maintenance matériel', description: 'Panne de pompe, vanne, etc.' },
    { id: nanoid(), name: 'Hygiène et Nettoyage', description: 'Souci de propreté' },
    { id: nanoid(), name: 'Sécurité', description: 'Danger pour le personnel' },
    { id: nanoid(), name: 'Qualité œnologique', description: 'Problème sur le vin' },
    { id: nanoid(), name: 'Bâtiment', description: 'Fuite de toit, éclairage, etc.' },
  ];

  try {
    // Utilisation de onConflictDoNothing pour permettre de relancer le seed sans erreur
    await db.insert(zone)
      .values(zonesToInsert.map(z => ({ ...z, createdAt: new Date(), updatedAt: new Date() })))
      .onConflictDoNothing({ target: zone.name });
    console.log('✅ Zones seeded (skipped existing)');

    await db.insert(category)
      .values(categoriesToInsert.map(c => ({ ...c, createdAt: new Date(), updatedAt: new Date() })))
      .onConflictDoNothing({ target: category.name });
    console.log('✅ Categories seeded (skipped existing)');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }

  process.exit(0);
}

seed();
