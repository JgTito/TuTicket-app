export interface TicketResumenGrafico {
  totalTickets: number;
  ticketsAbiertos: number;
  ticketsCerrados: number;
  ticketsSinAsignar: number;
  ticketsReabiertos: number;
  slasPrimeraRespuestaVencidos: number;
  slasResolucionVencidos: number;
}

export interface GraficoConteo {
  id: number;
  etiqueta: string;
  cantidad: number;
}

export interface GraficoSerieTemporal {
  anio: number;
  mes: number;
  etiqueta: string;
  cantidad: number;
}

export interface SlaCumplimientoGrafico {
  dentroDeSlaPrimeraRespuesta: number;
  vencidosPrimeraRespuesta: number;
  dentroDeSlaResolucion: number;
  vencidosResolucion: number;
}
