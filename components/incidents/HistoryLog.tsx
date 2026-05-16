import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Activity } from 'lucide-react';
import { FormattedDate } from '@/components/ui/formatted-date';

export function HistoryLog({ history }: { history: any[] }) {
  if (history.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Journal d'activité
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent dark:before:via-zinc-800">
          {history.map((h, i) => (
            <div key={h.id} className="relative flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shrink-0 z-10">
                <Activity className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    <span className="text-primary">{h.user?.name}</span>
                    <span className="text-zinc-500 mx-1">•</span>
                    <span className="capitalize text-zinc-700 dark:text-zinc-300">{h.action.replace('_', ' ')}</span>
                  </p>
                  <div className="text-[10px] text-zinc-400 shrink-0">
                    <FormattedDate date={h.createdAt} />
                  </div>
                </div>
                {h.details && (
                  <p className="text-xs text-zinc-500 mt-0.5">{h.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
