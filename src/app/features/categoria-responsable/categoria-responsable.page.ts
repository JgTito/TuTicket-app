import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import {
  CategoriaResponsableFormDialogComponent,
  CategoriaResponsableFormDialogData
} from './categoria-responsable-form-dialog.component';
import { CategoriaResponsableListComponent } from './categoria-responsable-list.component';
import {
  CategoriaResponsable,
  CategoriaResponsableRequest,
  CategoriaTicketSelect,
  UsuarioSelect
} from './categoria-responsable.models';
import { CategoriaResponsableService } from './categoria-responsable.service';

@Component({
  selector: 'app-categoria-responsable-page',
  imports: [CategoriaResponsableListComponent],
  templateUrl: './categoria-responsable.page.html'
})
export class CategoriaResponsablePage {
  private readonly categoriaResponsableService = inject(CategoriaResponsableService);
  private readonly dialog = inject(MatDialog);

  readonly responsables = signal<CategoriaResponsable[]>([]);
  readonly categorias = signal<CategoriaTicketSelect[]>([]);
  readonly usuarios = signal<UsuarioSelect[]>([]);
  readonly loading = signal(true);
  readonly loadingCategorias = signal(true);
  readonly loadingUsuarios = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly incluirInactivos = signal(false);
  readonly pagina = signal(1);
  readonly tamanoPagina = signal(5);
  readonly totalRegistros = signal(0);
  readonly totalPaginas = signal(0);

  constructor() {
    this.loadCategorias();
    this.loadUsuarios();
    this.loadResponsables();
  }

  loadCategorias(): void {
    this.loadingCategorias.set(true);

    this.categoriaResponsableService
      .getCategoriasSelect(false)
      .pipe(finalize(() => this.loadingCategorias.set(false)))
      .subscribe({
        next: (categorias) => this.categorias.set(categorias ?? []),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadUsuarios(): void {
    this.loadingUsuarios.set(true);

    this.categoriaResponsableService
      .getUsuariosSelect(false)
      .pipe(finalize(() => this.loadingUsuarios.set(false)))
      .subscribe({
        next: (usuarios) => this.usuarios.set(usuarios ?? []),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadResponsables(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.categoriaResponsableService
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
          const datos = (response.datos ?? response.Datos ?? []).map((responsable) => this.normalizeResponsable(responsable));

          this.responsables.set(datos);
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
    this.loadResponsables();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPaginas() || page === this.pagina()) {
      return;
    }

    this.pagina.set(page);
    this.loadResponsables();
  }

  changePageSize(size: number): void {
    this.tamanoPagina.set(size);
    this.pagina.set(1);
    this.loadResponsables();
  }

  openCreateModal(): void {
    this.openFormModal({
      mode: 'create',
      categorias: this.categorias(),
      usuarios: this.usuarios()
    });
  }

  openEditModal(responsable: CategoriaResponsable): void {
    this.openFormModal({
      mode: 'edit',
      responsable,
      categorias: this.categorias(),
      usuarios: this.usuarios()
    });
  }

  openDeleteModal(responsable: CategoriaResponsable): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar responsable',
        message: `El responsable de "${responsable.nombreCategoriaTicket}" quedara inactivo.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteResponsable(responsable);
      }
    });
  }

  private openFormModal(data: CategoriaResponsableFormDialogData): void {
    const dialogRef = this.dialog.open<
      CategoriaResponsableFormDialogComponent,
      CategoriaResponsableFormDialogData,
      CategoriaResponsableRequest
    >(CategoriaResponsableFormDialogComponent, {
      width: '560px',
      data,
      disableClose: this.saving()
    });

    dialogRef.afterClosed().subscribe((request) => {
      if (!request) {
        return;
      }

      if (data.mode === 'edit' && data.responsable) {
        this.updateResponsable(data.responsable.idCategoriaResponsable, request);
        return;
      }

      this.createResponsable(request);
    });
  }

  private createResponsable(request: CategoriaResponsableRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.categoriaResponsableService
      .create(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.pagina.set(1);
          this.loadResponsables();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private updateResponsable(id: number, request: CategoriaResponsableRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.categoriaResponsableService
      .update(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.loadResponsables(),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private deleteResponsable(responsable: CategoriaResponsable): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.categoriaResponsableService
      .delete(responsable.idCategoriaResponsable)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.responsables().length === 1 && this.pagina() > 1) {
            this.pagina.update((page) => page - 1);
          }

          this.loadResponsables();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private normalizeResponsable(value: unknown): CategoriaResponsable {
    const item = value as Partial<CategoriaResponsable> & {
      IdCategoriaResponsable?: number;
      IdCategoriaTicket?: number;
      NombreCategoriaTicket?: string;
      IdUsuarioResponsable?: string;
      NombreUsuarioResponsable?: string;
      EmailUsuarioResponsable?: string | null;
      Activo?: boolean;
      FechaCreacion?: string;
    };

    return {
      idCategoriaResponsable: item.idCategoriaResponsable ?? item.IdCategoriaResponsable ?? 0,
      idCategoriaTicket: item.idCategoriaTicket ?? item.IdCategoriaTicket ?? 0,
      nombreCategoriaTicket: item.nombreCategoriaTicket ?? item.NombreCategoriaTicket ?? '',
      idUsuarioResponsable: item.idUsuarioResponsable ?? item.IdUsuarioResponsable ?? '',
      nombreUsuarioResponsable: item.nombreUsuarioResponsable ?? item.NombreUsuarioResponsable ?? '',
      emailUsuarioResponsable: item.emailUsuarioResponsable ?? item.EmailUsuarioResponsable ?? null,
      activo: item.activo ?? item.Activo ?? false,
      fechaCreacion: item.fechaCreacion ?? item.FechaCreacion ?? ''
    };
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con la API.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Tu sesion no tiene permisos para administrar responsables.';
    }

    if (error.status === 400) {
      return 'La API rechazo la operacion. Revisa si la categoria ya tiene un responsable activo o si las referencias estan inactivas.';
    }

    return 'Ocurrio un error al procesar la operacion.';
  }
}
