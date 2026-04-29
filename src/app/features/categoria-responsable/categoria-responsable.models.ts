export interface CategoriaResponsable {
  idCategoriaResponsable: number;
  idCategoriaTicket: number;
  nombreCategoriaTicket: string;
  idUsuarioResponsable: string;
  nombreUsuarioResponsable: string;
  emailUsuarioResponsable: string | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface CategoriaResponsableRequest {
  idCategoriaTicket: number;
  idUsuarioResponsable: string;
  activo: boolean;
}

export interface CategoriaTicketSelect {
  idCategoriaTicket: number;
  nombre: string;
}

export interface UsuarioSelect {
  id: string;
  nombreCompleto: string;
  email: string | null;
  userName: string | null;
}

export interface PaginatedResult<T> {
  pagina: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  datos: T[];
}
