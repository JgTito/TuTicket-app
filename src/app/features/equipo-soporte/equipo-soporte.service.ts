import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  CategoriaEquipoSoporte,
  CategoriaEquipoSoporteRequest,
  CategoriaTicketSelect,
  EquipoSoporte,
  EquipoSoporteRequest,
  EquipoSoporteUsuario,
  EquipoSoporteUsuarioRequest,
  PaginatedResult,
  UsuarioSelect
} from './equipo-soporte.models';

@Injectable({
  providedIn: 'root'
})
export class EquipoSoporteService {
  private readonly http = inject(HttpClient);
  private readonly equipoApiUrl = `${environment.apiUrl}/EquipoSoporte`;
  private readonly equipoUsuarioApiUrl = `${environment.apiUrl}/EquipoSoporteUsuario`;
  private readonly categoriaEquipoApiUrl = `${environment.apiUrl}/CategoriaEquipoSoporte`;
  private readonly categoriaSelectUrl = `${environment.apiUrl}/CategoriaTicket/select`;
  private readonly usuarioSelectUrl = `${environment.apiUrl}/Usuario/select`;

  getEquipos(incluirInactivos: boolean, pagina: number, tamanoPagina: number) {
    const params = new HttpParams()
      .set('incluirInactivos', incluirInactivos)
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);

    return this.http.get<PaginatedResult<EquipoSoporte>>(this.equipoApiUrl, { params });
  }

  createEquipo(request: EquipoSoporteRequest) {
    return this.http.post<EquipoSoporte>(this.equipoApiUrl, request);
  }

  updateEquipo(id: number, request: EquipoSoporteRequest) {
    return this.http.put<void>(`${this.equipoApiUrl}/${id}`, request);
  }

  deleteEquipo(id: number) {
    return this.http.delete<void>(`${this.equipoApiUrl}/${id}`);
  }

  getIntegrantes(idEquipoSoporte: number, incluirInactivos: boolean, pagina: number, tamanoPagina: number) {
    const params = new HttpParams()
      .set('idEquipoSoporte', idEquipoSoporte)
      .set('incluirInactivos', incluirInactivos)
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);

    return this.http.get<PaginatedResult<EquipoSoporteUsuario>>(this.equipoUsuarioApiUrl, { params });
  }

  createIntegrante(request: EquipoSoporteUsuarioRequest) {
    return this.http.post<EquipoSoporteUsuario>(this.equipoUsuarioApiUrl, request);
  }

  updateIntegrante(id: number, request: EquipoSoporteUsuarioRequest) {
    return this.http.put<void>(`${this.equipoUsuarioApiUrl}/${id}`, request);
  }

  deleteIntegrante(id: number) {
    return this.http.delete<void>(`${this.equipoUsuarioApiUrl}/${id}`);
  }

  getCategoriasEquipo(idEquipoSoporte: number, incluirInactivos: boolean, pagina: number, tamanoPagina: number) {
    const params = new HttpParams()
      .set('idEquipoSoporte', idEquipoSoporte)
      .set('incluirInactivos', incluirInactivos)
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);

    return this.http.get<PaginatedResult<CategoriaEquipoSoporte>>(this.categoriaEquipoApiUrl, { params });
  }

  createCategoriaEquipo(request: CategoriaEquipoSoporteRequest) {
    return this.http.post<CategoriaEquipoSoporte>(this.categoriaEquipoApiUrl, request);
  }

  updateCategoriaEquipo(id: number, request: CategoriaEquipoSoporteRequest) {
    return this.http.put<void>(`${this.categoriaEquipoApiUrl}/${id}`, request);
  }

  deleteCategoriaEquipo(id: number) {
    return this.http.delete<void>(`${this.categoriaEquipoApiUrl}/${id}`);
  }

  getCategoriasSelect(incluirInactivos = false, buscar?: string) {
    let params = new HttpParams().set('incluirInactivos', incluirInactivos);

    if (buscar?.trim()) {
      params = params.set('buscar', buscar.trim());
    }

    return this.http.get<CategoriaTicketSelect[]>(this.categoriaSelectUrl, { params });
  }

  getUsuariosSelect(incluirInactivos = false, buscar?: string) {
    let params = new HttpParams().set('incluirInactivos', incluirInactivos);

    if (buscar?.trim()) {
      params = params.set('buscar', buscar.trim());
    }

    return this.http.get<UsuarioSelect[]>(this.usuarioSelectUrl, { params });
  }
}
