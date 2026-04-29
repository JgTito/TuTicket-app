export interface SubcategoriaTicket {
  idSubcategoriaTicket: number;
  idCategoriaTicket: number;
  nombreCategoria: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface SubcategoriaTicketRequest {
  idCategoriaTicket: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface CategoriaTicketSelect {
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
