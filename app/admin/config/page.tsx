import { db } from '@/app/lib/db';
import { zone, category } from '@/app/lib/db/schema';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { addZone, deleteZone, addCategory, deleteCategory } from '@/app/lib/admin/actions';
import { Trash2, Plus, Map, Tag } from 'lucide-react';

export default async function ConfigPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'administrateur') {
    redirect('/');
  }

  const zones = await db.query.zone.findMany();
  const categories = await db.query.category.findMany();

  return (
    <div className="container py-8 px-4 mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-zinc-500">Gérez les zones, catégories et règles de l'application.</p>
      </div>

      <Tabs defaultValue="zones" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Zones
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Catégories
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
      </Tabs>
    </div>
  );
}
