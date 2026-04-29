import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CategoriaTicket, CategoriaTicketRequest, PaginatedResult } from './categoria-ticket.models';

@Injectable({
  providedIn: 'root'
})
export class CategoriaTicketService {
  private readonly http = inject(HttpClient);
  private readonly categoriaApiUrl = `${environment.apiUrl}/CategoriaTicket`;

  getAll(incluirInactivos: boolean, pagina: number, tamanoPagina: number) {
    const params = new HttpParams()
      .set('incluirInactivos', incluirInactivos)
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);

    return this.http.get<PaginatedResult<CategoriaTicket>>(this.categoriaApiUrl, { params });
  }

  create(request: CategoriaTicketRequest) {
    return this.http.post<CategoriaTicket>(this.categoriaApiUrl, request);
  }

  update(id: number, request: CategoriaTicketRequest) {
    return this.http.put<void>(`${this.categoriaApiUrl}/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.categoriaApiUrl}/${id}`);
  }
}
