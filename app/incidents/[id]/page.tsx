import { db } from '@/app/lib/db';
import { incident } from '@/app/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  MapPin, 
  Tag as TagIcon, 
  User as UserIcon, 
  AlertCircle, 
  CheckCircle2, 
  Shield,
  MessageSquare,
  FileText,
  Activity
} from 'lucide-react';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { StatusManager } from '@/components/incidents/StatusManager';
import { CommentSection } from '@/components/incidents/CommentSection';
import { HistoryLog } from '@/components/incidents/HistoryLog';
import { cn } from '@/app/lib/utils';
import { FormattedDate } from '@/components/ui/formatted-date';

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p>Veuillez vous connecter pour voir les détails de l'incident.</p>
      </div>
    );
  }

  const item = await db.query.incident.findFirst({
    where: eq(incident.id, id),
    with: {
      reporter: true,
      zone: true,
      category: true,
      comments: {
        with: {
          author: true,
        },
      },
      history: {
        with: {
          user: true,
        },
      }
    }
  });

  if (!item) {
    notFound();
  }

  const sortedComments = [...item.comments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const sortedHistory = [...item.history].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const suggestedActions = item.aiSuggestedActions ? JSON.parse(item.aiSuggestedActions) : [];

  const getPriorityInfo = (p: string) => {
    switch (p) {
      case 'critique': return { color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900', icon: AlertCircle };
      case 'haute': return { color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900', icon: AlertCircle };
      case 'moyenne': return { color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900', icon: Clock };
      default: return { color: 'text-zinc-600 bg-zinc-50 border-zinc-200 dark:bg-zinc-950/20 dark:border-zinc-800', icon: Clock };
    }
  };

  const priority = getPriorityInfo(item.priority || '');
  const PriorityIcon = priority.icon;

  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-950/50 min-h-[calc(100vh-64px)]">
      <div className="container max-w-6xl py-8 px-4 mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-white dark:bg-zinc-900 text-[10px] uppercase font-bold tracking-wider py-0.5">
                INCIDENT #{item.id.substring(0, 8)}
              </Badge>
              <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider", priority.color)}>
                <PriorityIcon className="h-3 w-3" />
                {item.priority}
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {item.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Déclaré le <FormattedDate date={item.createdAt} includeTime /></span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>Par <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.reporter?.name}</span></span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 shrink-0">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Statut actuel</p>
            <StatusManager 
              incidentId={item.id} 
              currentStatus={item.status} 
              userRole={session.user.role} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="overflow-hidden border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
              <CardHeader className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Description & Analyse
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 bg-zinc-50/50 dark:bg-zinc-950/20">
                  <p className="text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                    "{item.originalDescription}"
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                    <Shield className="h-4 w-4" />
                    Synthèse de l'Intelligence Artificielle
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {item.aiSummary}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Actions recommandées
                </CardTitle>
                <CardDescription>Étapes suggérées par l'IA pour la résolution.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedActions.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-sm border border-zinc-100 dark:border-zinc-800">
                      <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        {i + 1}
                      </div>
                      <span className="text-zinc-700 dark:text-zinc-300">{action}</span>
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

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white dark:bg-zinc-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Informations Clés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Localisation</p>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{(item as any).zone?.name || item.zoneId || 'Non spécifiée'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <TagIcon className="h-4 w-4 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Type d'incident</p>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{(item as any).category?.name || item.categoryId || 'Non spécifiée'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <Shield className="h-4 w-4 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Responsable</p>
                      <p className="font-semibold text-primary">{item.assignedTo || 'En attente d\'assignation'}</p>
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-zinc-100 dark:bg-zinc-800" />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Confiance IA</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{Math.round(Number(item.aiConfidence || 0) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${Math.round(Number(item.aiConfidence || 0) * 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <HistoryLog history={sortedHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
