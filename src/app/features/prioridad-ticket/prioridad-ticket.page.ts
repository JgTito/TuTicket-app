import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { PrioridadTicketFormDialogComponent, PrioridadTicketFormDialogData } from './prioridad-ticket-form-dialog.component';
import { PrioridadTicketListComponent } from './prioridad-ticket-list.component';
import { PrioridadTicket, PrioridadTicketRequest } from './prioridad-ticket.models';
import { PrioridadTicketService } from './prioridad-ticket.service';

@Component({
  selector: 'app-prioridad-ticket-page',
  imports: [PrioridadTicketListComponent],
  templateUrl: './prioridad-ticket.page.html'
})
export class PrioridadTicketPage {
  private readonly prioridadTicketService = inject(PrioridadTicketService);
  private readonly dialog = inject(MatDialog);

  readonly prioridades = signal<PrioridadTicket[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly incluirInactivos = signal(false);
  readonly pagina = signal(1);
  readonly tamanoPagina = signal(5);
  readonly totalRegistros = signal(0);
  readonly totalPaginas = signal(0);

  constructor() {
    this.loadPrioridades();
  }

  loadPrioridades(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.prioridadTicketService
      .getAll(this.incluirInactivos(), this.pagina(), this.tamanoPagina())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (resultado) => {
          this.prioridades.set(resultado.datos);
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
    this.loadPrioridades();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPaginas() || page === this.pagina()) {
      return;
    }

    this.pagina.set(page);
    this.loadPrioridades();
  }

  changePageSize(size: number): void {
    this.tamanoPagina.set(size);
    this.pagina.set(1);
    this.loadPrioridades();
  }

  openCreateModal(): void {
    this.openFormModal({
      mode: 'create'
    });
  }

  openEditModal(prioridad: PrioridadTicket): void {
    this.openFormModal({
      mode: 'edit',
      prioridad
    });
  }

  openDeleteModal(prioridad: PrioridadTicket): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar prioridad',
        message: `La prioridad "${prioridad.nombre}" quedará inactiva y no aparecerá en el listado principal.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deletePrioridad(prioridad);
      }
    });
  }

  private openFormModal(data: PrioridadTicketFormDialogData): void {
    const dialogRef = this.dialog.open<PrioridadTicketFormDialogComponent, PrioridadTicketFormDialogData, PrioridadTicketRequest>(
      PrioridadTicketFormDialogComponent,
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

      if (data.mode === 'edit' && data.prioridad) {
        this.updatePrioridad(data.prioridad.idPrioridadTicket, request);
        return;
      }

      this.createPrioridad(request);
    });
  }

  private createPrioridad(request: PrioridadTicketRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.prioridadTicketService
      .create(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.pagina.set(1);
          this.loadPrioridades();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private updatePrioridad(id: number, request: PrioridadTicketRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.prioridadTicketService
      .update(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.loadPrioridades(),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private deletePrioridad(prioridad: PrioridadTicket): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.prioridadTicketService
      .delete(prioridad.idPrioridadTicket)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.prioridades().length === 1 && this.pagina() > 1) {
            this.pagina.update((page) => page - 1);
          }

          this.loadPrioridades();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con la API.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Tu sesión no tiene permisos para administrar prioridades.';
    }

    if (error.status === 400) {
      return 'La API rechazó la operación. Revisa si el nombre ya existe o si faltan datos.';
    }

    return 'Ocurrió un error al procesar la operación.';
  }
}
