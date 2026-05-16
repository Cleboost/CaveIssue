'use server';

import { db } from '@/app/lib/db';
import { incident, comment, incidentHistory } from '@/app/lib/db/schema';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createIncident(formData: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const id = nanoid();
  
  // Résolution des IDs pour la zone et la catégorie à partir de leurs noms
  let zoneId = null;
  let categoryId = null;
  let finalAssignedTo = formData.responsible_service || 'Maintenance';

  if (formData.zone) {
    const matchedZone = await db.query.zone.findFirst({
      where: (z, { eq }) => eq(z.name, formData.zone)
    });
    if (matchedZone) zoneId = matchedZone.id;
  }

  if (formData.category) {
    const matchedCategory = await db.query.category.findFirst({
      where: (cat, { eq }) => eq(cat.name, formData.category)
    });

    if (matchedCategory) {
      categoryId = matchedCategory.id;
      const rule = await db.query.assignmentRule.findFirst({
        where: (r, { eq }) => eq(r.categoryId, matchedCategory.id)
      });
      if (rule) finalAssignedTo = rule.assignedTo;
    }
  }

  await db.insert(incident).values({
    id,
    reporterId: session.user.id,
    originalDescription: formData.originalDescription,
    title: formData.title,
    zoneId,
    categoryId,
    assignedTo: finalAssignedTo,
    aiSummary: formData.summary,
    aiSuggestedActions: JSON.stringify(formData.suggested_actions),
    aiMissingInfo: formData.missing_info,
    aiConfidence: formData.confidence.toString(),
    priority: formData.priority,
    status: 'nouveau',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Log de création dans l'historique
  await db.insert(incidentHistory).values({
    id: nanoid(),
    incidentId: id,
    userId: session.user.id,
    action: 'creation',
    details: 'Incident déclaré et analysé par IA',
    createdAt: new Date(),
  });

  redirect(`/incidents/${id}`);
}

export async function addComment(incidentId: string, content: string, isCorrectiveAction = false) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  await db.insert(comment).values({
    id: nanoid(),
    incidentId,
    userId: session.user.id,
    content,
    isCorrectiveAction,
    createdAt: new Date(),
  });

  // Log dans l'historique si c'est une action corrective
  if (isCorrectiveAction) {
    await db.insert(incidentHistory).values({
      id: nanoid(),
      incidentId,
      userId: session.user.id,
      action: 'action_corrective',
      details: content,
      createdAt: new Date(),
    });
  }

  revalidatePath(`/incidents/${incidentId}`);
}

export async function updateIncidentStatus(incidentId: string, newStatus: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  const oldIncident = await db.query.incident.findFirst({
    where: eq(incident.id, incidentId),
  });

  if (!oldIncident) throw new Error('Incident not found');

  await db.update(incident)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(incident.id, incidentId));

  await db.insert(incidentHistory).values({
    id: nanoid(),
    incidentId,
    userId: session.user.id,
    action: 'status_change',
    details: `Passage de ${oldIncident.status} à ${newStatus}`,
    createdAt: new Date(),
  });

  revalidatePath(`/incidents/${incidentId}`);
}
