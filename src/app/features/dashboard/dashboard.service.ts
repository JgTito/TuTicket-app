import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  GraficoConteo,
  GraficoSerieTemporal,
  SlaCumplimientoGrafico,
  TicketResumenGrafico
} from './dashboard.models';

export interface DashboardFilters {
  fechaDesde: string | null;
  fechaHasta: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Graficos`;

  getResumen(filters: DashboardFilters) {
    return this.http.get<TicketResumenGrafico>(`${this.apiUrl}/resumen`, { params: this.buildParams(filters) });
  }

  getTicketsPorEstado(filters: DashboardFilters) {
    return this.http.get<GraficoConteo[]>(`${this.apiUrl}/tickets-por-estado`, { params: this.buildParams(filters) });
  }

  getTicketsPorPrioridad(filters: DashboardFilters) {
    return this.http.get<GraficoConteo[]>(`${this.apiUrl}/tickets-por-prioridad`, { params: this.buildParams(filters) });
  }

  getTicketsPorCategoria(filters: DashboardFilters) {
    return this.http.get<GraficoConteo[]>(`${this.apiUrl}/tickets-por-categoria`, { params: this.buildParams(filters) });
  }

  getTicketsCreadosPorMes(filters: DashboardFilters) {
    return this.http.get<GraficoSerieTemporal[]>(`${this.apiUrl}/tickets-creados-por-mes`, { params: this.buildParams(filters) });
  }

  getSlaCumplimiento(filters: DashboardFilters) {
    return this.http.get<SlaCumplimientoGrafico>(`${this.apiUrl}/sla-cumplimiento`, { params: this.buildParams(filters) });
  }

  getTicketsPorResponsable(filters: DashboardFilters) {
    return this.http.get<GraficoConteo[]>(`${this.apiUrl}/tickets-por-responsable`, { params: this.buildParams(filters) });
  }

  private buildParams(filters: DashboardFilters): HttpParams {
    let params = new HttpParams();

    if (filters.fechaDesde) {
      params = params.set('fechaDesde', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
      params = params.set('fechaHasta', filters.fechaHasta);
    }

    return params;
  }
}
