'use client';

import { useState, useTransition } from 'react';
import { addComment } from '@/app/lib/incidents/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, CheckCircle, Send } from 'lucide-react';
import { FormattedDate } from '@/components/ui/formatted-date';

export function CommentSection({ incidentId, comments, currentUser }: { incidentId: string, comments: any[], currentUser: any }) {
  const [content, setContent] = useState('');
  const [isCorrective, setIsCorrective] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      await addComment(incidentId, content, isCorrective);
      setContent('');
      setIsCorrective(false);
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Commentaires et Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className={`flex gap-3 p-3 rounded-lg ${c.isCorrectiveAction ? 'bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900' : 'bg-zinc-50 dark:bg-zinc-900'}`}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs uppercase bg-primary/10 text-primary font-bold">
                    {c.author?.name?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{c.author?.name}</p>
                    <p className="text-[10px] text-zinc-500">
                      <FormattedDate date={c.createdAt} includeTime />
                    </p>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{c.content}</p>
                  {c.isCorrectiveAction && (
                    <Badge variant="outline" className="text-[10px] h-5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200">
                      Action corrective
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
            <Textarea
              placeholder="Ajouter un commentaire ou décrire une action..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
              disabled={isPending}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="corrective" 
                  checked={isCorrective} 
                  onCheckedChange={(v) => setIsCorrective(v === true)} 
                  disabled={isPending}
                />
                <Label htmlFor="corrective" className="text-sm cursor-pointer flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Marquer comme action corrective
                </Label>
              </div>
              <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
                {isPending ? 'Envoi...' : (
                  <>
                    Envoyer
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper to make Avatar work
function Badge({ children, variant, className }: any) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>;
}
