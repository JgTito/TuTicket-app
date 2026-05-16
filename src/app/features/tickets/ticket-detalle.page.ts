import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import {
  TicketAdjuntoUploadDialogComponent,
  TicketAdjuntoUploadDialogData
} from './ticket-adjunto-upload-dialog.component';
import {
  TicketAceptarResolucionDialogComponent,
  TicketAceptarResolucionDialogData,
  TicketAceptarResolucionDialogResult
} from './ticket-aceptar-resolucion-dialog.component';
import {
  TicketAsignarUsuarioDialogComponent,
  TicketAsignarUsuarioDialogData,
  TicketAsignarUsuarioDialogResult
} from './ticket-asignar-usuario-dialog.component';
import {
  TicketBitacoraFormDialogComponent,
  TicketBitacoraFormDialogData,
  TicketBitacoraFormDialogResult
} from './ticket-bitacora-form-dialog.component';
import {
  TicketCancelarDialogComponent,
  TicketCancelarDialogData,
  TicketCancelarDialogResult
} from './ticket-cancelar-dialog.component';
import {
  TicketReabrirDialogComponent,
  TicketReabrirDialogData,
  TicketReabrirDialogResult
} from './ticket-reabrir-dialog.component';
import {
  TicketRelacionFormDialogComponent,
  TicketRelacionFormDialogData,
  TicketRelacionFormDialogResult
} from './ticket-relacion-form-dialog.component';
import {
  EstadoDisponibleTicket,
  EstadoTicketOption,
  Ticket,
  TicketAdjunto,
  TicketBitacora,
  TicketHistorial,
  TicketRelacion,
  TicketSla,
  TipoRelacionTicketOption,
  UsuarioSelect
} from './ticket-bandeja.models';
import { TicketBandejaService } from './ticket-bandeja.service';
import {
  TicketCambiarEstadoDialogComponent,
  TicketCambiarEstadoDialogData,
  TicketCambiarEstadoDialogResult
} from './ticket-cambiar-estado-dialog.component';
import { getEstadoTicketBadgeClass } from './ticket-estado-style';
import { getPrioridadTicketBadgeClass } from './ticket-prioridad-style';

type DetailTab = 'resumen' | 'sla' | 'adjuntos' | 'bitacora' | 'historial' | 'relaciones';
const ESTADO_REABIERTO_ID = 8;
const ESTADO_CERRADO_ID = 9;
const ESTADO_CANCELADO_ID = 10;

@Component({
  selector: 'app-ticket-detalle-page',
  imports: [RouterLink],
  templateUrl: './ticket-detalle.page.html'
})
export class TicketDetallePage {
  private readonly route = inject(ActivatedRoute);
  private readonly ticketService = inject(TicketBandejaService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly ticket = signal<Ticket | null>(null);
  readonly adjuntos = signal<TicketAdjunto[]>([]);
  readonly bitacora = signal<TicketBitacora[]>([]);
  readonly historial = signal<TicketHistorial[]>([]);
  readonly relaciones = signal<TicketRelacion[]>([]);
  readonly slas = signal<TicketSla[]>([]);
  readonly usuarios = signal<UsuarioSelect[]>([]);
  readonly tiposRelacion = signal<TipoRelacionTicketOption[]>([]);
  readonly estados = signal<EstadoTicketOption[]>([]);
  readonly estadosDisponibles = signal<EstadoDisponibleTicket[]>([]);
  readonly loading = signal(true);
  readonly loadingAdjuntos = signal(false);
  readonly loadingBitacora = signal(false);
  readonly loadingHistorial = signal(false);
  readonly loadingRelaciones = signal(false);
  readonly loadingUsuarios = signal(false);
  readonly loadingTiposRelacion = signal(false);
  readonly uploadingAdjunto = signal(false);
  readonly savingBitacora = signal(false);
  readonly changingEstado = signal(false);
  readonly assigningTicket = signal(false);
  readonly relatingTicket = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isAdmin = this.authService.isAdmin;
  readonly bitacoraPagina = signal(1);
  readonly bitacoraTamanoPagina = signal(5);
  readonly bitacoraTotalRegistros = signal(0);
  readonly bitacoraTotalPaginas = signal(0);
  readonly adjuntosPagina = signal(1);
  readonly adjuntosTamanoPagina = signal(5);
  readonly adjuntosTotalRegistros = signal(0);
  readonly adjuntosTotalPaginas = signal(0);
  readonly historialPagina = signal(1);
  readonly historialTamanoPagina = signal(5);
  readonly historialTotalRegistros = signal(0);
  readonly historialTotalPaginas = signal(0);
  readonly bitacoraPageSizeOptions = [5, 10, 25, 50, 100];
  readonly activeTab = signal<DetailTab>('resumen');
  readonly tabs: { id: DetailTab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'sla', label: 'SLA' },
    { id: 'adjuntos', label: 'Adjuntos' },
    { id: 'bitacora', label: 'Bitacora' },
    { id: 'historial', label: 'Historial' },
    { id: 'relaciones', label: 'Relaciones' }
  ];

  constructor() {
    const idTicket = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTicket(idTicket);
  }

  loadTicket(idTicket: number): void {
    if (!idTicket) {
      this.errorMessage.set('El ticket solicitado no es valido.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      ticket: this.ticketService.getTicket(idTicket),
      estados: this.ticketService.getEstadosSelect(),
      estadosDisponibles: this.ticketService.getEstadosDisponibles(idTicket),
      relaciones: this.ticketService.getRelaciones(idTicket),
      slas: this.ticketService.getSla(idTicket)
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ ticket, estados, estadosDisponibles, relaciones, slas }) => {
          const normalizedTicket = this.normalizeTicket(ticket);
          this.ticket.set(normalizedTicket);
          this.estados.set((estados ?? []).map((estado) => this.normalizeEstado(estado)));
          this.estadosDisponibles.set((estadosDisponibles ?? []).map((estado) => this.normalizeEstadoDisponible(estado)));
          this.relaciones.set((relaciones ?? []).map((item) => this.normalizeRelacion(item)));
          this.slas.set((slas ?? []).map((item) => this.normalizeSla(item)));
          this.loadAdjuntos(normalizedTicket.idTicket);
          this.loadBitacora(normalizedTicket.idTicket);
          this.loadHistorial(normalizedTicket.idTicket);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadAdjuntos(idTicket = this.ticket()?.idTicket ?? 0): void {
    if (!idTicket) return;

    this.loadingAdjuntos.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .getAdjuntos(idTicket, this.adjuntosPagina(), this.adjuntosTamanoPagina())
      .pipe(finalize(() => this.loadingAdjuntos.set(false)))
      .subscribe({
        next: (resultado) => {
          const response = resultado as typeof resultado & {
            Datos?: unknown[];
            Pagina?: number;
            TamanoPagina?: number;
            TotalRegistros?: number;
            TotalPaginas?: number;
          };
          this.adjuntos.set((response.datos ?? response.Datos ?? []).map((item) => this.normalizeAdjunto(item)));
          this.adjuntosPagina.set(response.pagina ?? response.Pagina ?? this.adjuntosPagina());
          this.adjuntosTamanoPagina.set(response.tamanoPagina ?? response.TamanoPagina ?? this.adjuntosTamanoPagina());
          this.adjuntosTotalRegistros.set(response.totalRegistros ?? response.TotalRegistros ?? 0);
          this.adjuntosTotalPaginas.set(response.totalPaginas ?? response.TotalPaginas ?? 0);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadBitacora(idTicket = this.ticket()?.idTicket ?? 0): void {
    if (!idTicket) return;

    this.loadingBitacora.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .getBitacora(idTicket, this.bitacoraPagina(), this.bitacoraTamanoPagina())
      .pipe(finalize(() => this.loadingBitacora.set(false)))
      .subscribe({
        next: (resultado) => {
          const response = resultado as typeof resultado & {
            Datos?: unknown[];
            Pagina?: number;
            TamanoPagina?: number;
            TotalRegistros?: number;
            TotalPaginas?: number;
          };
          this.bitacora.set((response.datos ?? response.Datos ?? []).map((item) => this.normalizeBitacora(item)));
          this.bitacoraPagina.set(response.pagina ?? response.Pagina ?? this.bitacoraPagina());
          this.bitacoraTamanoPagina.set(response.tamanoPagina ?? response.TamanoPagina ?? this.bitacoraTamanoPagina());
          this.bitacoraTotalRegistros.set(response.totalRegistros ?? response.TotalRegistros ?? 0);
          this.bitacoraTotalPaginas.set(response.totalPaginas ?? response.TotalPaginas ?? 0);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadHistorial(idTicket = this.ticket()?.idTicket ?? 0): void {
    if (!idTicket) return;

    this.loadingHistorial.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .getHistorial(idTicket, this.historialPagina(), this.historialTamanoPagina())
      .pipe(finalize(() => this.loadingHistorial.set(false)))
      .subscribe({
        next: (resultado) => {
          const response = resultado as typeof resultado & {
            Datos?: unknown[];
            Pagina?: number;
            TamanoPagina?: number;
            TotalRegistros?: number;
            TotalPaginas?: number;
          };
          this.historial.set((response.datos ?? response.Datos ?? []).map((item) => this.normalizeHistorial(item)));
          this.historialPagina.set(response.pagina ?? response.Pagina ?? this.historialPagina());
          this.historialTamanoPagina.set(response.tamanoPagina ?? response.TamanoPagina ?? this.historialTamanoPagina());
          this.historialTotalRegistros.set(response.totalRegistros ?? response.TotalRegistros ?? 0);
          this.historialTotalPaginas.set(response.totalPaginas ?? response.TotalPaginas ?? 0);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadRelaciones(idTicket = this.ticket()?.idTicket ?? 0): void {
    if (!idTicket) return;

    this.loadingRelaciones.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .getRelaciones(idTicket)
      .pipe(finalize(() => this.loadingRelaciones.set(false)))
      .subscribe({
        next: (relaciones) => {
          this.relaciones.set((relaciones ?? []).map((item) => this.normalizeRelacion(item)));
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  formatDate(value: string | null): string {
    if (!value) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  }

  formatBytes(value: number | null): string {
    if (!value) return 'Sin peso';
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / 1024 / 1024).toFixed(1)} MB`;
  }

  prioridadBadgeClass(ticket: Ticket | null): string {
    return getPrioridadTicketBadgeClass(ticket?.idPrioridadTicket, ticket?.nombrePrioridadTicket);
  }

  estadoBadgeClass(ticket: Ticket | null): string {
    return getEstadoTicketBadgeClass(ticket?.idEstadoTicket, ticket?.nombreEstadoTicket);
  }

  downloadAdjunto(adjunto: TicketAdjunto): void {
    this.ticketService.downloadAdjunto(adjunto.idTicketAdjunto).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = adjunto.nombreArchivoOriginal || adjunto.nombreArchivoGuardado;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
    });
  }

  openAdjuntoModal(): void {
    const ticket = this.ticket();

    if (!ticket) {
      return;
    }

    this.dialog
      .open<TicketAdjuntoUploadDialogComponent, TicketAdjuntoUploadDialogData, File[]>(TicketAdjuntoUploadDialogComponent, {
        width: '520px',
        data: { codigoTicket: ticket.codigo },
        disableClose: this.uploadingAdjunto()
      })
      .afterClosed()
      .subscribe((archivos) => {
        if (archivos?.length) {
          this.uploadAdjuntos(ticket.idTicket, archivos);
        }
      });
  }

  openBitacoraModal(): void {
    const ticket = this.ticket();

    if (!ticket) return;

    this.dialog
      .open<TicketBitacoraFormDialogComponent, TicketBitacoraFormDialogData, TicketBitacoraFormDialogResult>(
        TicketBitacoraFormDialogComponent,
        {
          width: '560px',
          data: { codigoTicket: ticket.codigo },
          disableClose: this.savingBitacora()
        }
      )
      .afterClosed()
      .subscribe((request) => {
        if (request) this.createBitacora(ticket.idTicket, request);
      });
  }

  openCambiarEstadoModal(): void {
    const ticket = this.ticket();

    if (!ticket) return;

    if (this.estadosDisponibles().length === 0) {
      this.errorMessage.set('Este ticket no tiene estados disponibles para cambiar.');
      return;
    }

    this.dialog
      .open<TicketCambiarEstadoDialogComponent, TicketCambiarEstadoDialogData, boolean>(
        TicketCambiarEstadoDialogComponent,
        {
          width: '560px',
          data: {
            idTicket: ticket.idTicket,
            codigoTicket: ticket.codigo,
            estadoActual: ticket.nombreEstadoTicket,
            estados: this.estadosDisponibles()
          },
          disableClose: this.changingEstado()
        }
      )
      .afterClosed()
      .subscribe((changed) => {
        if (changed) {
          this.loadTicket(ticket.idTicket);
          this.activeTab.set('resumen');
        }
      });
  }

  esSolicitanteTicket(): boolean {
    const ticket = this.ticket();
    const user = this.authService.currentUser();

    return !!ticket && !!user?.id && ticket.idUsuarioSolicitante === user.id;
  }

  puedeCambiarEstado(): boolean {
    const roles = this.authService.currentUser()?.roles ?? [];
    return roles.includes('Administrador') || roles.includes('ResolvedorTicket');
  }

  puedeAceptarResolucion(): boolean {
    return this.estadosDisponibles().some((estado) => estado.idEstadoTicket === ESTADO_CERRADO_ID);
  }

  puedeReabrirTicket(): boolean {
    return this.estadosDisponibles().some((estado) => estado.idEstadoTicket === ESTADO_REABIERTO_ID);
  }

  puedeCancelarTicket(): boolean {
    return this.estadosDisponibles().some((estado) => estado.idEstadoTicket === ESTADO_CANCELADO_ID);
  }

  ticketEstaEnEstadoFinal(): boolean {
    const ticket = this.ticket();
    if (!ticket) return false;

    return this.estados().some((estado) => estado.idEstadoTicket === ticket.idEstadoTicket && estado.esEstadoFinal);
  }

  openAceptarResolucionModal(): void {
    const ticket = this.ticket();

    if (!ticket || !this.esSolicitanteTicket() || !this.puedeAceptarResolucion()) {
      return;
    }

    this.dialog
      .open<TicketAceptarResolucionDialogComponent, TicketAceptarResolucionDialogData, TicketAceptarResolucionDialogResult>(
        TicketAceptarResolucionDialogComponent,
        {
          width: '560px',
          data: { codigoTicket: ticket.codigo },
          disableClose: this.changingEstado()
        }
      )
      .afterClosed()
      .subscribe((request) => {
        if (request) {
          this.aceptarResolucion(ticket.idTicket, request);
        }
      });
  }

  openCancelarTicketModal(): void {
    const ticket = this.ticket();

    if (!ticket || !this.esSolicitanteTicket() || !this.puedeCancelarTicket()) {
      return;
    }

    this.dialog
      .open<TicketCancelarDialogComponent, TicketCancelarDialogData, TicketCancelarDialogResult>(TicketCancelarDialogComponent, {
        width: '560px',
        data: { codigoTicket: ticket.codigo },
        disableClose: this.changingEstado()
      })
      .afterClosed()
      .subscribe((request) => {
        if (request) {
          this.cancelarTicket(ticket.idTicket, request);
        }
      });
  }

  openReabrirTicketModal(): void {
    const ticket = this.ticket();

    if (!ticket || !this.esSolicitanteTicket() || !this.puedeReabrirTicket()) {
      return;
    }

    this.dialog
      .open<TicketReabrirDialogComponent, TicketReabrirDialogData, TicketReabrirDialogResult>(TicketReabrirDialogComponent, {
        width: '560px',
        data: { codigoTicket: ticket.codigo },
        disableClose: this.changingEstado()
      })
      .afterClosed()
      .subscribe((request) => {
        if (request) {
          this.reabrirTicket(ticket.idTicket, request);
        }
      });
  }

  openAsignarUsuarioModal(): void {
    const ticket = this.ticket();

    if (!ticket) return;

    if (this.ticketEstaEnEstadoFinal()) {
      this.errorMessage.set('No se puede asignar usuario porque el ticket esta en un estado final.');
      return;
    }

    if (this.usuarios().length > 0) {
      this.showAsignarUsuarioModal(ticket);
      return;
    }

    this.loadingUsuarios.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .getResponsablesTicketSelect(ticket.idTicket)
      .pipe(finalize(() => this.loadingUsuarios.set(false)))
      .subscribe({
        next: (usuarios) => {
          this.usuarios.set((usuarios ?? []).map((usuario) => this.normalizeUsuario(usuario)));
          this.showAsignarUsuarioModal(ticket);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  openRelacionModal(): void {
    const ticket = this.ticket();

    if (!ticket) return;

    if (this.tiposRelacion().length > 0) {
      this.showRelacionModal(ticket);
      return;
    }

    this.loadingTiposRelacion.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .getTiposRelacionSelect()
      .pipe(finalize(() => this.loadingTiposRelacion.set(false)))
      .subscribe({
        next: (tiposRelacion) => {
          this.tiposRelacion.set((tiposRelacion ?? []).map((tipoRelacion) => this.normalizeTipoRelacion(tipoRelacion)));
          this.showRelacionModal(ticket);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  changeBitacoraPage(page: number): void {
    if (page < 1 || page > this.bitacoraTotalPaginas() || page === this.bitacoraPagina()) return;
    this.bitacoraPagina.set(page);
    this.loadBitacora();
  }

  changeAdjuntosPage(page: number): void {
    if (page < 1 || page > this.adjuntosTotalPaginas() || page === this.adjuntosPagina()) return;
    this.adjuntosPagina.set(page);
    this.loadAdjuntos();
  }

  changeAdjuntosPageSize(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.adjuntosTamanoPagina.set(size);
    this.adjuntosPagina.set(1);
    this.loadAdjuntos();
  }

  changeBitacoraPageSize(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.bitacoraTamanoPagina.set(size);
    this.bitacoraPagina.set(1);
    this.loadBitacora();
  }

  changeHistorialPage(page: number): void {
    if (page < 1 || page > this.historialTotalPaginas() || page === this.historialPagina()) return;
    this.historialPagina.set(page);
    this.loadHistorial();
  }

  changeHistorialPageSize(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.historialTamanoPagina.set(size);
    this.historialPagina.set(1);
    this.loadHistorial();
  }

  adjuntosFirstRecord(): number {
    if (this.adjuntosTotalRegistros() === 0) return 0;
    return (this.adjuntosPagina() - 1) * this.adjuntosTamanoPagina() + 1;
  }

  adjuntosLastRecord(): number {
    return Math.min(this.adjuntosPagina() * this.adjuntosTamanoPagina(), this.adjuntosTotalRegistros());
  }

  bitacoraFirstRecord(): number {
    if (this.bitacoraTotalRegistros() === 0) return 0;
    return (this.bitacoraPagina() - 1) * this.bitacoraTamanoPagina() + 1;
  }

  bitacoraLastRecord(): number {
    return Math.min(this.bitacoraPagina() * this.bitacoraTamanoPagina(), this.bitacoraTotalRegistros());
  }

  historialFirstRecord(): number {
    if (this.historialTotalRegistros() === 0) return 0;
    return (this.historialPagina() - 1) * this.historialTamanoPagina() + 1;
  }

  historialLastRecord(): number {
    return Math.min(this.historialPagina() * this.historialTamanoPagina(), this.historialTotalRegistros());
  }

  private uploadAdjuntos(idTicket: number, archivos: File[]): void {
    const user = this.authService.currentUser();

    if (!user?.id) {
      this.errorMessage.set('No se pudo identificar el usuario autenticado.');
      return;
    }

    this.uploadingAdjunto.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .uploadAdjuntos(idTicket, archivos, user.id)
      .pipe(finalize(() => this.uploadingAdjunto.set(false)))
      .subscribe({
        next: () => {
          this.adjuntosPagina.set(1);
          this.activeTab.set('adjuntos');
          this.loadAdjuntos(idTicket);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private createBitacora(idTicket: number, request: TicketBitacoraFormDialogResult): void {
    const user = this.authService.currentUser();

    if (!user?.id) {
      this.errorMessage.set('No se pudo identificar el usuario autenticado.');
      return;
    }

    this.savingBitacora.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .createBitacora(idTicket, {
        comentario: request.comentario,
        esInterno: request.esInterno,
        idUsuarioCreacion: user.id
      })
      .pipe(finalize(() => this.savingBitacora.set(false)))
      .subscribe({
        next: () => {
          this.bitacoraPagina.set(1);
          this.activeTab.set('bitacora');
          this.loadBitacora(idTicket);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private cambiarEstado(idTicket: number, request: TicketCambiarEstadoDialogResult): void {
    const user = this.authService.currentUser();

    if (!user?.id) {
      this.errorMessage.set('No se pudo identificar el usuario autenticado.');
      return;
    }

    this.changingEstado.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .cambiarEstado(idTicket, {
        idEstadoTicket: request.idEstadoTicket,
        idUsuarioModificacion: user.id,
        comentario: request.comentario
      })
      .pipe(finalize(() => this.changingEstado.set(false)))
      .subscribe({
        next: () => {
          this.loadTicket(idTicket);
          this.activeTab.set('resumen');
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private aceptarResolucion(idTicket: number, request: TicketAceptarResolucionDialogResult): void {
    this.cambiarEstado(idTicket, {
      idEstadoTicket: ESTADO_CERRADO_ID,
      comentario: request.comentario
    });
  }

  private cancelarTicket(idTicket: number, request: TicketCancelarDialogResult): void {
    this.cambiarEstado(idTicket, {
      idEstadoTicket: ESTADO_CANCELADO_ID,
      comentario: request.comentario
    });
  }

  private reabrirTicket(idTicket: number, request: TicketReabrirDialogResult): void {
    this.cambiarEstado(idTicket, {
      idEstadoTicket: ESTADO_REABIERTO_ID,
      comentario: request.comentario
    });
  }

  private showAsignarUsuarioModal(ticket: Ticket): void {
    this.dialog
      .open<TicketAsignarUsuarioDialogComponent, TicketAsignarUsuarioDialogData, TicketAsignarUsuarioDialogResult>(
        TicketAsignarUsuarioDialogComponent,
        {
          width: '560px',
          data: {
            codigoTicket: ticket.codigo,
            usuarioAsignadoActual: ticket.idUsuarioAsignado,
            usuarios: this.usuarios()
          },
          disableClose: this.assigningTicket()
        }
      )
      .afterClosed()
      .subscribe((request) => {
        if (request) this.asignarTicket(ticket.idTicket, request);
      });
  }

  private asignarTicket(idTicket: number, request: TicketAsignarUsuarioDialogResult): void {
    this.assigningTicket.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .asignarTicket(idTicket, {
        idUsuarioAsignado: request.idUsuarioAsignado,
        comentario: request.comentario
      })
      .pipe(finalize(() => this.assigningTicket.set(false)))
      .subscribe({
        next: () => {
          this.loadTicket(idTicket);
          this.activeTab.set('resumen');
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private showRelacionModal(ticket: Ticket): void {
    this.dialog
      .open<TicketRelacionFormDialogComponent, TicketRelacionFormDialogData, TicketRelacionFormDialogResult>(
        TicketRelacionFormDialogComponent,
        {
          width: '900px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          data: {
            idTicket: ticket.idTicket,
            codigoTicket: ticket.codigo,
            tiposRelacion: this.tiposRelacion()
          },
          disableClose: this.relatingTicket()
        }
      )
      .afterClosed()
      .subscribe((request) => {
        if (request) this.createRelacion(ticket.idTicket, request);
      });
  }

  private createRelacion(idTicket: number, request: TicketRelacionFormDialogResult): void {
    this.relatingTicket.set(true);
    this.errorMessage.set(null);

    this.ticketService
      .createRelacion(idTicket, request)
      .pipe(finalize(() => this.relatingTicket.set(false)))
      .subscribe({
        next: () => {
          this.activeTab.set('relaciones');
          this.loadRelaciones(idTicket);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private normalizeTicket(value: unknown): Ticket {
    const item = value as Record<string, unknown>;
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
      cantidadReaperturas: this.pickNumber(item, 'cantidadReaperturas', 'CantidadReaperturas')
    };
  }

  private normalizeEstadoDisponible(value: unknown): EstadoDisponibleTicket {
    const item = value as Record<string, unknown>;
    return {
      idFlujoEstadoTicket: this.pickNumber(item, 'idFlujoEstadoTicket', 'IdFlujoEstadoTicket'),
      idEstadoTicket: this.pickNumber(item, 'idEstadoTicket', 'IdEstadoTicket'),
      nombre: this.pickString(item, 'nombre', 'Nombre'),
      descripcion: this.pickNullableString(item, 'descripcion', 'Descripcion'),
      esEstadoFinal: this.pickBoolean(item, 'esEstadoFinal', 'EsEstadoFinal'),
      orden: this.pickNumber(item, 'orden', 'Orden'),
      requiereComentario: this.pickBoolean(item, 'requiereComentario', 'RequiereComentario')
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

  private normalizeAdjunto(value: unknown): TicketAdjunto {
    const item = value as Record<string, unknown>;
    return {
      idTicketAdjunto: this.pickNumber(item, 'idTicketAdjunto', 'IdTicketAdjunto'),
      idTicket: this.pickNumber(item, 'idTicket', 'IdTicket'),
      codigoTicket: this.pickString(item, 'codigoTicket', 'CodigoTicket'),
      nombreArchivoOriginal: this.pickString(item, 'nombreArchivoOriginal', 'NombreArchivoOriginal'),
      nombreArchivoGuardado: this.pickString(item, 'nombreArchivoGuardado', 'NombreArchivoGuardado'),
      rutaArchivo: this.pickString(item, 'rutaArchivo', 'RutaArchivo'),
      tipoContenido: this.pickNullableString(item, 'tipoContenido', 'TipoContenido'),
      extension: this.pickNullableString(item, 'extension', 'Extension'),
      pesoBytes: this.pickNullableNumber(item, 'pesoBytes', 'PesoBytes'),
      idUsuarioSubida: this.pickString(item, 'idUsuarioSubida', 'IdUsuarioSubida'),
      nombreUsuarioSubida: this.pickString(item, 'nombreUsuarioSubida', 'NombreUsuarioSubida'),
      fechaSubida: this.pickString(item, 'fechaSubida', 'FechaSubida'),
      activo: this.pickBoolean(item, 'activo', 'Activo')
    };
  }

  private normalizeBitacora(value: unknown): TicketBitacora {
    const item = value as Record<string, unknown>;
    return {
      idTicketBitacora: this.pickNumber(item, 'idTicketBitacora', 'IdTicketBitacora'),
      idTicket: this.pickNumber(item, 'idTicket', 'IdTicket'),
      comentario: this.pickString(item, 'comentario', 'Comentario'),
      esInterno: this.pickBoolean(item, 'esInterno', 'EsInterno'),
      idUsuarioCreacion: this.pickString(item, 'idUsuarioCreacion', 'IdUsuarioCreacion'),
      nombreUsuarioCreacion: this.pickString(item, 'nombreUsuarioCreacion', 'NombreUsuarioCreacion'),
      fechaCreacion: this.pickString(item, 'fechaCreacion', 'FechaCreacion'),
      activo: this.pickBoolean(item, 'activo', 'Activo')
    };
  }

  private normalizeHistorial(value: unknown): TicketHistorial {
    const item = value as Record<string, unknown>;
    return {
      idTicketHistorial: this.pickNumber(item, 'idTicketHistorial', 'IdTicketHistorial'),
      idTicket: this.pickNumber(item, 'idTicket', 'IdTicket'),
      campoModificado: this.pickString(item, 'campoModificado', 'CampoModificado'),
      valorAnterior: this.pickNullableString(item, 'valorAnterior', 'ValorAnterior'),
      valorNuevo: this.pickNullableString(item, 'valorNuevo', 'ValorNuevo'),
      comentario: this.pickNullableString(item, 'comentario', 'Comentario'),
      idUsuarioModificacion: this.pickString(item, 'idUsuarioModificacion', 'IdUsuarioModificacion'),
      nombreUsuarioModificacion: this.pickString(item, 'nombreUsuarioModificacion', 'NombreUsuarioModificacion'),
      fechaModificacion: this.pickString(item, 'fechaModificacion', 'FechaModificacion')
    };
  }

  private normalizeRelacion(value: unknown): TicketRelacion {
    const item = value as Record<string, unknown>;
    return {
      idTicketRelacion: this.pickNumber(item, 'idTicketRelacion', 'IdTicketRelacion'),
      idTicketOrigen: this.pickNumber(item, 'idTicketOrigen', 'IdTicketOrigen'),
      codigoTicketOrigen: this.pickString(item, 'codigoTicketOrigen', 'CodigoTicketOrigen'),
      idTicketRelacionado: this.pickNumber(item, 'idTicketRelacionado', 'IdTicketRelacionado'),
      codigoTicketRelacionado: this.pickString(item, 'codigoTicketRelacionado', 'CodigoTicketRelacionado'),
      idTipoRelacionTicket: this.pickNumber(item, 'idTipoRelacionTicket', 'IdTipoRelacionTicket'),
      nombreTipoRelacionTicket: this.pickString(item, 'nombreTipoRelacionTicket', 'NombreTipoRelacionTicket'),
      observacion: this.pickNullableString(item, 'observacion', 'Observacion'),
      idUsuarioCreacion: this.pickString(item, 'idUsuarioCreacion', 'IdUsuarioCreacion'),
      nombreUsuarioCreacion: this.pickString(item, 'nombreUsuarioCreacion', 'NombreUsuarioCreacion'),
      fechaCreacion: this.pickString(item, 'fechaCreacion', 'FechaCreacion'),
      activo: this.pickBoolean(item, 'activo', 'Activo')
    };
  }

  private normalizeSla(value: unknown): TicketSla {
    const item = value as Record<string, unknown>;
    return {
      idTicketSla: this.pickNumber(item, 'idTicketSla', 'IdTicketSla'),
      idTicket: this.pickNumber(item, 'idTicket', 'IdTicket'),
      codigoTicket: this.pickString(item, 'codigoTicket', 'CodigoTicket'),
      idSlaRegla: this.pickNumber(item, 'idSlaRegla', 'IdSlaRegla'),
      nombreSlaPolitica: this.pickString(item, 'nombreSlaPolitica', 'NombreSlaPolitica'),
      nombrePrioridadTicket: this.pickString(item, 'nombrePrioridadTicket', 'NombrePrioridadTicket'),
      nombreCategoriaTicket: this.pickNullableString(item, 'nombreCategoriaTicket', 'NombreCategoriaTicket'),
      fechaInicio: this.pickString(item, 'fechaInicio', 'FechaInicio'),
      fechaLimitePrimeraRespuesta: this.pickString(item, 'fechaLimitePrimeraRespuesta', 'FechaLimitePrimeraRespuesta'),
      fechaLimiteResolucion: this.pickString(item, 'fechaLimiteResolucion', 'FechaLimiteResolucion'),
      fechaPrimeraRespuestaReal: this.pickNullableString(item, 'fechaPrimeraRespuestaReal', 'FechaPrimeraRespuestaReal'),
      fechaResolucionReal: this.pickNullableString(item, 'fechaResolucionReal', 'FechaResolucionReal'),
      primeraRespuestaVencida: this.pickBoolean(item, 'primeraRespuestaVencida', 'PrimeraRespuestaVencida'),
      resolucionVencida: this.pickBoolean(item, 'resolucionVencida', 'ResolucionVencida'),
      activo: this.pickBoolean(item, 'activo', 'Activo')
    };
  }

  private normalizeUsuario(value: unknown): UsuarioSelect {
    const item = value as Record<string, unknown>;
    return {
      id: this.pickString(item, 'id', 'Id'),
      nombreCompleto: this.pickString(item, 'nombreCompleto', 'NombreCompleto'),
      email: this.pickNullableString(item, 'email', 'Email'),
      userName: this.pickNullableString(item, 'userName', 'UserName')
    };
  }

  private normalizeTipoRelacion(value: unknown): TipoRelacionTicketOption {
    const item = value as Record<string, unknown>;
    return {
      idTipoRelacionTicket: this.pickNumber(item, 'idTipoRelacionTicket', 'IdTipoRelacionTicket'),
      nombre: this.pickString(item, 'nombre', 'Nombre'),
      descripcion: this.pickNullableString(item, 'descripcion', 'Descripcion')
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
    if (error.status === 401 || error.status === 403) return 'Tu sesion no tiene permisos para ver este ticket.';
    if (error.status === 404) return 'No se encontro el ticket solicitado.';
    return 'Ocurrio un error al cargar el detalle del ticket.';
  }
}
