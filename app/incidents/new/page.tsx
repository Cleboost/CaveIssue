'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { authClient } from '@/app/lib/auth-client';

export default function NewIncidentPage() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    // For now, we just simulate the AI analysis by redirecting with the description in the state
    // In a real flow, this would call a server action that interacts with the IA provider
    setTimeout(() => {
      setLoading(false);
      // We will implement the analysis page next
      router.push(`/incidents/verify?description=${encodeURIComponent(description)}`);
    }, 1000);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Veuillez vous connecter pour signaler un incident.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-lg shadow-lg border-zinc-200 dark:border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Signaler un incident</CardTitle>
          <CardDescription>
            Décrivez simplement ce que vous voyez. L'IA s'occupe du reste.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Que se passe-t-il ?
              </Label>
              <textarea
                id="description"
                placeholder="Ex: Fuite d'eau sous la cuve 12, vanne basse qui semble desserrée."
                className="flex min-h-30 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
          <div className="p-6">
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading || !description.trim()}>
              {loading ? 'Analyse en cours...' : 'Envoyer pour analyse'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
