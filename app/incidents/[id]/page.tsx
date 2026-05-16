import { db } from '@/app/lib/db';
import { incident } from '@/app/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, Tag, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { StatusManager } from '@/components/incidents/StatusManager';
import { CommentSection } from '@/components/incidents/CommentSection';
import { HistoryLog } from '@/components/incidents/HistoryLog';

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Veuillez vous connecter pour voir les détails de l'incident.</p>
      </div>
    );
  }

  const item = await db.query.incident.findFirst({
    where: eq(incident.id, id),
    with: {
      reporter: true,
      comments: {
        with: {
          author: true,
        },
        orderBy: [desc(incident.createdAt)], // This is actually 'comment.createdAt' but the schema name is used in relations
      },
      history: {
        with: {
          user: true,
        },
        orderBy: [desc(incident.createdAt)],
      }
    }
  });

  if (!item) {
    notFound();
  }

  // Correction du tri car drizzle relations orderBy peut être capricieux sur les noms de colonnes dans with
  const sortedComments = [...item.comments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const sortedHistory = [...item.history].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const suggestedActions = item.aiSuggestedActions ? JSON.parse(item.aiSuggestedActions) : [];

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'critique': return 'destructive';
      case 'haute': return 'default';
      case 'moyenne': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container max-w-5xl py-8 px-4 mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>
            <Badge variant={getPriorityColor(item.priority || '')} className="capitalize">
              {item.priority}
            </Badge>
          </div>
          <p className="text-zinc-500 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            Déclaré le {item.createdAt.toLocaleDateString('fr-FR')} à {item.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        <StatusManager 
          incidentId={item.id} 
          currentStatus={item.status} 
          userRole={session.user.role} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résumé de l'incident</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm dark:prose-invert">
                <p className="text-zinc-700 dark:text-zinc-300 italic">
                  "{item.originalDescription}"
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Analyse IA :</h3>
                <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                  {item.aiSummary}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions recommandées</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {suggestedActions.map((action: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <CommentSection 
            incidentId={item.id} 
            comments={sortedComments} 
            currentUser={session.user} 
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-zinc-400" />
                <div>
                  <p className="text-zinc-500 text-xs">Zone</p>
                  <p className="font-medium">{item.zoneId || 'Non spécifiée'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-zinc-400" />
                <div>
                  <p className="text-zinc-500 text-xs">Catégorie</p>
                  <p className="font-medium">{item.categoryId || 'Non spécifiée'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-zinc-400" />
                <div>
                  <p className="text-zinc-500 text-xs">Déclaré par</p>
                  <p className="font-medium">{(item as any).reporter?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-zinc-400" />
                <div>
                  <p className="text-zinc-500 text-xs">Responsable</p>
                  <p className="font-medium">{item.assignedTo || 'À définir'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <HistoryLog history={sortedHistory} />
        </div>
      </div>
    </div>
  );
}
