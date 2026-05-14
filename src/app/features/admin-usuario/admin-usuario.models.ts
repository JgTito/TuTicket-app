export interface AdminUsuario {
  id: string;
  nombreCompleto: string;
  email: string | null;
  userName: string | null;
  activo: boolean;
  fechaCreacion: string;
  roles: string[];
}

export interface RolUsuario {
  id: string;
  nombre: string;
}

export interface AdminUsuarioFilters {
  buscar: string | null;
  activo: boolean | null;
  rol: string | null;
}

export interface CrearAdminUsuarioRequest {
  nombreCompleto: string;
  email: string;
  password: string;
  activo: boolean;
  roles: string[];
}

export interface ActualizarAdminUsuarioRequest {
  nombreCompleto: string;
  email: string;
  activo: boolean;
}

export interface ActualizarRolesUsuarioRequest {
  roles: string[];
}

export interface ResetPasswordUsuarioRequest {
  nuevaPassword: string;
}

export interface PaginatedResult<T> {
  pagina: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  datos: T[];
}
