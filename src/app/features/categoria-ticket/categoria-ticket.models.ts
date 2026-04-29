export interface CategoriaTicket {
  idCategoriaTicket: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface CategoriaTicketRequest {
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
