'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { analyzeIncident } from '@/app/lib/ai/actions';
import { createIncident } from '@/app/lib/incidents/actions';
import { Loader2, AlertTriangle, CheckCircle2, Plus, X } from 'lucide-react';

export default function VerifyIncidentPage() {
  const searchParams = useSearchParams();
  const description = searchParams.get('description');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [additionalInfo, setAdditionalInfo] = useState<{ key: string, value: string }[]>([]);
  const [pendingSuggestions, setPendingSuggestions] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (description) {
      analyzeIncident(description).then((res) => {
        setAnalysis(res);
        setPendingSuggestions(res.missing_info_list || []);
        setLoading(false);
      });
    }
  }, [description]);

  const handleAddSuggestion = (suggestion: string, index: number) => {
    // Ajouter au formulaire
    setAdditionalInfo([...additionalInfo, { key: suggestion, value: '' }]);
    // Retirer de la liste des suggestions en attente
    const newList = [...pendingSuggestions];
    newList.splice(index, 1);
    setPendingSuggestions(newList);
  };

  const handleRemoveInfo = (index: number) => {
    const item = additionalInfo[index];
    const newList = [...additionalInfo];
    newList.splice(index, 1);
    setAdditionalInfo(newList);
    // Remettre dans les suggestions si on veut
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-zinc-500 animate-pulse">L'IA analyse votre signalement...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 px-4 mx-auto">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold">Vérification de l'incident</h1>
        <p className="text-zinc-500">
          Voici ce que l'IA a compris. Vous pouvez modifier ces informations avant de valider.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analyse Automatique</CardTitle>
            <CardDescription>
              Fiabilité de l'analyse : 
              <Badge variant={analysis.confidence > 0.7 ? "default" : "outline"} className="ml-2">
                {Math.round(analysis.confidence * 100)}%
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de l'incident</Label>
              <Input 
                id="title" 
                value={analysis.title} 
                onChange={(e) => setAnalysis({...analysis, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <Input 
                  id="zone" 
                  value={analysis.zone} 
                  onChange={(e) => setAnalysis({...analysis, zone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Gravité</Label>
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
              <Label htmlFor="summary">Résumé professionnel</Label>
              <Textarea 
                id="summary" 
                value={analysis.summary} 
                onChange={(e) => setAnalysis({...analysis, summary: e.target.value})}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Actions suggérées</Label>
              <ul className="space-y-2">
                {analysis.suggested_actions.map((action: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Champs additionnels déjà ajoutés */}
            {additionalInfo.map((info, index) => (
              <div key={index} className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-900 border rounded-lg relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1 h-6 w-6 text-zinc-400"
                  onClick={() => handleRemoveInfo(index)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Label className="text-xs font-semibold uppercase text-zinc-500">{info.key}</Label>
                <Input 
                  placeholder="Complétez cette information..."
                  value={info.value}
                  onChange={(e) => handleInfoChange(index, e.target.value)}
                  className="bg-white dark:bg-zinc-950"
                />
              </div>
            ))}

            {/* Liste des suggestions d'informations manquantes */}
            {pendingSuggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Informations manquantes suggérées :</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pendingSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400"
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
          <CardFooter className="flex gap-3 pt-6 border-t">
            <Button variant="outline" type="button" onClick={() => router.back()} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? 'Création...' : 'Valider et Créer'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
