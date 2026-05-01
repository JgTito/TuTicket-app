export interface Notificacion {
  idNotificacion: number;
  idUsuarioDestino: string;
  nombreUsuarioDestino: string;
  idTicket: number | null;
  codigoTicket: string | null;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
  fechaLectura: string | null;
}

export interface NotificacionFilters {
  soloNoLeidas: boolean;
  idTicket: number | null;
  fechaDesde: string | null;
  fechaHasta: string | null;
}

export interface PaginatedResult<T> {
  pagina: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  datos: T[];
}
