export interface TipoRelacionTicket {
  idTipoRelacionTicket: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface TipoRelacionTicketRequest {
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface PaginatedResult<T> {
  pagina: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  datos: T[];
}
