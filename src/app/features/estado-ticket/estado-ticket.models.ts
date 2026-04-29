export interface EstadoTicket {
  idEstadoTicket: number;
  nombre: string;
  descripcion: string | null;
  esEstadoFinal: boolean;
  orden: number;
  activo: boolean;
}

export interface EstadoTicketRequest {
  nombre: string;
  descripcion: string | null;
  esEstadoFinal: boolean;
  orden: number;
  activo: boolean;
}

export interface PaginatedResult<T> {
  pagina: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  datos: T[];
}
