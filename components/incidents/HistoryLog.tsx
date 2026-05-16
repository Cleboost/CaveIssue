import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Activity } from 'lucide-react';
import { FormattedDate } from '@/components/ui/formatted-date';

export function HistoryLog({ history }: { history: any[] }) {
  if (history.length === 0) return null;

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'status_changed': return 'Changement de statut';
      case 'incident_created': return 'Signalement créé';
      case 'assigned_to_changed': return 'Assignation modifiée';
      case 'comment_added': return 'Nouveau commentaire';
      default: return action.replace('_', ' ');
    }
  };

  return (
    <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <History className="h-4 w-4 text-zinc-500" />
          Journal d'activité
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-800">
          {history.map((h) => (
            <div key={h.id} className="relative flex gap-4 pl-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shrink-0 z-10 mt-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {h.user?.name}
                  <span className="text-zinc-400 font-normal mx-2">•</span>
                  <span className="text-zinc-500 font-medium text-xs">{getActionLabel(h.action)}</span>
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  <FormattedDate date={h.createdAt} includeTime />
                </p>
                {h.details && (
                  <p className="text-xs text-zinc-500 leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    {h.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
