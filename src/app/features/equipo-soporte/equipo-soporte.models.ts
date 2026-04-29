export interface EquipoSoporte {
  idEquipoSoporte: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface EquipoSoporteRequest {
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface EquipoSoporteUsuario {
  idEquipoSoporteUsuario: number;
  idEquipoSoporte: number;
  nombreEquipoSoporte: string;
  idUsuario: string;
  nombreUsuario: string;
  emailUsuario: string | null;
  esLider: boolean;
  activo: boolean;
  fechaCreacion: string;
}

export interface EquipoSoporteUsuarioRequest {
  idEquipoSoporte: number;
  idUsuario: string;
  esLider: boolean;
  activo: boolean;
}

export interface CategoriaEquipoSoporte {
  idCategoriaEquipoSoporte: number;
  idCategoriaTicket: number;
  nombreCategoriaTicket: string;
  idEquipoSoporte: number;
  nombreEquipoSoporte: string;
  activo: boolean;
}

export interface CategoriaEquipoSoporteRequest {
  idCategoriaTicket: number;
  idEquipoSoporte: number;
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
