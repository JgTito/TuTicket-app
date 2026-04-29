import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  CategoriaTicketSelect,
  PaginatedResult,
  SubcategoriaTicket,
  SubcategoriaTicketRequest
} from './subcategoria-ticket.models';

@Injectable({
  providedIn: 'root'
})
export class SubcategoriaTicketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/SubcategoriaTicket`;
  private readonly categoriaSelectUrl = `${environment.apiUrl}/CategoriaTicket/select`;

  getAll(incluirInactivos: boolean, pagina: number, tamanoPagina: number, idCategoriaTicket: number | null) {
    let params = new HttpParams()
      .set('incluirInactivos', incluirInactivos)
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);

    if (idCategoriaTicket) {
      params = params.set('idCategoriaTicket', idCategoriaTicket);
    }

    return this.http.get<PaginatedResult<SubcategoriaTicket>>(this.apiUrl, { params });
  }

  getCategoriasSelect(incluirInactivos = false, buscar?: string) {
    let params = new HttpParams().set('incluirInactivos', incluirInactivos);

    if (buscar?.trim()) {
      params = params.set('buscar', buscar.trim());
    }

    return this.http.get<CategoriaTicketSelect[]>(this.categoriaSelectUrl, { params });
  }

  create(request: SubcategoriaTicketRequest) {
    return this.http.post<SubcategoriaTicket>(this.apiUrl, request);
  }

  update(id: number, request: SubcategoriaTicketRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
