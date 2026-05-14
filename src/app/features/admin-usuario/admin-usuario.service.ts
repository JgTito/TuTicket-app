import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  ActualizarAdminUsuarioRequest,
  ActualizarRolesUsuarioRequest,
  AdminUsuario,
  AdminUsuarioFilters,
  CrearAdminUsuarioRequest,
  PaginatedResult,
  ResetPasswordUsuarioRequest,
  RolUsuario
} from './admin-usuario.models';

@Injectable({
  providedIn: 'root'
})
export class AdminUsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/AdminUsuario`;

  getUsuarios(filters: AdminUsuarioFilters, pagina: number, tamanoPagina: number) {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);

    if (filters.buscar) params = params.set('buscar', filters.buscar);
    if (filters.activo !== null) params = params.set('activo', filters.activo);
    if (filters.rol) params = params.set('rol', filters.rol);

    return this.http.get<PaginatedResult<AdminUsuario>>(this.apiUrl, { params });
  }

  getRoles() {
    return this.http.get<RolUsuario[]>(`${this.apiUrl}/roles`);
  }

  create(request: CrearAdminUsuarioRequest) {
    return this.http.post<AdminUsuario>(this.apiUrl, request);
  }

  update(id: string, request: ActualizarAdminUsuarioRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  updateEstado(id: string, activo: boolean) {
    return this.http.put<void>(`${this.apiUrl}/${id}/estado`, { activo });
  }

  updateRoles(id: string, request: ActualizarRolesUsuarioRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}/roles`, request);
  }

  resetPassword(id: string, request: ResetPasswordUsuarioRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}/reset-password`, request);
  }
}
