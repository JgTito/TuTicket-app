import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Notificacion, NotificacionFilters } from '../../core/notifications/notificacion.models';
import { NotificacionService } from '../../core/notifications/notificacion.service';

@Component({
  selector: 'app-notificaciones-page',
  imports: [RouterLink],
  templateUrl: './notificaciones.page.html'
})
export class NotificacionesPage {
  private readonly notificacionService = inject(NotificacionService);
  private readonly router = inject(Router);

  readonly notificaciones = signal<Notificacion[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly soloNoLeidas = signal(false);
  readonly idTicket = signal('');
  readonly fechaDesde = signal('');
  readonly fechaHasta = signal('');
  readonly pagina = signal(1);
  readonly tamanoPagina = signal(10);
  readonly totalRegistros = signal(0);
  readonly totalPaginas = signal(0);
  readonly pageSizeOptions = [5, 10, 25, 50, 100];

  constructor() {
    this.loadNotificaciones();
  }

  loadNotificaciones(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.notificacionService
      .getMisNotificaciones(this.pagina(), this.tamanoPagina(), this.buildFilters())
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

          const datos = (response.datos ?? response.Datos ?? []).map((item) => this.normalizeNotificacion(item));
          this.notificaciones.set(datos);
          this.pagina.set(response.pagina ?? response.Pagina ?? this.pagina());
          this.tamanoPagina.set(response.tamanoPagina ?? response.TamanoPagina ?? this.tamanoPagina());
          this.totalRegistros.set(response.totalRegistros ?? response.TotalRegistros ?? 0);
          this.totalPaginas.set(response.totalPaginas ?? response.TotalPaginas ?? 0);
          this.markVisibleUnreadAsRead(datos);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  applyFilters(): void {
    this.pagina.set(1);
    this.loadNotificaciones();
  }

  clearFilters(): void {
    this.soloNoLeidas.set(false);
    this.idTicket.set('');
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.pagina.set(1);
    this.loadNotificaciones();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPaginas() || page === this.pagina()) return;
    this.pagina.set(page);
    this.loadNotificaciones();
  }

  changePageSize(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.tamanoPagina.set(size);
    this.pagina.set(1);
    this.loadNotificaciones();
  }

  toggleSoloNoLeidas(): void {
    this.soloNoLeidas.update((value) => !value);
  }

  markAllRead(): void {
    if (this.saving()) return;

    this.saving.set(true);
    this.errorMessage.set(null);

    this.notificacionService
      .markAllRead()
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.notificaciones.update((items) => items.map((item) => ({ ...item, leida: true, fechaLectura: item.fechaLectura ?? new Date().toISOString() })));
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  markUnread(notificacion: Notificacion): void {
    if (this.saving() || !notificacion.leida) return;

    this.saving.set(true);
    this.errorMessage.set(null);

    this.notificacionService
      .markUnread(notificacion.idNotificacion)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.notificaciones.update((items) =>
            items.map((item) =>
              item.idNotificacion === notificacion.idNotificacion ? { ...item, leida: false, fechaLectura: null } : item
            )
          );
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  openTicket(notificacion: Notificacion): void {
    if (!notificacion.idTicket) return;
    void this.router.navigate(['/tickets', notificacion.idTicket]);
  }

  firstRecord(): number {
    if (this.totalRegistros() === 0) return 0;
    return (this.pagina() - 1) * this.tamanoPagina() + 1;
  }

  lastRecord(): number {
    return Math.min(this.pagina() * this.tamanoPagina(), this.totalRegistros());
  }

  formatDate(value: string | null): string {
    if (!value) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  }

  private markVisibleUnreadAsRead(notificaciones: Notificacion[]): void {
    const unreadIds = notificaciones.filter((notificacion) => !notificacion.leida).map((notificacion) => notificacion.idNotificacion);

    if (unreadIds.length === 0) return;

    this.notificacionService.markReadMany(unreadIds).subscribe({
      next: () => {
        const fechaLectura = new Date().toISOString();
        this.notificaciones.update((items) =>
          items.map((item) => (unreadIds.includes(item.idNotificacion) ? { ...item, leida: true, fechaLectura } : item))
        );
      },
      error: () =>
        this.notificacionService.refreshUnreadCount().subscribe({
          error: () => this.notificacionService.resetUnreadCount()
        })
    });
  }

  private buildFilters(): NotificacionFilters {
    return {
      soloNoLeidas: this.soloNoLeidas(),
      idTicket: this.idTicket().trim() ? Number(this.idTicket()) : null,
      fechaDesde: this.formatDateParam(this.fechaDesde()),
      fechaHasta: this.formatDateParam(this.fechaHasta(), true)
    };
  }

  private formatDateParam(value: string, endOfDay = false): string | null {
    if (!value) return null;
    return `${value}T${endOfDay ? '23:59:59' : '00:00:00'}`;
  }

  private normalizeNotificacion(value: unknown): Notificacion {
    const item = value as Record<string, unknown>;
    return {
      idNotificacion: this.pickNumber(item, 'idNotificacion', 'IdNotificacion'),
      idUsuarioDestino: this.pickString(item, 'idUsuarioDestino', 'IdUsuarioDestino'),
      nombreUsuarioDestino: this.pickString(item, 'nombreUsuarioDestino', 'NombreUsuarioDestino'),
      idTicket: this.pickNullableNumber(item, 'idTicket', 'IdTicket'),
      codigoTicket: this.pickNullableString(item, 'codigoTicket', 'CodigoTicket'),
      titulo: this.pickString(item, 'titulo', 'Titulo'),
      mensaje: this.pickString(item, 'mensaje', 'Mensaje'),
      leida: this.pickBoolean(item, 'leida', 'Leida'),
      fechaCreacion: this.pickString(item, 'fechaCreacion', 'FechaCreacion'),
      fechaLectura: this.pickNullableString(item, 'fechaLectura', 'FechaLectura')
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

  private pickNullableNumber(item: Record<string, unknown>, camel: string, pascal: string): number | null {
    const value = item[camel] ?? item[pascal] ?? null;
    return value === null || value === undefined ? null : Number(value);
  }

  private pickBoolean(item: Record<string, unknown>, camel: string, pascal: string): boolean {
    return Boolean(item[camel] ?? item[pascal] ?? false);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) return 'No se pudo conectar con la API.';
    if (error.status === 401 || error.status === 403) return 'Tu sesion no tiene permisos para ver estas notificaciones.';
    if (error.status === 400) return 'La API rechazo los filtros. Revisa fechas o ticket indicado.';
    return 'Ocurrio un error al cargar las notificaciones.';
  }
}
