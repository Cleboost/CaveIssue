import { db } from '@/app/lib/db';
import { zone, category, assignmentRule } from '@/app/lib/db/schema';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { addZone, deleteZone, addCategory, deleteCategory, addAssignmentRule, deleteAssignmentRule } from '@/app/lib/admin/actions';
import { Trash2, Plus, Map, Tag, Users } from 'lucide-react';

export default async function ConfigPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'administrateur') {
    redirect('/');
  }

  const zones = await db.query.zone.findMany();
  const categories = await db.query.category.findMany();
  const rules = await db.query.assignmentRule.findMany({
    with: {
      category: true
    }
  });

  return (
    <div className="container py-8 px-4 mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-zinc-500">Gérez les zones, catégories et règles de l'application.</p>
      </div>

      <Tabs defaultValue="zones" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Zones
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Catégories
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assignation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Zones de la cave</CardTitle>
              <CardDescription>Ajoutez ou supprimez les zones physiques de la cave.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form action={async (formData: FormData) => {
                'use server';
                const name = formData.get('name') as string;
                if (name) await addZone(name);
              }} className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="zone-name">Nom de la zone</Label>
                  <Input id="zone-name" name="name" placeholder="Ex: Cuverie principale" required />
                </div>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </form>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones.map((z) => (
                    <TableRow key={z.id}>
                      <TableCell className="font-medium">{z.name}</TableCell>
                      <TableCell>
                        <form action={async () => {
                          'use server';
                          await deleteZone(z.id);
                        }}>
                          <Button type="submit" variant="ghost" size="icon" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Catégories d'incidents</CardTitle>
              <CardDescription>Définissez les types de problèmes qui peuvent survenir.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form action={async (formData: FormData) => {
                'use server';
                const name = formData.get('name') as string;
                if (name) await addCategory(name);
              }} className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="cat-name">Nom de la catégorie</Label>
                  <Input id="cat-name" name="name" placeholder="Ex: Maintenance matériel" required />
                </div>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </form>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <form action={async () => {
                          'use server';
                          await deleteCategory(c.id);
                        }}>
                          <Button type="submit" variant="ghost" size="icon" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Règles d'assignation automatique</CardTitle>
              <CardDescription>Définissez quel service est responsable de chaque catégorie d'incident.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form action={async (formData: FormData) => {
                'use server';
                const catId = formData.get('categoryId') as string;
                const assignedTo = formData.get('assignedTo') as string;
                if (catId && assignedTo) await addAssignmentRule(catId, assignedTo);
              }} className="flex items-end gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <select name="categoryId" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950" required>
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assigned-to">Responsable / Service</Label>
                    <Input id="assigned-to" name="assignedTo" placeholder="Ex: Maintenance" required />
                  </div>
                </div>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </form>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Service Responsable</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.category?.name}</TableCell>
                      <TableCell>{r.assignedTo}</TableCell>
                      <TableCell>
                        <form action={async () => {
                          'use server';
                          await deleteAssignmentRule(r.id);
                        }}>
                          <Button type="submit" variant="ghost" size="icon" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rules.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-zinc-500">Aucune règle définie.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
