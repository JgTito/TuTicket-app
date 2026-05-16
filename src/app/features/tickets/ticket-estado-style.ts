const ESTADO_ABIERTO_CLASS = 'bg-teal-50 text-teal-700 ring-teal-200';
const ESTADO_PENDIENTE_CLASS = 'bg-amber-50 text-amber-700 ring-amber-200';
const ESTADO_DERIVADO_CLASS = 'bg-indigo-50 text-indigo-700 ring-indigo-200';
const ESTADO_ANALISIS_CLASS = 'bg-violet-50 text-violet-700 ring-violet-200';
const ESTADO_PROCESO_CLASS = 'bg-blue-50 text-blue-700 ring-blue-200';
const ESTADO_ESPERA_CLASS = 'bg-orange-50 text-orange-700 ring-orange-200';
const ESTADO_RESUELTO_CLASS = 'bg-emerald-50 text-emerald-700 ring-emerald-200';
const ESTADO_REABIERTO_CLASS = 'bg-rose-50 text-rose-700 ring-rose-200';
const ESTADO_CERRADO_CLASS = 'bg-slate-100 text-slate-700 ring-slate-300';
const ESTADO_CANCELADO_CLASS = 'bg-red-50 text-red-700 ring-red-200';
const ESTADO_DEFAULT_CLASS = 'bg-slate-100 text-slate-700 ring-slate-200';

export function getEstadoTicketBadgeClass(
  idEstadoTicket: number | null | undefined,
  nombreEstadoTicket: string | null | undefined
): string {
  switch (idEstadoTicket) {
    case 1:
      return ESTADO_ABIERTO_CLASS;
    case 2:
      return ESTADO_PENDIENTE_CLASS;
    case 3:
      return ESTADO_DERIVADO_CLASS;
    case 4:
      return ESTADO_ANALISIS_CLASS;
    case 5:
      return ESTADO_PROCESO_CLASS;
    case 6:
      return ESTADO_ESPERA_CLASS;
    case 7:
      return ESTADO_RESUELTO_CLASS;
    case 8:
      return ESTADO_REABIERTO_CLASS;
    case 9:
      return ESTADO_CERRADO_CLASS;
    case 10:
      return ESTADO_CANCELADO_CLASS;
  }

  const nombre = normalizeEstadoName(nombreEstadoTicket);

  if (nombre === 'abierto') return ESTADO_ABIERTO_CLASS;
  if (nombre === 'pendiente de derivacion') return ESTADO_PENDIENTE_CLASS;
  if (nombre === 'derivado') return ESTADO_DERIVADO_CLASS;
  if (nombre === 'en analisis') return ESTADO_ANALISIS_CLASS;
  if (nombre === 'en proceso') return ESTADO_PROCESO_CLASS;
  if (nombre === 'en espera') return ESTADO_ESPERA_CLASS;
  if (nombre === 'resuelto') return ESTADO_RESUELTO_CLASS;
  if (nombre === 'reabierto') return ESTADO_REABIERTO_CLASS;
  if (nombre === 'cerrado') return ESTADO_CERRADO_CLASS;
  if (nombre === 'cancelado') return ESTADO_CANCELADO_CLASS;

  return ESTADO_DEFAULT_CLASS;
}

function normalizeEstadoName(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}
