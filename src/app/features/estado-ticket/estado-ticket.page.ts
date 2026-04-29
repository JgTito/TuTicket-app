import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { EstadoTicketFormDialogComponent, EstadoTicketFormDialogData } from './estado-ticket-form-dialog.component';
import { EstadoTicketListComponent } from './estado-ticket-list.component';
import { EstadoTicket, EstadoTicketRequest } from './estado-ticket.models';
import { EstadoTicketService } from './estado-ticket.service';

@Component({
  selector: 'app-estado-ticket-page',
  imports: [EstadoTicketListComponent],
  templateUrl: './estado-ticket.page.html'
})
export class EstadoTicketPage {
  private readonly estadoTicketService = inject(EstadoTicketService);
  private readonly dialog = inject(MatDialog);

  readonly estados = signal<EstadoTicket[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly incluirInactivos = signal(false);
  readonly pagina = signal(1);
  readonly tamanoPagina = signal(5);
  readonly totalRegistros = signal(0);
  readonly totalPaginas = signal(0);

  constructor() {
    this.loadEstados();
  }

  loadEstados(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.estadoTicketService
      .getAll(this.incluirInactivos(), this.pagina(), this.tamanoPagina())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (resultado) => {
          this.estados.set(resultado.datos);
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
    this.loadEstados();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPaginas() || page === this.pagina()) {
      return;
    }

    this.pagina.set(page);
    this.loadEstados();
  }

  changePageSize(size: number): void {
    this.tamanoPagina.set(size);
    this.pagina.set(1);
    this.loadEstados();
  }

  openCreateModal(): void {
    this.openFormModal({
      mode: 'create'
    });
  }

  openEditModal(estado: EstadoTicket): void {
    this.openFormModal({
      mode: 'edit',
      estado
    });
  }

  openDeleteModal(estado: EstadoTicket): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar estado',
        message: `El estado "${estado.nombre}" quedará inactivo y no aparecerá en el listado principal.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteEstado(estado);
      }
    });
  }

  private openFormModal(data: EstadoTicketFormDialogData): void {
    const dialogRef = this.dialog.open<EstadoTicketFormDialogComponent, EstadoTicketFormDialogData, EstadoTicketRequest>(
      EstadoTicketFormDialogComponent,
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

      if (data.mode === 'edit' && data.estado) {
        this.updateEstado(data.estado.idEstadoTicket, request);
        return;
      }

      this.createEstado(request);
    });
  }

  private createEstado(request: EstadoTicketRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.estadoTicketService
      .create(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.pagina.set(1);
          this.loadEstados();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private updateEstado(id: number, request: EstadoTicketRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.estadoTicketService
      .update(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.loadEstados(),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private deleteEstado(estado: EstadoTicket): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.estadoTicketService
      .delete(estado.idEstadoTicket)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.estados().length === 1 && this.pagina() > 1) {
            this.pagina.update((page) => page - 1);
          }

          this.loadEstados();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con la API.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Tu sesión no tiene permisos para administrar estados.';
    }

    if (error.status === 400) {
      return 'La API rechazó la operación. Revisa si el nombre ya existe o si faltan datos.';
    }

    return 'Ocurrió un error al procesar la operación.';
  }
}
