import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import {
  FlujoEstadoTicketFormDialogComponent,
  FlujoEstadoTicketFormDialogData
} from './flujo-estado-ticket-form-dialog.component';
import { FlujoEstadoTicketListComponent } from './flujo-estado-ticket-list.component';
import {
  EstadoTicketSelect,
  FlujoEstadoTicket,
  FlujoEstadoTicketRequest
} from './flujo-estado-ticket.models';
import { FlujoEstadoTicketService } from './flujo-estado-ticket.service';

@Component({
  selector: 'app-flujo-estado-ticket-page',
  imports: [FlujoEstadoTicketListComponent],
  templateUrl: './flujo-estado-ticket.page.html'
})
export class FlujoEstadoTicketPage {
  private readonly flujoEstadoTicketService = inject(FlujoEstadoTicketService);
  private readonly dialog = inject(MatDialog);

  readonly flujos = signal<FlujoEstadoTicket[]>([]);
  readonly estados = signal<EstadoTicketSelect[]>([]);
  readonly loading = signal(true);
  readonly loadingEstados = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly incluirInactivos = signal(false);
  readonly pagina = signal(1);
  readonly tamanoPagina = signal(5);
  readonly totalRegistros = signal(0);
  readonly totalPaginas = signal(0);

  constructor() {
    this.loadEstados();
    this.loadFlujos();
  }

  loadEstados(): void {
    this.loadingEstados.set(true);

    this.flujoEstadoTicketService
      .getEstadosSelect()
      .pipe(finalize(() => this.loadingEstados.set(false)))
      .subscribe({
        next: (estados) => this.estados.set((estados ?? []).map((estado) => this.normalizeEstado(estado))),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadFlujos(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.flujoEstadoTicketService
      .getAll(this.incluirInactivos(), this.pagina(), this.tamanoPagina())
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
          const datos = (response.datos ?? response.Datos ?? []).map((flujo) => this.normalizeFlujo(flujo));

          this.flujos.set(datos);
          this.pagina.set(response.pagina ?? response.Pagina ?? this.pagina());
          this.tamanoPagina.set(response.tamanoPagina ?? response.TamanoPagina ?? this.tamanoPagina());
          this.totalRegistros.set(response.totalRegistros ?? response.TotalRegistros ?? 0);
          this.totalPaginas.set(response.totalPaginas ?? response.TotalPaginas ?? 0);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  toggleInactivos(): void {
    this.incluirInactivos.update((value) => !value);
    this.pagina.set(1);
    this.loadFlujos();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPaginas() || page === this.pagina()) {
      return;
    }

    this.pagina.set(page);
    this.loadFlujos();
  }

  changePageSize(size: number): void {
    this.tamanoPagina.set(size);
    this.pagina.set(1);
    this.loadFlujos();
  }

  openCreateModal(): void {
    this.openFormModal({
      mode: 'create',
      estados: this.estados()
    });
  }

  openEditModal(flujo: FlujoEstadoTicket): void {
    this.openFormModal({
      mode: 'edit',
      flujo,
      estados: this.estados()
    });
  }

  openDeleteModal(flujo: FlujoEstadoTicket): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar flujo',
        message: `El flujo de "${flujo.nombreEstadoOrigen}" a "${flujo.nombreEstadoDestino}" quedara inactivo.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteFlujo(flujo);
      }
    });
  }

  private openFormModal(data: FlujoEstadoTicketFormDialogData): void {
    const dialogRef = this.dialog.open<FlujoEstadoTicketFormDialogComponent, FlujoEstadoTicketFormDialogData, FlujoEstadoTicketRequest>(
      FlujoEstadoTicketFormDialogComponent,
      {
        width: '620px',
        data,
        disableClose: this.saving()
      }
    );

    dialogRef.afterClosed().subscribe((request) => {
      if (!request) {
        return;
      }

      if (data.mode === 'edit' && data.flujo) {
        this.updateFlujo(data.flujo.idFlujoEstadoTicket, request);
        return;
      }

      this.createFlujo(request);
    });
  }

  private createFlujo(request: FlujoEstadoTicketRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.flujoEstadoTicketService
      .create(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.pagina.set(1);
          this.loadFlujos();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private updateFlujo(id: number, request: FlujoEstadoTicketRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.flujoEstadoTicketService
      .update(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.loadFlujos(),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private deleteFlujo(flujo: FlujoEstadoTicket): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.flujoEstadoTicketService
      .delete(flujo.idFlujoEstadoTicket)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.flujos().length === 1 && this.pagina() > 1) {
            this.pagina.update((page) => page - 1);
          }

          this.loadFlujos();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private normalizeFlujo(value: unknown): FlujoEstadoTicket {
    const item = value as Partial<FlujoEstadoTicket> & Record<string, unknown>;
    return {
      idFlujoEstadoTicket: Number(item['idFlujoEstadoTicket'] ?? item['IdFlujoEstadoTicket'] ?? 0),
      idEstadoOrigen: Number(item['idEstadoOrigen'] ?? item['IdEstadoOrigen'] ?? 0),
      nombreEstadoOrigen: String(item['nombreEstadoOrigen'] ?? item['NombreEstadoOrigen'] ?? ''),
      idEstadoDestino: Number(item['idEstadoDestino'] ?? item['IdEstadoDestino'] ?? 0),
      nombreEstadoDestino: String(item['nombreEstadoDestino'] ?? item['NombreEstadoDestino'] ?? ''),
      requiereComentario: Boolean(item['requiereComentario'] ?? item['RequiereComentario'] ?? false),
      activo: Boolean(item['activo'] ?? item['Activo'] ?? false)
    };
  }

  private normalizeEstado(value: unknown): EstadoTicketSelect {
    const item = value as Record<string, unknown>;
    return {
      idEstadoTicket: Number(item['idEstadoTicket'] ?? item['IdEstadoTicket'] ?? 0),
      nombre: String(item['nombre'] ?? item['Nombre'] ?? ''),
      esEstadoFinal: Boolean(item['esEstadoFinal'] ?? item['EsEstadoFinal'] ?? false),
      orden: Number(item['orden'] ?? item['Orden'] ?? 0)
    };
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con la API.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Tu sesion no tiene permisos para administrar flujos de estado.';
    }

    if (error.status === 400) {
      return 'La API rechazo la operacion. Revisa estados duplicados, inactivos o iguales.';
    }

    return 'Ocurrio un error al procesar la operacion.';
  }
}
