'use server';

import { db } from '@/app/lib/db';
import { incident } from '@/app/lib/db/schema';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';

export async function createIncident(formData: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const id = nanoid();
  
  await db.insert(incident).values({
    id,
    reporterId: session.user.id,
    originalDescription: formData.originalDescription,
    title: formData.title,
    // For now we store as strings if IDs are not provided or if we use names directly for MVP
    // We'll link to actual zone/category IDs in a later step when config is ready
    aiSummary: formData.summary,
    aiSuggestedActions: JSON.stringify(formData.suggested_actions),
    aiMissingInfo: formData.missing_info,
    aiConfidence: formData.confidence.toString(),
    priority: formData.priority,
    status: 'nouveau',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  redirect(`/incidents/${id}`);
}
