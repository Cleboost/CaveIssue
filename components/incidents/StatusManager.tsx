'use client';

import { useState, useTransition } from 'react';
import { updateIncidentStatus } from '@/app/lib/incidents/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  en_attente: 'En attente',
  resolu: 'Résolu',
  cloture: 'Clôturé',
};

export function StatusManager({ incidentId, currentStatus, userRole }: { incidentId: string, currentStatus: string, userRole: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    startTransition(async () => {
      await updateIncidentStatus(incidentId, newStatus);
    });
  };

  // Seul l'admin peut clôturer
  const canClose = userRole === 'administrateur';
  // Un employé ne peut pas changer le statut (sauf s'il est admin ou responsable)
  const canEdit = userRole !== 'employe';

  if (!canEdit) {
    return (
      <Badge variant="outline" className="capitalize border-primary text-primary font-semibold">
        {STATUS_LABELS[currentStatus] || currentStatus}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />}
      <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
        <SelectTrigger className="w-[140px] h-8 text-xs font-semibold uppercase border-primary text-primary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nouveau">Nouveau</SelectItem>
          <SelectItem value="en_cours">En cours</SelectItem>
          <SelectItem value="en_attente">En attente</SelectItem>
          <SelectItem value="resolu">Résolu</SelectItem>
          {canClose && <SelectItem value="cloture">Clôturé</SelectItem>}
        </SelectContent>
      </Select>
    </div>
  );
}
