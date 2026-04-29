import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  CategoriaTicketOption,
  PaginatedResult,
  PrioridadTicketOption,
  SlaPolitica,
  SlaPoliticaRequest,
  SlaRegla,
  SlaReglaRequest
} from './sla-politica.models';

@Injectable({ providedIn: 'root' })
export class SlaPoliticaService {
  private readonly http = inject(HttpClient);
  private readonly politicaUrl = `${environment.apiUrl}/SlaPolitica`;
  private readonly reglaUrl = `${environment.apiUrl}/SlaRegla`;
  private readonly prioridadSelectUrl = `${environment.apiUrl}/PrioridadTicket/select`;
  private readonly categoriaSelectUrl = `${environment.apiUrl}/CategoriaTicket/select`;

  getPoliticas(incluirInactivos: boolean, pagina: number, tamanoPagina: number) {
    const params = new HttpParams()
      .set('incluirInactivos', incluirInactivos)
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);
    return this.http.get<PaginatedResult<SlaPolitica>>(this.politicaUrl, { params });
  }

  createPolitica(request: SlaPoliticaRequest) {
    return this.http.post<SlaPolitica>(this.politicaUrl, request);
  }

  updatePolitica(id: number, request: SlaPoliticaRequest) {
    return this.http.put<void>(`${this.politicaUrl}/${id}`, request);
  }

  deletePolitica(id: number) {
    return this.http.delete<void>(`${this.politicaUrl}/${id}`);
  }

  getReglas(idSlaPolitica: number, incluirInactivos: boolean, pagina: number, tamanoPagina: number) {
    const params = new HttpParams()
      .set('idSlaPolitica', idSlaPolitica)
      .set('incluirInactivos', incluirInactivos)
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);
    return this.http.get<PaginatedResult<SlaRegla>>(this.reglaUrl, { params });
  }

  createRegla(request: SlaReglaRequest) {
    return this.http.post<SlaRegla>(this.reglaUrl, request);
  }

  updateRegla(id: number, request: SlaReglaRequest) {
    return this.http.put<void>(`${this.reglaUrl}/${id}`, request);
  }

  deleteRegla(id: number) {
    return this.http.delete<void>(`${this.reglaUrl}/${id}`);
  }

  getPrioridadesSelect() {
    const params = new HttpParams().set('incluirInactivos', false);
    return this.http.get<PrioridadTicketOption[]>(this.prioridadSelectUrl, { params });
  }

  getCategoriasSelect() {
    const params = new HttpParams().set('incluirInactivos', false);
    return this.http.get<CategoriaTicketOption[]>(this.categoriaSelectUrl, { params });
  }
}
