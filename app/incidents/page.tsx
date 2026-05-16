import { db } from '@/app/lib/db';
import { incident } from '@/app/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  MapPin, 
  Clock, 
  User as UserIcon,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { cn } from '@/app/lib/utils';

export default async function IncidentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p>Veuillez vous connecter pour voir les incidents.</p>
      </div>
    );
  }

  const whereClause = session.user.role === 'employe' ? eq(incident.reporterId, session.user.id) : undefined;

  const list = await db.query.incident.findMany({
    where: whereClause,
    orderBy: [desc(incident.createdAt)],
    with: {
      reporter: true,
    }
  });

  const getPriorityInfo = (p: string) => {
    switch (p) {
      case 'critique': return { color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900', icon: AlertTriangle };
      case 'haute': return { color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900', icon: AlertTriangle };
      case 'moyenne': return { color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900', icon: Clock };
      default: return { color: 'text-zinc-600 bg-zinc-50 border-zinc-200 dark:bg-zinc-950/20 dark:border-zinc-800', icon: Clock };
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'cloture': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'resolu': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'en_cours': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
      default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-zinc-500">
            {session.user.role === 'employe' ? 'Suivez vos signalements personnels.' : 'Supervisez l\'ensemble des signalements de la cave.'}
          </p>
        </div>
        <Button asChild className="shadow-lg shadow-primary/20">
          <Link href="/incidents/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau signalement
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
                  <input 
                    placeholder="Titre, zone..." 
                    className="w-full pl-8 h-9 rounded-md border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-zinc-800 dark:bg-zinc-950"
                  />
                </div>
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full justify-start text-zinc-600" size="sm">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  Plus de filtres
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-primary uppercase">Besoin d'aide ?</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                L'IA analyse automatiquement vos descriptions pour gagner du temps.
              </p>
            </CardContent>
          </Card>
        </aside>

        <div className="md:col-span-3 space-y-4">
          {list.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center">
                  <ListTodo className="h-6 w-6 text-zinc-400" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">Aucun incident</p>
                  <p className="text-sm text-zinc-500">Tout est calme pour le moment.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {list.map((item) => {
                const priority = getPriorityInfo(item.priority || '');
                const PriorityIcon = priority.icon;
                
                return (
                  <Link key={item.id} href={`/incidents/${item.id}`}>
                    <Card className="group hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden border-l-4" style={{ borderLeftColor: item.priority === 'critique' ? '#ef4444' : item.priority === 'haute' ? '#f59e0b' : '#3b82f6' }}>
                      <CardContent className="p-0">
                        <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("px-2 py-0 h-5 text-[10px] uppercase font-bold tracking-tight", getStatusColor(item.status))}>
                                {item.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-zinc-400">•</span>
                              <span className="text-xs text-zinc-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                                <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                                  {item.zoneId || 'Zone non spécifiée'}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                                  <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
                                  {item.reporter?.name}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-4 sm:pt-0">
                            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold", priority.color)}>
                              <PriorityIcon className="h-3.5 w-3.5" />
                              <span className="capitalize">{item.priority}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 group-hover:text-primary">
                              <ArrowUpRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
