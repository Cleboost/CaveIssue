'use server';

import { db } from '@/app/lib/db';
import { zone, category, assignmentRule } from '@/app/lib/db/schema';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== 'administrateur') {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function addZone(name: string, description?: string) {
  await checkAdmin();
  await db.insert(zone).values({
    id: nanoid(),
    name,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  revalidatePath('/admin/config');
}

export async function deleteZone(id: string) {
  await checkAdmin();
  await db.delete(zone).where(eq(zone.id, id));
  revalidatePath('/admin/config');
}

export async function addCategory(name: string, description?: string) {
  await checkAdmin();
  await db.insert(category).values({
    id: nanoid(),
    name,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  revalidatePath('/admin/config');
}

export async function deleteCategory(id: string) {
  await checkAdmin();
  await db.delete(category).where(eq(category.id, id));
  revalidatePath('/admin/config');
}
