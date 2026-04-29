import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { CategoriaTicketFormDialogComponent, CategoriaTicketFormDialogData } from './categoria-ticket-form-dialog.component';
import { CategoriaTicketListComponent } from './categoria-ticket-list.component';
import { CategoriaTicket, CategoriaTicketRequest } from './categoria-ticket.models';
import { CategoriaTicketService } from './categoria-ticket.service';

@Component({
  selector: 'app-categoria-ticket-page',
  imports: [CategoriaTicketListComponent],
  templateUrl: './categoria-ticket.page.html'
})
export class CategoriaTicketPage {
  private readonly categoriaTicketService = inject(CategoriaTicketService);
  private readonly dialog = inject(MatDialog);

  readonly categorias = signal<CategoriaTicket[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly incluirInactivos = signal(false);
  readonly pagina = signal(1);
  readonly tamanoPagina = signal(5);
  readonly totalRegistros = signal(0);
  readonly totalPaginas = signal(0);

  constructor() {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.categoriaTicketService
      .getAll(this.incluirInactivos(), this.pagina(), this.tamanoPagina())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (resultado) => {
          this.categorias.set(resultado.datos);
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
    this.loadCategorias();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPaginas() || page === this.pagina()) {
      return;
    }

    this.pagina.set(page);
    this.loadCategorias();
  }

  changePageSize(size: number): void {
    this.tamanoPagina.set(size);
    this.pagina.set(1);
    this.loadCategorias();
  }

  openCreateModal(): void {
    this.openFormModal({
      mode: 'create'
    });
  }

  openEditModal(categoria: CategoriaTicket): void {
    this.openFormModal({
      mode: 'edit',
      categoria
    });
  }

  openDeleteModal(categoria: CategoriaTicket): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar categoría',
        message: `La categoría "${categoria.nombre}" quedará inactiva y no aparecerá en el listado principal.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteCategoria(categoria);
      }
    });
  }

  private openFormModal(data: CategoriaTicketFormDialogData): void {
    const dialogRef = this.dialog.open<CategoriaTicketFormDialogComponent, CategoriaTicketFormDialogData, CategoriaTicketRequest>(
      CategoriaTicketFormDialogComponent,
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

      if (data.mode === 'edit' && data.categoria) {
        this.updateCategoria(data.categoria.idCategoriaTicket, request);
        return;
      }

      this.createCategoria(request);
    });
  }

  private createCategoria(request: CategoriaTicketRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.categoriaTicketService
      .create(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.pagina.set(1);
          this.loadCategorias();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private updateCategoria(id: number, request: CategoriaTicketRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.categoriaTicketService
      .update(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.loadCategorias(),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private deleteCategoria(categoria: CategoriaTicket): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.categoriaTicketService
      .delete(categoria.idCategoriaTicket)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.categorias().length === 1 && this.pagina() > 1) {
            this.pagina.update((page) => page - 1);
          }

          this.loadCategorias();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con la API.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Tu sesión no tiene permisos para administrar categorías.';
    }

    if (error.status === 400) {
      return 'La API rechazó la operación. Revisa si el nombre ya existe o si faltan datos.';
    }

    return 'Ocurrió un error al procesar la operación.';
  }
}
