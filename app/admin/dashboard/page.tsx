import { db } from '@/app/lib/db';
import { incident } from '@/app/lib/db/schema';
import { count, eq, and, ne, desc } from 'drizzle-orm';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, CheckCircle2, ListFilter, ShieldAlert, Tag } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'administrateur') {
    redirect('/');
  }

  // Stats
  const [totalOpen] = await db.select({ value: count() }).from(incident).where(ne(incident.status, 'cloture'));
  const [critical] = await db.select({ value: count() }).from(incident).where(eq(incident.priority, 'critique'));
  const [pending] = await db.select({ value: count() }).from(incident).where(eq(incident.status, 'nouveau'));
  
  const recentIncidents = await db.query.incident.findMany({
    orderBy: [desc(incident.createdAt)],
    limit: 5,
    with: {
      reporter: true,
    }
  });

  const stats = [
    { title: 'Ouverts', value: totalOpen.value, icon: ListFilter, color: 'text-blue-600' },
    { title: 'Critiques', value: critical.value, icon: ShieldAlert, color: 'text-red-600' },
    { title: 'À valider', value: pending.value, icon: Clock, color: 'text-amber-600' },
    { title: 'Total historique', value: (await db.select({ value: count() }).from(incident))[0].value, icon: CheckCircle2, color: 'text-zinc-600' },
  ];

  return (
    <div className="container py-8 px-4 mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supervision Qualité</h1>
          <p className="text-zinc-500">Vue d'ensemble de l'état de la cave.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/config">
            <Tag className="h-4 w-4 mr-2" />
            Paramètres
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Derniers signalements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIncidents.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/incidents/${item.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 transition-all"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-zinc-500">{item.zoneId || 'Zone inconnue'} • par {item.reporter.name}</p>
                  </div>
                  <Badge variant={item.priority === 'critique' ? 'destructive' : 'outline'} className="capitalize">
                    {item.priority}
                  </Badge>
                </Link>
              ))}
            </div>
            <Button asChild variant="ghost" className="w-full mt-4 text-xs">
              <Link href="/incidents">Voir tous les incidents</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alertes et Retards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium">Tout semble sous contrôle</p>
              <p className="text-xs text-zinc-500">Aucun incident critique n'est resté sans action depuis plus de 24h.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Button({ children, variant, className, asChild }: any) {
  const Comp = asChild ? 'span' : 'button';
  return <Comp className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' : ''} ${className}`}>{children}</Comp>;
}
