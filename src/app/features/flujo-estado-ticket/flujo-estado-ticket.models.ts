export interface FlujoEstadoTicket {
  idFlujoEstadoTicket: number;
  idEstadoOrigen: number;
  nombreEstadoOrigen: string;
  idEstadoDestino: number;
  nombreEstadoDestino: string;
  requiereComentario: boolean;
  activo: boolean;
}

export interface FlujoEstadoTicketRequest {
  idEstadoOrigen: number;
  idEstadoDestino: number;
  requiereComentario: boolean;
  activo: boolean;
}

export interface EstadoTicketSelect {
  idEstadoTicket: number;
  nombre: string;
  esEstadoFinal: boolean;
  orden: number;
}

export interface PaginatedResult<T> {
  pagina: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  datos: T[];
}
