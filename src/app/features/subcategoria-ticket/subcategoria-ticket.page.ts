import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { SubcategoriaTicketFormDialogComponent, SubcategoriaTicketFormDialogData } from './subcategoria-ticket-form-dialog.component';
import { SubcategoriaTicketListComponent } from './subcategoria-ticket-list.component';
import { CategoriaTicketSelect, SubcategoriaTicket, SubcategoriaTicketRequest } from './subcategoria-ticket.models';
import { SubcategoriaTicketService } from './subcategoria-ticket.service';

@Component({
  selector: 'app-subcategoria-ticket-page',
  imports: [SubcategoriaTicketListComponent],
  templateUrl: './subcategoria-ticket.page.html'
})
export class SubcategoriaTicketPage {
  private readonly subcategoriaTicketService = inject(SubcategoriaTicketService);
  private readonly dialog = inject(MatDialog);

  readonly subcategorias = signal<SubcategoriaTicket[]>([]);
  readonly categorias = signal<CategoriaTicketSelect[]>([]);
  readonly selectedCategoriaId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly loadingCategorias = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly incluirInactivos = signal(false);
  readonly pagina = signal(1);
  readonly tamanoPagina = signal(5);
  readonly totalRegistros = signal(0);
  readonly totalPaginas = signal(0);

  constructor() {
    this.loadCategorias();
    this.loadSubcategorias();
  }

  loadCategorias(): void {
    this.loadingCategorias.set(true);

    this.subcategoriaTicketService
      .getCategoriasSelect(false)
      .pipe(finalize(() => this.loadingCategorias.set(false)))
      .subscribe({
        next: (categorias) => this.categorias.set(categorias),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadSubcategorias(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.subcategoriaTicketService
      .getAll(this.incluirInactivos(), this.pagina(), this.tamanoPagina(), this.selectedCategoriaId())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (resultado) => {
          this.subcategorias.set(resultado.datos);
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
    this.loadSubcategorias();
  }

  changeCategoriaFilter(idCategoriaTicket: number | null): void {
    this.selectedCategoriaId.set(idCategoriaTicket);
    this.pagina.set(1);
    this.loadSubcategorias();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPaginas() || page === this.pagina()) {
      return;
    }

    this.pagina.set(page);
    this.loadSubcategorias();
  }

  changePageSize(size: number): void {
    this.tamanoPagina.set(size);
    this.pagina.set(1);
    this.loadSubcategorias();
  }

  openCreateModal(): void {
    this.openFormModal({
      mode: 'create',
      categorias: this.categorias()
    });
  }

  openEditModal(subcategoria: SubcategoriaTicket): void {
    this.openFormModal({
      mode: 'edit',
      subcategoria,
      categorias: this.categorias()
    });
  }

  openDeleteModal(subcategoria: SubcategoriaTicket): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar subcategoria',
        message: `La subcategoria "${subcategoria.nombre}" quedara inactiva y no aparecera en el listado principal.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteSubcategoria(subcategoria);
      }
    });
  }

  private openFormModal(data: SubcategoriaTicketFormDialogData): void {
    const dialogRef = this.dialog.open<SubcategoriaTicketFormDialogComponent, SubcategoriaTicketFormDialogData, SubcategoriaTicketRequest>(
      SubcategoriaTicketFormDialogComponent,
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

      if (data.mode === 'edit' && data.subcategoria) {
        this.updateSubcategoria(data.subcategoria.idSubcategoriaTicket, request);
        return;
      }

      this.createSubcategoria(request);
    });
  }

  private createSubcategoria(request: SubcategoriaTicketRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.subcategoriaTicketService
      .create(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.pagina.set(1);
          this.loadSubcategorias();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private updateSubcategoria(id: number, request: SubcategoriaTicketRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.subcategoriaTicketService
      .update(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.loadSubcategorias(),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private deleteSubcategoria(subcategoria: SubcategoriaTicket): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.subcategoriaTicketService
      .delete(subcategoria.idSubcategoriaTicket)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.subcategorias().length === 1 && this.pagina() > 1) {
            this.pagina.update((page) => page - 1);
          }

          this.loadSubcategorias();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con la API.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Tu sesion no tiene permisos para administrar subcategorias.';
    }

    if (error.status === 400) {
      return 'La API rechazo la operacion. Revisa si el nombre ya existe para la categoria seleccionada.';
    }

    return 'Ocurrio un error al procesar la operacion.';
  }
}
