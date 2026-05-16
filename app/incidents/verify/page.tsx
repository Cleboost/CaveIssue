'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { analyzeIncident } from '@/app/lib/ai/actions';
import { createIncident } from '@/app/lib/incidents/actions';
import { Loader2, AlertTriangle, CheckCircle2, Plus, X, Copy, ArrowRight } from 'lucide-react';

export default function VerifyIncidentPage() {
  const searchParams = useSearchParams();
  const description = searchParams.get('description');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [additionalInfo, setAdditionalInfo] = useState<{ key: string, value: string }[]>([]);
  const [pendingSuggestions, setPendingSuggestions] = useState<string[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const router = useRouter();
  const hasAnalyzed = useRef(false);

  useEffect(() => {
    if (description && !hasAnalyzed.current) {
      hasAnalyzed.current = true;
      analyzeIncident(description).then((res) => {
        setAnalysis(res);
        setPendingSuggestions(res.missing_info_list || []);
        if (res.potential_duplicate) {
          setShowDuplicateWarning(true);
        }
        setLoading(false);
      });
    }
  }, [description]);

  const handleAddSuggestion = (suggestion: string, index: number) => {
    setAdditionalInfo([...additionalInfo, { key: suggestion, value: '' }]);
    const newList = [...pendingSuggestions];
    newList.splice(index, 1);
    setPendingSuggestions(newList);
  };

  const handleRemoveInfo = (index: number) => {
    const item = additionalInfo[index];
    const newList = [...additionalInfo];
    newList.splice(index, 1);
    setAdditionalInfo(newList);
    setPendingSuggestions([...pendingSuggestions, item.key]);
  };

  const handleInfoChange = (index: number, value: string) => {
    const newList = [...additionalInfo];
    newList[index].value = value;
    setAdditionalInfo(newList);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const enhancedSummary = additionalInfo.length > 0 
        ? `${analysis.summary}\n\nCompléments : ${additionalInfo.map(i => `${i.key}: ${i.value}`).join(', ')}`
        : analysis.summary;

      await createIncident({
        ...analysis,
        summary: enhancedSummary,
        originalDescription: description,
      });
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-zinc-500 animate-pulse font-medium">L'IA analyse votre signalement...</p>
      </div>
    );
  }

  // Écran d'alerte Doublon
  if (showDuplicateWarning && analysis.potential_duplicate) {
    return (
      <div className="container max-w-2xl py-12 px-4 mx-auto">
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Copy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-2xl text-amber-800 dark:text-amber-300">Incident similaire trouvé</CardTitle>
            <CardDescription className="text-amber-700/80 dark:text-amber-400/80">
              L'IA a détecté un incident qui semble identique à votre description.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 space-y-3">
              <h3 className="font-bold text-lg">{analysis.potential_duplicate.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">"{analysis.potential_duplicate.summary}"</p>
              <div className="pt-2 border-t text-xs font-medium text-amber-700 dark:text-amber-400">
                Raison de l'IA : {analysis.potential_duplicate.reason}
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">S'agit-il du même problème ?</p>
              <p className="text-sm text-zinc-500">Si oui, il n'est pas nécessaire de créer un nouveau signalement.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white border-none h-12 text-base font-bold"
              onClick={() => router.push(`/incidents/${analysis.potential_duplicate.id}`)}
            >
              Oui, voir l'incident existant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-zinc-500 hover:text-zinc-900" 
              onClick={() => setShowDuplicateWarning(false)}
            >
              Non, signaler comme un nouveau problème
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 px-4 mx-auto">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold">Vérification de l'incident</h1>
        <p className="text-zinc-500 text-sm">
          Voici ce que l'IA a compris. Vous pouvez modifier ces informations avant de valider.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Analyse Automatique
              <Badge variant={analysis.confidence > 0.7 ? "default" : "outline"} className="font-bold">
                {Math.round(analysis.confidence * 100)}% de confiance
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Titre de l'incident</Label>
              <Input 
                id="title" 
                value={analysis.title} 
                onChange={(e) => setAnalysis({...analysis, title: e.target.value})}
                className="font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zone" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Zone</Label>
                <Input 
                  id="zone" 
                  value={analysis.zone} 
                  onChange={(e) => setAnalysis({...analysis, zone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Gravité</Label>
                <Select 
                  value={analysis.priority} 
                  onValueChange={(v) => setAnalysis({...analysis, priority: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basse">Basse</SelectItem>
                    <SelectItem value="moyenne">Moyenne</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="critique">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Résumé professionnel</Label>
              <Textarea 
                id="summary" 
                value={analysis.summary} 
                onChange={(e) => setAnalysis({...analysis, summary: e.target.value})}
                className="min-h-[100px] leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Actions suggérées</Label>
              <div className="space-y-2">
                {analysis.suggested_actions.map((action: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-sm">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {additionalInfo.map((info, index) => (
              <div key={index} className="space-y-2 p-4 bg-primary/5 border border-primary/20 rounded-xl relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-2 h-6 w-6 text-zinc-400 hover:text-red-500"
                  onClick={() => handleRemoveInfo(index)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Label className="text-[10px] font-extrabold uppercase tracking-widest text-primary">{info.key}</Label>
                <Input 
                  placeholder="Complétez cette information..."
                  value={info.value}
                  onChange={(e) => handleInfoChange(index, e.target.value)}
                  className="bg-white dark:bg-zinc-950 border-primary/20 focus:border-primary"
                  autoFocus
                />
              </div>
            ))}

            {pendingSuggestions.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Informations manquantes :</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pendingSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-7 font-bold border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400"
                      onClick={() => handleAddSuggestion(suggestion, index)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t bg-zinc-50/50 dark:bg-zinc-950/50">
            <Button variant="ghost" type="button" onClick={() => router.back()} className="flex-1 order-2 sm:order-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1 order-1 sm:order-2 shadow-lg shadow-primary/20" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : 'Valider et Créer'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
