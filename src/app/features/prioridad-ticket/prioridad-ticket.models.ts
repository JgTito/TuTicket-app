export interface PrioridadTicket {
  idPrioridadTicket: number;
  nombre: string;
  descripcion: string | null;
  nivel: number;
  activo: boolean;
}

export interface PrioridadTicketRequest {
  nombre: string;
  descripcion: string | null;
  nivel: number;
  activo: boolean;
}

export interface PaginatedResult<T> {
  pagina: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  datos: T[];
}
