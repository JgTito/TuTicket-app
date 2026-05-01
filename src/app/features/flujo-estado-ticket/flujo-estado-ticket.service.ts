import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  EstadoTicketSelect,
  FlujoEstadoTicket,
  FlujoEstadoTicketRequest,
  PaginatedResult
} from './flujo-estado-ticket.models';

@Injectable({
  providedIn: 'root'
})
export class FlujoEstadoTicketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/FlujoEstadoTicket`;
  private readonly estadoSelectUrl = `${environment.apiUrl}/EstadoTicket/select`;

  getAll(incluirInactivos: boolean, pagina: number, tamanoPagina: number) {
    const params = new HttpParams()
      .set('incluirInactivos', incluirInactivos)
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);

    return this.http.get<PaginatedResult<FlujoEstadoTicket>>(this.apiUrl, { params });
  }

  create(request: FlujoEstadoTicketRequest) {
    return this.http.post<FlujoEstadoTicket>(this.apiUrl, request);
  }

  update(id: number, request: FlujoEstadoTicketRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEstadosSelect() {
    const params = new HttpParams().set('incluirInactivos', false);

    return this.http.get<EstadoTicketSelect[]>(this.estadoSelectUrl, { params });
  }
}
