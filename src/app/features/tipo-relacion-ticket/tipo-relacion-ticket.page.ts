import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { TipoRelacionTicketFormDialogComponent, TipoRelacionTicketFormDialogData } from './tipo-relacion-ticket-form-dialog.component';
import { TipoRelacionTicketListComponent } from './tipo-relacion-ticket-list.component';
import { TipoRelacionTicket, TipoRelacionTicketRequest } from './tipo-relacion-ticket.models';
import { TipoRelacionTicketService } from './tipo-relacion-ticket.service';

@Component({
  selector: 'app-tipo-relacion-ticket-page',
  imports: [TipoRelacionTicketListComponent],
  templateUrl: './tipo-relacion-ticket.page.html'
})
export class TipoRelacionTicketPage {
  private readonly tipoRelacionTicketService = inject(TipoRelacionTicketService);
  private readonly dialog = inject(MatDialog);

  readonly tiposRelacion = signal<TipoRelacionTicket[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly incluirInactivos = signal(false);
  readonly pagina = signal(1);
  readonly tamanoPagina = signal(5);
  readonly totalRegistros = signal(0);
  readonly totalPaginas = signal(0);

  constructor() {
    this.loadTiposRelacion();
  }

  loadTiposRelacion(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.tipoRelacionTicketService
      .getAll(this.incluirInactivos(), this.pagina(), this.tamanoPagina())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (resultado) => {
          this.tiposRelacion.set(resultado.datos ?? []);
          this.pagina.set(resultado.pagina);
          this.tamanoPagina.set(resultado.tamanoPagina);
          this.totalRegistros.set(resultado.totalRegistros);
          this.totalPaginas.set(resultado.totalPaginas);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  toggleInactivos(): void {
    this.incluirInactivos.update((value) => !value);
    this.pagina.set(1);
    this.loadTiposRelacion();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPaginas() || page === this.pagina()) {
      return;
    }

    this.pagina.set(page);
    this.loadTiposRelacion();
  }

  changePageSize(size: number): void {
    this.tamanoPagina.set(size);
    this.pagina.set(1);
    this.loadTiposRelacion();
  }

  openCreateModal(): void {
    this.openFormModal({
      mode: 'create'
    });
  }

  openEditModal(tipoRelacion: TipoRelacionTicket): void {
    this.openFormModal({
      mode: 'edit',
      tipoRelacion
    });
  }

  openDeleteModal(tipoRelacion: TipoRelacionTicket): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar tipo de relacion',
        message: `El tipo "${tipoRelacion.nombre}" quedara inactivo y no aparecera en el listado principal.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteTipoRelacion(tipoRelacion);
      }
    });
  }

  private openFormModal(data: TipoRelacionTicketFormDialogData): void {
    const dialogRef = this.dialog.open<TipoRelacionTicketFormDialogComponent, TipoRelacionTicketFormDialogData, TipoRelacionTicketRequest>(
      TipoRelacionTicketFormDialogComponent,
      {
        width: '560px',
        data,
        disableClose: this.saving()
      }
    );

    dialogRef.afterClosed().subscribe((request) => {
      if (!request) {
        return;
      }

      if (data.mode === 'edit' && data.tipoRelacion) {
        this.updateTipoRelacion(data.tipoRelacion.idTipoRelacionTicket, request);
        return;
      }

      this.createTipoRelacion(request);
    });
  }

  private createTipoRelacion(request: TipoRelacionTicketRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.tipoRelacionTicketService
      .create(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.pagina.set(1);
          this.loadTiposRelacion();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private updateTipoRelacion(id: number, request: TipoRelacionTicketRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.tipoRelacionTicketService
      .update(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.loadTiposRelacion(),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private deleteTipoRelacion(tipoRelacion: TipoRelacionTicket): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.tipoRelacionTicketService
      .delete(tipoRelacion.idTipoRelacionTicket)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.tiposRelacion().length === 1 && this.pagina() > 1) {
            this.pagina.update((page) => page - 1);
          }

          this.loadTiposRelacion();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con la API.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Tu sesion no tiene permisos para administrar tipos de relacion.';
    }

    if (error.status === 400) {
      return 'La API rechazo la operacion. Revisa si el nombre ya existe o si faltan datos.';
    }

    return 'Ocurrio un error al procesar la operacion.';
  }
}
