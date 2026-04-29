import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  CategoriaResponsable,
  CategoriaResponsableRequest,
  CategoriaTicketSelect,
  PaginatedResult,
  UsuarioSelect
} from './categoria-responsable.models';

@Injectable({
  providedIn: 'root'
})
export class CategoriaResponsableService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/CategoriaResponsable`;
  private readonly categoriaSelectUrl = `${environment.apiUrl}/CategoriaTicket/select`;
  private readonly usuarioSelectUrl = `${environment.apiUrl}/Usuario/select`;

  getAll(incluirInactivos: boolean, pagina: number, tamanoPagina: number) {
    const params = new HttpParams()
      .set('incluirInactivos', incluirInactivos)
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);

    return this.http.get<PaginatedResult<CategoriaResponsable>>(this.apiUrl, { params });
  }

  create(request: CategoriaResponsableRequest) {
    return this.http.post<CategoriaResponsable>(this.apiUrl, request);
  }

  update(id: number, request: CategoriaResponsableRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
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
