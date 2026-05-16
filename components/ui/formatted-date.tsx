'use client';

import { useEffect, useState } from 'react';

export function FormattedDate({ date, includeTime = false }: { date: Date | string | number, includeTime?: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="invisible">...</span>;
  }

  const d = new Date(date);
  const dateStr = d.toLocaleDateString('fr-FR');
  const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <span>
      {dateStr} {includeTime && timeStr}
    </span>
  );
}
