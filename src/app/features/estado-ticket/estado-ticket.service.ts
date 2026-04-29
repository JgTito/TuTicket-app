import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { EstadoTicket, EstadoTicketRequest, PaginatedResult } from './estado-ticket.models';

@Injectable({
  providedIn: 'root'
})
export class EstadoTicketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/EstadoTicket`;

  getAll(incluirInactivos: boolean, pagina: number, tamanoPagina: number) {
    const params = new HttpParams()
      .set('incluirInactivos', incluirInactivos)
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);

    return this.http.get<PaginatedResult<EstadoTicket>>(this.apiUrl, { params });
  }

  create(request: EstadoTicketRequest) {
    return this.http.post<EstadoTicket>(this.apiUrl, request);
  }

  update(id: number, request: EstadoTicketRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
