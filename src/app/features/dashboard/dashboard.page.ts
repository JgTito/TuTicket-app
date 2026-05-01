import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardChartComponent } from './dashboard-chart.component';
import {
  GraficoConteo,
  GraficoSerieTemporal,
  SlaCumplimientoGrafico,
  TicketResumenGrafico
} from './dashboard.models';
import { DashboardFilters, DashboardService } from './dashboard.service';

interface KpiCard {
  label: string;
  value: number;
  tone: string;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [DashboardChartComponent],
  templateUrl: './dashboard.page.html'
})
export class DashboardPage {
  readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  readonly resumen = signal<TicketResumenGrafico>(this.emptyResumen());
  readonly porEstado = signal<GraficoConteo[]>([]);
  readonly porPrioridad = signal<GraficoConteo[]>([]);
  readonly porCategoria = signal<GraficoConteo[]>([]);
  readonly porMes = signal<GraficoSerieTemporal[]>([]);
  readonly porResponsable = signal<GraficoConteo[]>([]);
  readonly sla = signal<SlaCumplimientoGrafico>(this.emptySla());
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly fechaDesde = signal<string>('');
  readonly fechaHasta = signal<string>('');

  readonly kpis = computed<KpiCard[]>(() => {
    const resumen = this.resumen();
    return [
      { label: 'Total tickets', value: resumen.totalTickets, tone: 'bg-teal-50 text-teal-700' },
      { label: 'Abiertos', value: resumen.ticketsAbiertos, tone: 'bg-sky-50 text-sky-700' },
      { label: 'Cerrados', value: resumen.ticketsCerrados, tone: 'bg-emerald-50 text-emerald-700' },
      { label: 'Sin asignar', value: resumen.ticketsSinAsignar, tone: 'bg-amber-50 text-amber-700' },
      { label: 'Reabiertos', value: resumen.ticketsReabiertos, tone: 'bg-violet-50 text-violet-700' },
      { label: 'SLA 1ra respuesta vencidos', value: resumen.slasPrimeraRespuestaVencidos, tone: 'bg-red-50 text-red-700' },
      { label: 'SLA resolucion vencidos', value: resumen.slasResolucionVencidos, tone: 'bg-rose-50 text-rose-700' }
    ];
  });

  readonly estadoLabels = computed(() => this.porEstado().map((item) => item.etiqueta));
  readonly estadoValues = computed(() => this.porEstado().map((item) => item.cantidad));
  readonly prioridadLabels = computed(() => this.porPrioridad().map((item) => item.etiqueta));
  readonly prioridadValues = computed(() => this.porPrioridad().map((item) => item.cantidad));
  readonly categoriaLabels = computed(() => this.porCategoria().slice(0, 8).map((item) => item.etiqueta));
  readonly categoriaValues = computed(() => this.porCategoria().slice(0, 8).map((item) => item.cantidad));
  readonly responsableLabels = computed(() => this.porResponsable().slice(0, 8).map((item) => item.etiqueta));
  readonly responsableValues = computed(() => this.porResponsable().slice(0, 8).map((item) => item.cantidad));
  readonly mesLabels = computed(() => this.porMes().map((item) => item.etiqueta));
  readonly mesValues = computed(() => this.porMes().map((item) => item.cantidad));
  readonly slaLabels = ['Dentro SLA', 'Vencidos'];
  readonly slaPrimeraValues = computed(() => [this.sla().dentroDeSlaPrimeraRespuesta, this.sla().vencidosPrimeraRespuesta]);
  readonly slaResolucionValues = computed(() => [this.sla().dentroDeSlaResolucion, this.sla().vencidosResolucion]);
  readonly slaColors = ['#059669', '#dc2626'];

  constructor() {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const filters = this.buildFilters();

    forkJoin({
      resumen: this.dashboardService.getResumen(filters),
      porEstado: this.dashboardService.getTicketsPorEstado(filters),
      porPrioridad: this.dashboardService.getTicketsPorPrioridad(filters),
      porCategoria: this.dashboardService.getTicketsPorCategoria(filters),
      porMes: this.dashboardService.getTicketsCreadosPorMes(filters),
      sla: this.dashboardService.getSlaCumplimiento(filters),
      porResponsable: this.dashboardService.getTicketsPorResponsable(filters)
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ resumen, porEstado, porPrioridad, porCategoria, porMes, sla, porResponsable }) => {
          this.resumen.set(this.normalizeResumen(resumen));
          this.porEstado.set((porEstado ?? []).map((item) => this.normalizeConteo(item)));
          this.porPrioridad.set((porPrioridad ?? []).map((item) => this.normalizeConteo(item)));
          this.porCategoria.set((porCategoria ?? []).map((item) => this.normalizeConteo(item)));
          this.porMes.set((porMes ?? []).map((item) => this.normalizeSerie(item)));
          this.sla.set(this.normalizeSla(sla));
          this.porResponsable.set((porResponsable ?? []).map((item) => this.normalizeConteo(item)));
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  applyFilters(): void {
    this.loadDashboard();
  }

  clearFilters(): void {
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.loadDashboard();
  }

  setFechaDesde(event: Event): void {
    this.fechaDesde.set((event.target as HTMLInputElement).value);
  }

  setFechaHasta(event: Event): void {
    this.fechaHasta.set((event.target as HTMLInputElement).value);
  }

  private buildFilters(): DashboardFilters {
    return {
      fechaDesde: this.formatDateParam(this.fechaDesde()),
      fechaHasta: this.formatDateParam(this.fechaHasta(), true)
    };
  }

  private formatDateParam(value: string, endOfDay = false): string | null {
    if (!value) return null;
    return `${value}T${endOfDay ? '23:59:59' : '00:00:00'}`;
  }

  private emptyResumen(): TicketResumenGrafico {
    return {
      totalTickets: 0,
      ticketsAbiertos: 0,
      ticketsCerrados: 0,
      ticketsSinAsignar: 0,
      ticketsReabiertos: 0,
      slasPrimeraRespuestaVencidos: 0,
      slasResolucionVencidos: 0
    };
  }

  private emptySla(): SlaCumplimientoGrafico {
    return {
      dentroDeSlaPrimeraRespuesta: 0,
      vencidosPrimeraRespuesta: 0,
      dentroDeSlaResolucion: 0,
      vencidosResolucion: 0
    };
  }

  private normalizeResumen(value: unknown): TicketResumenGrafico {
    const item = value as Record<string, unknown>;
    return {
      totalTickets: this.pickNumber(item, 'totalTickets', 'TotalTickets'),
      ticketsAbiertos: this.pickNumber(item, 'ticketsAbiertos', 'TicketsAbiertos'),
      ticketsCerrados: this.pickNumber(item, 'ticketsCerrados', 'TicketsCerrados'),
      ticketsSinAsignar: this.pickNumber(item, 'ticketsSinAsignar', 'TicketsSinAsignar'),
      ticketsReabiertos: this.pickNumber(item, 'ticketsReabiertos', 'TicketsReabiertos'),
      slasPrimeraRespuestaVencidos: this.pickNumber(item, 'slasPrimeraRespuestaVencidos', 'SlasPrimeraRespuestaVencidos'),
      slasResolucionVencidos: this.pickNumber(item, 'slasResolucionVencidos', 'SlasResolucionVencidos')
    };
  }

  private normalizeConteo(value: unknown): GraficoConteo {
    const item = value as Record<string, unknown>;
    return {
      id: this.pickNumber(item, 'id', 'Id'),
      etiqueta: String(item['etiqueta'] ?? item['Etiqueta'] ?? ''),
      cantidad: this.pickNumber(item, 'cantidad', 'Cantidad')
    };
  }

  private normalizeSerie(value: unknown): GraficoSerieTemporal {
    const item = value as Record<string, unknown>;
    const anio = this.pickNumber(item, 'anio', 'Anio');
    const mes = this.pickNumber(item, 'mes', 'Mes');
    return {
      anio,
      mes,
      etiqueta: this.formatMonthLabel(anio, mes, String(item['etiqueta'] ?? item['Etiqueta'] ?? '')),
      cantidad: this.pickNumber(item, 'cantidad', 'Cantidad')
    };
  }

  private normalizeSla(value: unknown): SlaCumplimientoGrafico {
    const item = value as Record<string, unknown>;
    return {
      dentroDeSlaPrimeraRespuesta: this.pickNumber(item, 'dentroDeSlaPrimeraRespuesta', 'DentroDeSlaPrimeraRespuesta'),
      vencidosPrimeraRespuesta: this.pickNumber(item, 'vencidosPrimeraRespuesta', 'VencidosPrimeraRespuesta'),
      dentroDeSlaResolucion: this.pickNumber(item, 'dentroDeSlaResolucion', 'DentroDeSlaResolucion'),
      vencidosResolucion: this.pickNumber(item, 'vencidosResolucion', 'VencidosResolucion')
    };
  }

  private formatMonthLabel(anio: number, mes: number, fallback: string): string {
    if (!anio || !mes) return fallback;
    return new Intl.DateTimeFormat('es-CL', { month: 'short', year: 'numeric' }).format(new Date(anio, mes - 1, 1));
  }

  private pickNumber(item: Record<string, unknown>, camel: string, pascal: string): number {
    return Number(item[camel] ?? item[pascal] ?? 0);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) return 'No se pudo conectar con la API.';
    if (error.status === 401 || error.status === 403) return 'Tu sesion no tiene permisos para ver los graficos.';
    if (error.status === 400) return 'La API rechazo los filtros. Revisa el rango de fechas.';
    return 'Ocurrio un error al cargar los graficos.';
  }
}
