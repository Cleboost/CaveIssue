import Link from 'next/link';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  PlusCircle, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  History,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { db } from '@/app/lib/db';
import { incident } from '@/app/lib/db/schema';
import { count, eq, and, ne, desc } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import { cn } from './lib/utils';

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Gérez vos incidents en un clin d'œil.</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            La solution intelligente pour les caves viticoles. Signalez, analysez et résolvez les problèmes avec l'aide de l'IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild size="lg" className="flex-1 font-semibold h-12 text-base">
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1 font-semibold h-12 text-base">
              <Link href="/register">Créer un compte</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Stats pour l'utilisateur
  const userIncidentsCount = await db.select({ value: count() })
    .from(incident)
    .where(and(eq(incident.reporterId, session.user.id), ne(incident.status, 'cloture')));

  const latestIncidents = await db.query.incident.findMany({
    where: eq(incident.reporterId, session.user.id),
    orderBy: [desc(incident.createdAt)],
    limit: 3,
  });

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Bonjour, {session.user.name} 👋</h1>
          <p className="text-zinc-500">Prêt pour une nouvelle journée à la cave ?</p>
        </div>
        <Button asChild size="lg" className="shadow-lg shadow-primary/20">
          <Link href="/incidents/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Signaler un incident
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 dark:from-zinc-900 dark:to-primary/10 overflow-hidden relative">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Zap className="h-32 w-32 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Signalement Intelligent
            </CardTitle>
            <CardDescription className="max-w-md">
              Plus besoin de formulaires interminables. Écrivez une phrase, notre IA s'occupe de remplir la fiche technique.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border rounded-xl p-4 italic text-sm text-zinc-600 dark:text-zinc-400">
              "Il y a une fuite importante sur la vanne de purge de la cuve 402."
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="link" className="px-0 text-primary">
              <Link href="/incidents/new" className="flex items-center">
                Essayer maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-zinc-500" />
              Mes actions
            </CardTitle>
            <CardDescription>Vos signalements en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{userIncidentsCount[0].value}</div>
            <p className="text-sm text-zinc-500 mt-1">incidents ouverts</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="ghost" size="sm" className="w-full justify-start px-0 text-zinc-500 hover:text-primary">
              <Link href="/incidents" className="flex items-center">
                Voir tous mes incidents
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-zinc-500" />
          Dernières activités
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {latestIncidents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl text-zinc-500">
              Vous n'avez pas encore signalé d'incident.
            </div>
          ) : (
            latestIncidents.map((item) => (
              <Link key={item.id} href={`/incidents/${item.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                        item.status === 'cloture' ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
                      )}>
                        {item.status === 'cloture' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold group-hover:text-primary transition-colors">{item.title}</p>
                        <p className="text-xs text-zinc-500">Déclaré le {new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize hidden sm:inline-flex">{item.priority}</Badge>
                      <Badge className="capitalize">{item.status.replace('_', ' ')}</Badge>
                      <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
