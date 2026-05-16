const PRIORIDAD_BAJA_CLASS = 'bg-emerald-50 text-emerald-700 ring-emerald-200';
const PRIORIDAD_MEDIA_CLASS = 'bg-sky-50 text-sky-700 ring-sky-200';
const PRIORIDAD_ALTA_CLASS = 'bg-orange-50 text-orange-700 ring-orange-200';
const PRIORIDAD_CRITICA_CLASS = 'bg-red-50 text-red-700 ring-red-200';
const PRIORIDAD_DEFAULT_CLASS = 'bg-slate-100 text-slate-700 ring-slate-200';

export function getPrioridadTicketBadgeClass(
  idPrioridadTicket: number | null | undefined,
  nombrePrioridadTicket: string | null | undefined
): string {
  switch (idPrioridadTicket) {
    case 1:
      return PRIORIDAD_BAJA_CLASS;
    case 2:
      return PRIORIDAD_MEDIA_CLASS;
    case 3:
      return PRIORIDAD_ALTA_CLASS;
    case 4:
    case 5:
      return PRIORIDAD_CRITICA_CLASS;
  }

  const nombre = normalizePrioridadName(nombrePrioridadTicket);

  if (nombre === 'baja') return PRIORIDAD_BAJA_CLASS;
  if (nombre === 'media') return PRIORIDAD_MEDIA_CLASS;
  if (nombre === 'alta') return PRIORIDAD_ALTA_CLASS;
  if (nombre === 'critica') return PRIORIDAD_CRITICA_CLASS;

  return PRIORIDAD_DEFAULT_CLASS;
}

function normalizePrioridadName(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}
