import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PaginatedResult, PrioridadTicket, PrioridadTicketRequest } from './prioridad-ticket.models';

@Injectable({
  providedIn: 'root'
})
export class PrioridadTicketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/PrioridadTicket`;

  getAll(incluirInactivos: boolean, pagina: number, tamanoPagina: number) {
    const params = new HttpParams()
      .set('incluirInactivos', incluirInactivos)
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);

    return this.http.get<PaginatedResult<PrioridadTicket>>(this.apiUrl, { params });
  }

  create(request: PrioridadTicketRequest) {
    return this.http.post<PrioridadTicket>(this.apiUrl, request);
  }

  update(id: number, request: PrioridadTicketRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
