import { db } from '@/app/lib/db';
import { incident } from '@/app/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter } from 'lucide-react';

export default async function IncidentsPage() {
  const list = await db.query.incident.findMany({
    orderBy: [desc(incident.createdAt)],
    with: {
      reporter: true,
    }
  });

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'critique': return 'destructive';
      case 'haute': return 'default';
      case 'moyenne': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container py-8 px-4 mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-zinc-500">Liste de tous les incidents signalés dans la cave.</p>
        </div>
        <Button asChild>
          <Link href="/incidents/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="search"
                placeholder="Rechercher un incident..."
                className="w-full rounded-md border border-zinc-200 bg-white pl-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Gravité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                    Aucun incident trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <TableCell className="font-medium">
                      <Link href={`/incidents/${item.id}`} className="block">
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell>{item.zoneId || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(item.priority || '')} className="capitalize">
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.assignedTo || 'Non assigné'}</TableCell>
                    <TableCell>{item.createdAt.toLocaleDateString('fr-FR')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
