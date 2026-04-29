export interface SlaPolitica {
  idSlaPolitica: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface SlaPoliticaRequest {
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface SlaRegla {
  idSlaRegla: number;
  idSlaPolitica: number;
  nombreSlaPolitica: string;
  idPrioridadTicket: number;
  nombrePrioridadTicket: string;
  idCategoriaTicket: number | null;
  nombreCategoriaTicket: string | null;
  minutosPrimeraRespuesta: number;
  minutosResolucion: number;
  activo: boolean;
}

export interface SlaReglaRequest {
  idSlaPolitica: number;
  idPrioridadTicket: number;
  idCategoriaTicket: number | null;
  minutosPrimeraRespuesta: number;
  minutosResolucion: number;
  activo: boolean;
}

export interface PrioridadTicketOption {
  idPrioridadTicket: number;
  nombre: string;
  nivel: number;
}

export interface CategoriaTicketOption {
  idCategoriaTicket: number;
  nombre: string;
}

export interface PaginatedResult<T> {
  pagina: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  datos: T[];
}
