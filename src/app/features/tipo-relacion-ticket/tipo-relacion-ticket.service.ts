import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PaginatedResult, TipoRelacionTicket, TipoRelacionTicketRequest } from './tipo-relacion-ticket.models';

@Injectable({
  providedIn: 'root'
})
export class TipoRelacionTicketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/TipoRelacionTicket`;

  getAll(incluirInactivos: boolean, pagina: number, tamanoPagina: number) {
    const params = new HttpParams()
      .set('incluirInactivos', incluirInactivos)
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);

    return this.http.get<PaginatedResult<TipoRelacionTicket>>(this.apiUrl, { params });
  }

  create(request: TipoRelacionTicketRequest) {
    return this.http.post<TipoRelacionTicket>(this.apiUrl, request);
  }

  update(id: number, request: TipoRelacionTicketRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
