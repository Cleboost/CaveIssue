import { db } from '@/app/lib/db';
import { incident } from '@/app/lib/db/schema';
import { count, eq, and, ne, desc, lt } from 'drizzle-orm';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, CheckCircle2, ListFilter, ShieldAlert, Tag, AlertTriangle } from 'lucide-react';
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
  const [critical] = await db.select({ value: count() }).from(incident).where(and(eq(incident.priority, 'critique'), ne(incident.status, 'cloture')));
  const [pending] = await db.select({ value: count() }).from(incident).where(eq(incident.status, 'nouveau'));
  
  const recentIncidents = await db.query.incident.findMany({
    orderBy: [desc(incident.createdAt)],
    limit: 5,
    with: {
      reporter: true,
    }
  });

  // Récupération des alertes réelles
  // 1. Incidents critiques non clôturés
  const criticalAlerts = await db.query.incident.findMany({
    where: and(eq(incident.priority, 'critique'), ne(incident.status, 'cloture')),
    orderBy: [desc(incident.createdAt)],
    limit: 3
  });

  // 2. Incidents en retard (Nouveau depuis plus de 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const delayedIncidents = await db.query.incident.findMany({
    where: and(eq(incident.status, 'nouveau'), lt(incident.createdAt, oneDayAgo)),
    orderBy: [desc(incident.createdAt)],
    limit: 3
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Supervision Qualité</h1>
          <p className="text-zinc-500">Vue d'ensemble de l'état de la cave.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/config">
            <Tag className="h-4 w-4 mr-2 text-zinc-500" />
            Paramètres
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">{s.title}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Derniers signalements
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentIncidents.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/incidents/${item.id}`}
                  className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.title}</p>
                    <p className="text-xs text-zinc-500">{item.zoneId || 'Zone inconnue'} • par {item.reporter.name}</p>
                  </div>
                  <Badge variant={item.priority === 'critique' ? 'destructive' : 'outline'} className="capitalize font-bold text-[10px]">
                    {item.priority}
                  </Badge>
                </Link>
              ))}
            </div>
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button asChild variant="ghost" className="w-full text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-primary">
                <Link href="/incidents">Voir tous les incidents</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertes et Retards
            </CardTitle>
            <CardDescription>Actions urgentes nécessitant votre attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalAlerts.length === 0 && delayedIncidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Tout est sous contrôle</p>
                  <p className="text-xs text-zinc-500 max-w-[250px]">Aucun incident critique ou retard majeur détecté.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {criticalAlerts.map((alert) => (
                  <Link key={alert.id} href={`/incidents/${alert.id}`}>
                    <div className="p-3 rounded-xl border border-red-100 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900 flex items-start gap-3 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                      <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-900 dark:text-red-400 uppercase text-[10px] tracking-widest">CRITIQUE</p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{alert.title}</p>
                        <p className="text-xs text-zinc-500">Ouvert le {new Date(alert.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {delayedIncidents.map((alert) => (
                  <Link key={alert.id} href={`/incidents/${alert.id}`}>
                    <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900 flex items-start gap-3 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
                      <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-400 uppercase text-[10px] tracking-widest">RETARD (+24h)</p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{alert.title}</p>
                        <p className="text-xs text-zinc-500">Toujours au statut "Nouveau"</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Button({ children, variant, className, asChild }: any) {
  const Comp = asChild ? 'span' : 'button';
  return <Comp className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' : variant === 'outline' ? 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground' : 'bg-primary text-primary-foreground shadow hover:bg-primary/90'} ${className}`}>{children}</Comp>;
}
