import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { TicketCreateDialogComponent, TicketCreateDialogData } from './ticket-create-dialog.component';
import {
  CategoriaTicketOption,
  CrearTicketRequest,
  EstadoTicketOption,
  PrioridadTicketOption,
  SubcategoriaTicketOption,
  Ticket,
  TicketFilters
} from './ticket-bandeja.models';
import { TicketBandejaService } from './ticket-bandeja.service';

@Component({
  selector: 'app-ticket-bandeja-page',
  imports: [MatDatepickerModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './ticket-bandeja.page.html'
})
export class TicketBandejaPage {
  private readonly ticketService = inject(TicketBandejaService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly tickets = signal<Ticket[]>([]);
  readonly estados = signal<EstadoTicketOption[]>([]);
  readonly categorias = signal<CategoriaTicketOption[]>([]);
  readonly prioridades = signal<PrioridadTicketOption[]>([]);
  readonly subcategoriasFiltro = signal<SubcategoriaTicketOption[]>([]);
  readonly loading = signal(true);
  readonly loadingSelects = signal(true);
  readonly loadingSubcategoriasFiltro = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly incluirInactivos = signal(false);
  readonly filtroEstado = signal(0);
  readonly filtroPrioridad = signal(0);
  readonly filtroCategoria = signal(0);
  readonly filtroSubcategoria = signal(0);
  readonly filtroBuscar = signal('');
  readonly fechaCreacionDesde = signal<Date | null>(null);
  readonly fechaCreacionHasta = signal<Date | null>(null);
  readonly fechaActualizacionDesde = signal<Date | null>(null);
  readonly fechaActualizacionHasta = signal<Date | null>(null);
  readonly fechaPrimeraRespuestaDesde = signal<Date | null>(null);
  readonly fechaPrimeraRespuestaHasta = signal<Date | null>(null);
  readonly fechaResolucionDesde = signal<Date | null>(null);
  readonly fechaResolucionHasta = signal<Date | null>(null);
  readonly fechaCierreDesde = signal<Date | null>(null);
  readonly fechaCierreHasta = signal<Date | null>(null);
  readonly pagina = signal(1);
  readonly tamanoPagina = signal(5);
  readonly totalRegistros = signal(0);
  readonly totalPaginas = signal(0);
  readonly pageSizeOptions = [5, 10, 25, 50, 100];

  constructor() {
    this.loadSelects();
    this.loadTickets();
  }

  loadSelects(): void {
    this.loadingSelects.set(true);

    forkJoin({
      categorias: this.ticketService.getCategoriasSelect(),
      prioridades: this.ticketService.getPrioridadesSelect()
    })
      .pipe(finalize(() => this.loadingSelects.set(false)))
      .subscribe({
        next: ({ categorias, prioridades }) => {
          this.categorias.set((categorias ?? []).map((categoria) => this.normalizeCategoria(categoria)));
          this.prioridades.set((prioridades ?? []).map((prioridad) => this.normalizePrioridad(prioridad)));
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });

    this.ticketService.getEstadosSelect().subscribe({
      next: (estados) => {
        const response = estados as typeof estados & { Datos?: unknown[] };
        this.estados.set((response.datos ?? response.Datos ?? []).map((estado) => this.normalizeEstado(estado)));
      },
      error: () => this.estados.set([])
    });
  }

  loadTickets(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .getTickets(this.incluirInactivos(), this.pagina(), this.tamanoPagina(), this.buildFilters())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (resultado) => {
          const response = resultado as typeof resultado & {
            Datos?: unknown[];
            Pagina?: number;
            TamanoPagina?: number;
            TotalRegistros?: number;
            TotalPaginas?: number;
          };
          const datos = (response.datos ?? response.Datos ?? []).map((ticket) => this.normalizeTicket(ticket));

          this.tickets.set(datos);
          this.pagina.set(response.pagina ?? response.Pagina ?? this.pagina());
          this.tamanoPagina.set(response.tamanoPagina ?? response.TamanoPagina ?? this.tamanoPagina());
          this.totalRegistros.set(response.totalRegistros ?? response.TotalRegistros ?? 0);
          this.totalPaginas.set(response.totalPaginas ?? response.TotalPaginas ?? 0);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  openTicket(ticket: Ticket): void {
    void this.router.navigate(['/tickets', ticket.idTicket]);
  }

  openCreateModal(): void {
    this.dialog
      .open<TicketCreateDialogComponent, TicketCreateDialogData, CrearTicketRequest>(TicketCreateDialogComponent, {
        width: '760px',
        maxHeight: '90vh',
        data: {
          categorias: this.categorias(),
          prioridades: this.prioridades(),
          subcategorias: []
        },
        disableClose: this.saving()
      })
      .afterClosed()
      .subscribe((request) => {
        if (request) this.createTicket(request);
      });
  }

  toggleInactivos(): void {
    this.incluirInactivos.update((value) => !value);
    this.pagina.set(1);
    this.loadTickets();
  }

  changeFiltroCategoria(event: Event): void {
    const idCategoriaTicket = Number((event.target as HTMLSelectElement).value);
    this.changeFiltroCategoriaValue(idCategoriaTicket);
  }

  changeFiltroCategoriaValue(idCategoriaTicket: number): void {
    this.filtroCategoria.set(idCategoriaTicket);
    this.filtroSubcategoria.set(0);
    this.subcategoriasFiltro.set([]);

    if (!idCategoriaTicket) {
      return;
    }

    this.loadingSubcategoriasFiltro.set(true);
    this.ticketService
      .getSubcategoriasSelect(idCategoriaTicket)
      .pipe(finalize(() => this.loadingSubcategoriasFiltro.set(false)))
      .subscribe({
        next: (subcategorias) => {
          this.subcategoriasFiltro.set((subcategorias ?? []).map((subcategoria) => this.normalizeSubcategoria(subcategoria)));
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  applyFilters(): void {
    this.pagina.set(1);
    this.loadTickets();
  }

  clearFilters(): void {
    this.filtroEstado.set(0);
    this.filtroPrioridad.set(0);
    this.filtroCategoria.set(0);
    this.filtroSubcategoria.set(0);
    this.filtroBuscar.set('');
    this.fechaCreacionDesde.set(null);
    this.fechaCreacionHasta.set(null);
    this.fechaActualizacionDesde.set(null);
    this.fechaActualizacionHasta.set(null);
    this.fechaPrimeraRespuestaDesde.set(null);
    this.fechaPrimeraRespuestaHasta.set(null);
    this.fechaResolucionDesde.set(null);
    this.fechaResolucionHasta.set(null);
    this.fechaCierreDesde.set(null);
    this.fechaCierreHasta.set(null);
    this.subcategoriasFiltro.set([]);
    this.pagina.set(1);
    this.loadTickets();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPaginas() || page === this.pagina()) {
      return;
    }

    this.pagina.set(page);
    this.loadTickets();
  }

  changePageSize(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.tamanoPagina.set(size);
    this.pagina.set(1);
    this.loadTickets();
  }

  firstRecord(): number {
    if (this.totalRegistros() === 0) {
      return 0;
    }

    return (this.pagina() - 1) * this.tamanoPagina() + 1;
  }

  lastRecord(): number {
    return Math.min(this.pagina() * this.tamanoPagina(), this.totalRegistros());
  }

  formatDate(value: string | null): string {
    if (!value) {
      return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  private normalizeTicket(value: unknown): Ticket {
    const item = value as Partial<Ticket> & Record<string, unknown>;
    return {
      idTicket: this.pickNumber(item, 'idTicket', 'IdTicket'),
      codigo: this.pickString(item, 'codigo', 'Codigo'),
      titulo: this.pickString(item, 'titulo', 'Titulo'),
      descripcion: this.pickString(item, 'descripcion', 'Descripcion'),
      idEstadoTicket: this.pickNumber(item, 'idEstadoTicket', 'IdEstadoTicket'),
      nombreEstadoTicket: this.pickString(item, 'nombreEstadoTicket', 'NombreEstadoTicket'),
      idPrioridadTicket: this.pickNumber(item, 'idPrioridadTicket', 'IdPrioridadTicket'),
      nombrePrioridadTicket: this.pickString(item, 'nombrePrioridadTicket', 'NombrePrioridadTicket'),
      idSubcategoriaTicket: this.pickNumber(item, 'idSubcategoriaTicket', 'IdSubcategoriaTicket'),
      nombreSubcategoriaTicket: this.pickString(item, 'nombreSubcategoriaTicket', 'NombreSubcategoriaTicket'),
      idCategoriaTicket: this.pickNumber(item, 'idCategoriaTicket', 'IdCategoriaTicket'),
      nombreCategoriaTicket: this.pickString(item, 'nombreCategoriaTicket', 'NombreCategoriaTicket'),
      idUsuarioSolicitante: this.pickString(item, 'idUsuarioSolicitante', 'IdUsuarioSolicitante'),
      nombreUsuarioSolicitante: this.pickString(item, 'nombreUsuarioSolicitante', 'NombreUsuarioSolicitante'),
      idUsuarioAsignado: this.pickNullableString(item, 'idUsuarioAsignado', 'IdUsuarioAsignado'),
      nombreUsuarioAsignado: this.pickNullableString(item, 'nombreUsuarioAsignado', 'NombreUsuarioAsignado'),
      fechaCreacion: this.pickString(item, 'fechaCreacion', 'FechaCreacion'),
      fechaActualizacion: this.pickNullableString(item, 'fechaActualizacion', 'FechaActualizacion'),
      fechaPrimeraRespuesta: this.pickNullableString(item, 'fechaPrimeraRespuesta', 'FechaPrimeraRespuesta'),
      fechaResolucion: this.pickNullableString(item, 'fechaResolucion', 'FechaResolucion'),
      fechaCierre: this.pickNullableString(item, 'fechaCierre', 'FechaCierre'),
      cantidadReaperturas: this.pickNumber(item, 'cantidadReaperturas', 'CantidadReaperturas'),
      activo: this.pickBoolean(item, 'activo', 'Activo')
    };
  }

  private buildFilters(): TicketFilters {
    return {
      idEstadoTicket: this.filtroEstado() || null,
      idPrioridadTicket: this.filtroPrioridad() || null,
      idSubcategoriaTicket: this.filtroSubcategoria() || null,
      buscar: this.filtroBuscar().trim() || null,
      fechaCreacionDesde: this.formatDateParam(this.fechaCreacionDesde()),
      fechaCreacionHasta: this.formatDateParam(this.fechaCreacionHasta(), true),
      fechaActualizacionDesde: this.formatDateParam(this.fechaActualizacionDesde()),
      fechaActualizacionHasta: this.formatDateParam(this.fechaActualizacionHasta(), true),
      fechaPrimeraRespuestaDesde: this.formatDateParam(this.fechaPrimeraRespuestaDesde()),
      fechaPrimeraRespuestaHasta: this.formatDateParam(this.fechaPrimeraRespuestaHasta(), true),
      fechaResolucionDesde: this.formatDateParam(this.fechaResolucionDesde()),
      fechaResolucionHasta: this.formatDateParam(this.fechaResolucionHasta(), true),
      fechaCierreDesde: this.formatDateParam(this.fechaCierreDesde()),
      fechaCierreHasta: this.formatDateParam(this.fechaCierreHasta(), true)
    };
  }

  private formatDateParam(value: Date | null, endOfDay = false): string | null {
    if (!value) return null;

    const date = new Date(value);
    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    const pad = (part: number) => part.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  private createTicket(request: CrearTicketRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .createTicket(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (ticket) => {
          const creado = this.normalizeTicket(ticket);
          void this.router.navigate(['/tickets', creado.idTicket]);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private normalizePrioridad(value: unknown): PrioridadTicketOption {
    const item = value as Record<string, unknown>;
    return {
      idPrioridadTicket: this.pickNumber(item, 'idPrioridadTicket', 'IdPrioridadTicket'),
      nombre: this.pickString(item, 'nombre', 'Nombre'),
      nivel: this.pickNumber(item, 'nivel', 'Nivel')
    };
  }

  private normalizeEstado(value: unknown): EstadoTicketOption {
    const item = value as Record<string, unknown>;
    return {
      idEstadoTicket: this.pickNumber(item, 'idEstadoTicket', 'IdEstadoTicket'),
      nombre: this.pickString(item, 'nombre', 'Nombre'),
      esEstadoFinal: this.pickBoolean(item, 'esEstadoFinal', 'EsEstadoFinal'),
      orden: this.pickNumber(item, 'orden', 'Orden')
    };
  }

  private normalizeCategoria(value: unknown): CategoriaTicketOption {
    const item = value as Record<string, unknown>;
    return {
      idCategoriaTicket: this.pickNumber(item, 'idCategoriaTicket', 'IdCategoriaTicket'),
      nombre: this.pickString(item, 'nombre', 'Nombre')
    };
  }

  private normalizeSubcategoria(value: unknown): SubcategoriaTicketOption {
    const item = value as Record<string, unknown>;
    return {
      idSubcategoriaTicket: this.pickNumber(item, 'idSubcategoriaTicket', 'IdSubcategoriaTicket'),
      idCategoriaTicket: this.pickNumber(item, 'idCategoriaTicket', 'IdCategoriaTicket'),
      nombreCategoriaTicket: this.pickString(item, 'nombreCategoriaTicket', 'NombreCategoriaTicket'),
      nombre: this.pickString(item, 'nombre', 'Nombre')
    };
  }

  private pickString(item: Record<string, unknown>, camel: string, pascal: string): string {
    return String(item[camel] ?? item[pascal] ?? '');
  }

  private pickNullableString(item: Record<string, unknown>, camel: string, pascal: string): string | null {
    const value = item[camel] ?? item[pascal] ?? null;
    return value === null || value === undefined ? null : String(value);
  }

  private pickNumber(item: Record<string, unknown>, camel: string, pascal: string): number {
    return Number(item[camel] ?? item[pascal] ?? 0);
  }

  private pickBoolean(item: Record<string, unknown>, camel: string, pascal: string): boolean {
    return Boolean(item[camel] ?? item[pascal] ?? false);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) return 'No se pudo conectar con la API.';
    if (error.status === 401 || error.status === 403) return 'Tu sesion no tiene permisos para ver estos tickets.';
    if (error.status === 400) return 'La API rechazo la operacion. Revisa estado, prioridad, subcategoria o responsable de categoria.';
    return 'Ocurrio un error al cargar la bandeja de tickets.';
  }
}
