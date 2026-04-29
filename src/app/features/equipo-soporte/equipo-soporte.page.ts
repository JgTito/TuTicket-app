import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { EquipoSoporteCategoriaFormDialogComponent, EquipoSoporteCategoriaFormDialogData } from './equipo-soporte-categoria-form-dialog.component';
import { EquipoSoporteCategoriaListComponent } from './equipo-soporte-categoria-list.component';
import { EquipoSoporteFormDialogComponent, EquipoSoporteFormDialogData } from './equipo-soporte-form-dialog.component';
import { EquipoSoporteListComponent } from './equipo-soporte-list.component';
import {
  CategoriaEquipoSoporte,
  CategoriaEquipoSoporteRequest,
  CategoriaTicketSelect,
  EquipoSoporte,
  EquipoSoporteRequest,
  EquipoSoporteUsuario,
  EquipoSoporteUsuarioRequest,
  UsuarioSelect
} from './equipo-soporte.models';
import { EquipoSoporteService } from './equipo-soporte.service';
import { EquipoSoporteUsuarioFormDialogComponent, EquipoSoporteUsuarioFormDialogData } from './equipo-soporte-usuario-form-dialog.component';
import { EquipoSoporteUsuarioListComponent } from './equipo-soporte-usuario-list.component';

@Component({
  selector: 'app-equipo-soporte-page',
  imports: [EquipoSoporteListComponent, EquipoSoporteCategoriaListComponent, EquipoSoporteUsuarioListComponent],
  templateUrl: './equipo-soporte.page.html'
})
export class EquipoSoportePage {
  private readonly equipoSoporteService = inject(EquipoSoporteService);
  private readonly dialog = inject(MatDialog);

  readonly equipos = signal<EquipoSoporte[]>([]);
  readonly categoriasEquipo = signal<CategoriaEquipoSoporte[]>([]);
  readonly integrantes = signal<EquipoSoporteUsuario[]>([]);
  readonly categorias = signal<CategoriaTicketSelect[]>([]);
  readonly usuarios = signal<UsuarioSelect[]>([]);
  readonly selectedEquipo = signal<EquipoSoporte | null>(null);
  readonly loadingEquipos = signal(true);
  readonly loadingCategoriasEquipo = signal(false);
  readonly loadingIntegrantes = signal(false);
  readonly loadingCategorias = signal(true);
  readonly loadingUsuarios = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly incluirEquiposInactivos = signal(false);
  readonly incluirCategoriasEquipoInactivas = signal(false);
  readonly incluirIntegrantesInactivos = signal(false);
  readonly equiposPagina = signal(1);
  readonly equiposTamanoPagina = signal(5);
  readonly equiposTotalRegistros = signal(0);
  readonly equiposTotalPaginas = signal(0);
  readonly categoriasEquipoPagina = signal(1);
  readonly categoriasEquipoTamanoPagina = signal(5);
  readonly categoriasEquipoTotalRegistros = signal(0);
  readonly categoriasEquipoTotalPaginas = signal(0);
  readonly integrantesPagina = signal(1);
  readonly integrantesTamanoPagina = signal(5);
  readonly integrantesTotalRegistros = signal(0);
  readonly integrantesTotalPaginas = signal(0);

  constructor() {
    this.loadCategorias();
    this.loadUsuarios();
    this.loadEquipos();
  }

  loadCategorias(): void {
    this.loadingCategorias.set(true);

    this.equipoSoporteService
      .getCategoriasSelect(false)
      .pipe(finalize(() => this.loadingCategorias.set(false)))
      .subscribe({
        next: (categorias) => this.categorias.set(categorias ?? []),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadUsuarios(): void {
    this.loadingUsuarios.set(true);

    this.equipoSoporteService
      .getUsuariosSelect(false)
      .pipe(finalize(() => this.loadingUsuarios.set(false)))
      .subscribe({
        next: (usuarios) => this.usuarios.set(usuarios),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadEquipos(): void {
    this.loadingEquipos.set(true);
    this.errorMessage.set(null);

    this.equipoSoporteService
      .getEquipos(this.incluirEquiposInactivos(), this.equiposPagina(), this.equiposTamanoPagina())
      .pipe(finalize(() => this.loadingEquipos.set(false)))
      .subscribe({
        next: (resultado) => {
          const response = resultado as typeof resultado & {
            Datos?: unknown[];
            Pagina?: number;
            TamanoPagina?: number;
            TotalRegistros?: number;
            TotalPaginas?: number;
          };
          const datos = (response.datos ?? response.Datos ?? []).map((equipo) => this.normalizeEquipo(equipo));

          this.equipos.set(datos);
          this.equiposPagina.set(response.pagina ?? response.Pagina ?? this.equiposPagina());
          this.equiposTamanoPagina.set(response.tamanoPagina ?? response.TamanoPagina ?? this.equiposTamanoPagina());
          this.equiposTotalRegistros.set(response.totalRegistros ?? response.TotalRegistros ?? 0);
          this.equiposTotalPaginas.set(response.totalPaginas ?? response.TotalPaginas ?? 0);
          this.syncSelectedEquipo(datos);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadIntegrantes(): void {
    const equipo = this.selectedEquipo();

    if (!equipo) {
      this.integrantes.set([]);
      this.integrantesTotalRegistros.set(0);
      this.integrantesTotalPaginas.set(0);
      return;
    }

    this.loadingIntegrantes.set(true);
    this.errorMessage.set(null);

    this.equipoSoporteService
      .getIntegrantes(
        equipo.idEquipoSoporte,
        this.incluirIntegrantesInactivos(),
        this.integrantesPagina(),
        this.integrantesTamanoPagina()
      )
      .pipe(finalize(() => this.loadingIntegrantes.set(false)))
      .subscribe({
        next: (resultado) => {
          const response = resultado as typeof resultado & {
            Datos?: unknown[];
            Pagina?: number;
            TamanoPagina?: number;
            TotalRegistros?: number;
            TotalPaginas?: number;
          };
          const datos = (response.datos ?? response.Datos ?? []).map((integrante) => this.normalizeIntegrante(integrante));

          this.integrantes.set(datos);
          this.integrantesPagina.set(response.pagina ?? response.Pagina ?? this.integrantesPagina());
          this.integrantesTamanoPagina.set(response.tamanoPagina ?? response.TamanoPagina ?? this.integrantesTamanoPagina());
          this.integrantesTotalRegistros.set(response.totalRegistros ?? response.TotalRegistros ?? 0);
          this.integrantesTotalPaginas.set(response.totalPaginas ?? response.TotalPaginas ?? 0);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadCategoriasEquipo(): void {
    const equipo = this.selectedEquipo();

    if (!equipo) {
      this.categoriasEquipo.set([]);
      this.categoriasEquipoTotalRegistros.set(0);
      this.categoriasEquipoTotalPaginas.set(0);
      return;
    }

    this.loadingCategoriasEquipo.set(true);
    this.errorMessage.set(null);

    this.equipoSoporteService
      .getCategoriasEquipo(
        equipo.idEquipoSoporte,
        this.incluirCategoriasEquipoInactivas(),
        this.categoriasEquipoPagina(),
        this.categoriasEquipoTamanoPagina()
      )
      .pipe(finalize(() => this.loadingCategoriasEquipo.set(false)))
      .subscribe({
        next: (resultado) => {
          const response = resultado as typeof resultado & {
            Datos?: unknown[];
            Pagina?: number;
            TamanoPagina?: number;
            TotalRegistros?: number;
            TotalPaginas?: number;
          };
          const datos = (response.datos ?? response.Datos ?? []).map((categoriaEquipo) => this.normalizeCategoriaEquipo(categoriaEquipo));

          this.categoriasEquipo.set(datos);
          this.categoriasEquipoPagina.set(response.pagina ?? response.Pagina ?? this.categoriasEquipoPagina());
          this.categoriasEquipoTamanoPagina.set(response.tamanoPagina ?? response.TamanoPagina ?? this.categoriasEquipoTamanoPagina());
          this.categoriasEquipoTotalRegistros.set(response.totalRegistros ?? response.TotalRegistros ?? 0);
          this.categoriasEquipoTotalPaginas.set(response.totalPaginas ?? response.TotalPaginas ?? 0);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  selectEquipo(equipo: EquipoSoporte): void {
    this.selectedEquipo.set(equipo);
    this.categoriasEquipoPagina.set(1);
    this.loadCategoriasEquipo();
    this.integrantesPagina.set(1);
    this.loadIntegrantes();
  }

  toggleEquiposInactivos(): void {
    this.incluirEquiposInactivos.update((value) => !value);
    this.equiposPagina.set(1);
    this.loadEquipos();
  }

  changeEquiposPage(page: number): void {
    if (page < 1 || page > this.equiposTotalPaginas() || page === this.equiposPagina()) {
      return;
    }

    this.equiposPagina.set(page);
    this.loadEquipos();
  }

  changeEquiposPageSize(size: number): void {
    this.equiposTamanoPagina.set(size);
    this.equiposPagina.set(1);
    this.loadEquipos();
  }

  toggleCategoriasEquipoInactivas(): void {
    this.incluirCategoriasEquipoInactivas.update((value) => !value);
    this.categoriasEquipoPagina.set(1);
    this.loadCategoriasEquipo();
  }

  changeCategoriasEquipoPage(page: number): void {
    if (page < 1 || page > this.categoriasEquipoTotalPaginas() || page === this.categoriasEquipoPagina()) {
      return;
    }

    this.categoriasEquipoPagina.set(page);
    this.loadCategoriasEquipo();
  }

  changeCategoriasEquipoPageSize(size: number): void {
    this.categoriasEquipoTamanoPagina.set(size);
    this.categoriasEquipoPagina.set(1);
    this.loadCategoriasEquipo();
  }

  toggleIntegrantesInactivos(): void {
    this.incluirIntegrantesInactivos.update((value) => !value);
    this.integrantesPagina.set(1);
    this.loadIntegrantes();
  }

  changeIntegrantesPage(page: number): void {
    if (page < 1 || page > this.integrantesTotalPaginas() || page === this.integrantesPagina()) {
      return;
    }

    this.integrantesPagina.set(page);
    this.loadIntegrantes();
  }

  changeIntegrantesPageSize(size: number): void {
    this.integrantesTamanoPagina.set(size);
    this.integrantesPagina.set(1);
    this.loadIntegrantes();
  }

  openCreateEquipoModal(): void {
    this.openEquipoFormModal({
      mode: 'create'
    });
  }

  openEditEquipoModal(equipo: EquipoSoporte): void {
    this.openEquipoFormModal({
      mode: 'edit',
      equipo
    });
  }

  openDeleteEquipoModal(equipo: EquipoSoporte): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar equipo',
        message: `El equipo "${equipo.nombre}" quedara inactivo. Sus integrantes no se eliminan automaticamente.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteEquipo(equipo);
      }
    });
  }

  openCreateCategoriaEquipoModal(): void {
    const equipo = this.selectedEquipo();

    if (!equipo) {
      return;
    }

    this.openCategoriaEquipoFormModal({
      mode: 'create',
      equipo,
      categorias: this.categorias()
    });
  }

  openEditCategoriaEquipoModal(categoriaEquipo: CategoriaEquipoSoporte): void {
    const equipo = this.selectedEquipo();

    if (!equipo) {
      return;
    }

    this.openCategoriaEquipoFormModal({
      mode: 'edit',
      equipo,
      categoriaEquipo,
      categorias: this.categorias()
    });
  }

  openDeleteCategoriaEquipoModal(categoriaEquipo: CategoriaEquipoSoporte): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Quitar categoria',
        message: `La categoria "${categoriaEquipo.nombreCategoriaTicket}" quedara inactiva para el equipo "${categoriaEquipo.nombreEquipoSoporte}".`,
        confirmText: 'Quitar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteCategoriaEquipo(categoriaEquipo);
      }
    });
  }

  openCreateIntegranteModal(): void {
    const equipo = this.selectedEquipo();

    if (!equipo) {
      return;
    }

    this.openIntegranteFormModal({
      mode: 'create',
      equipo,
      usuarios: this.usuarios()
    });
  }

  openEditIntegranteModal(integrante: EquipoSoporteUsuario): void {
    const equipo = this.selectedEquipo();

    if (!equipo) {
      return;
    }

    this.openIntegranteFormModal({
      mode: 'edit',
      equipo,
      integrante,
      usuarios: this.usuarios()
    });
  }

  openDeleteIntegranteModal(integrante: EquipoSoporteUsuario): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Quitar integrante',
        message: `${integrante.nombreUsuario} quedara inactivo dentro del equipo "${integrante.nombreEquipoSoporte}".`,
        confirmText: 'Quitar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteIntegrante(integrante);
      }
    });
  }

  private openEquipoFormModal(data: EquipoSoporteFormDialogData): void {
    const dialogRef = this.dialog.open<EquipoSoporteFormDialogComponent, EquipoSoporteFormDialogData, EquipoSoporteRequest>(
      EquipoSoporteFormDialogComponent,
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

      if (data.mode === 'edit' && data.equipo) {
        this.updateEquipo(data.equipo.idEquipoSoporte, request);
        return;
      }

      this.createEquipo(request);
    });
  }

  private openIntegranteFormModal(data: EquipoSoporteUsuarioFormDialogData): void {
    const dialogRef = this.dialog.open<EquipoSoporteUsuarioFormDialogComponent, EquipoSoporteUsuarioFormDialogData, EquipoSoporteUsuarioRequest>(
      EquipoSoporteUsuarioFormDialogComponent,
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

      if (data.mode === 'edit' && data.integrante) {
        this.updateIntegrante(data.integrante.idEquipoSoporteUsuario, request);
        return;
      }

      this.createIntegrante(request);
    });
  }

  private openCategoriaEquipoFormModal(data: EquipoSoporteCategoriaFormDialogData): void {
    const dialogRef = this.dialog.open<
      EquipoSoporteCategoriaFormDialogComponent,
      EquipoSoporteCategoriaFormDialogData,
      CategoriaEquipoSoporteRequest
    >(EquipoSoporteCategoriaFormDialogComponent, {
      width: '560px',
      data,
      disableClose: this.saving()
    });

    dialogRef.afterClosed().subscribe((request) => {
      if (!request) {
        return;
      }

      if (data.mode === 'edit' && data.categoriaEquipo) {
        this.updateCategoriaEquipo(data.categoriaEquipo.idCategoriaEquipoSoporte, request);
        return;
      }

      this.createCategoriaEquipo(request);
    });
  }

  private createEquipo(request: EquipoSoporteRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.equipoSoporteService
      .createEquipo(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (equipo) => {
          this.selectedEquipo.set(this.normalizeEquipo(equipo));
          this.equiposPagina.set(1);
          this.loadEquipos();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private updateEquipo(id: number, request: EquipoSoporteRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.equipoSoporteService
      .updateEquipo(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.loadEquipos(),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private deleteEquipo(equipo: EquipoSoporte): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.equipoSoporteService
      .deleteEquipo(equipo.idEquipoSoporte)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.equipos().length === 1 && this.equiposPagina() > 1) {
            this.equiposPagina.update((page) => page - 1);
          }

          this.loadEquipos();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private createCategoriaEquipo(request: CategoriaEquipoSoporteRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.equipoSoporteService
      .createCategoriaEquipo(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.categoriasEquipoPagina.set(1);
          this.loadCategoriasEquipo();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private updateCategoriaEquipo(id: number, request: CategoriaEquipoSoporteRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.equipoSoporteService
      .updateCategoriaEquipo(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.loadCategoriasEquipo(),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private deleteCategoriaEquipo(categoriaEquipo: CategoriaEquipoSoporte): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.equipoSoporteService
      .deleteCategoriaEquipo(categoriaEquipo.idCategoriaEquipoSoporte)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.categoriasEquipo().length === 1 && this.categoriasEquipoPagina() > 1) {
            this.categoriasEquipoPagina.update((page) => page - 1);
          }

          this.loadCategoriasEquipo();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private createIntegrante(request: EquipoSoporteUsuarioRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.equipoSoporteService
      .createIntegrante(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.integrantesPagina.set(1);
          this.loadIntegrantes();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private updateIntegrante(id: number, request: EquipoSoporteUsuarioRequest): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.equipoSoporteService
      .updateIntegrante(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.loadIntegrantes(),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private deleteIntegrante(integrante: EquipoSoporteUsuario): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.equipoSoporteService
      .deleteIntegrante(integrante.idEquipoSoporteUsuario)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.integrantes().length === 1 && this.integrantesPagina() > 1) {
            this.integrantesPagina.update((page) => page - 1);
          }

          this.loadIntegrantes();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private syncSelectedEquipo(equipos: EquipoSoporte[]): void {
    const selected = this.selectedEquipo();

    if (selected) {
      const current = equipos.find((equipo) => equipo.idEquipoSoporte === selected.idEquipoSoporte);

      if (current) {
        this.selectedEquipo.set(current);
        this.loadCategoriasEquipo();
        this.loadIntegrantes();
        return;
      }
    }

    this.selectedEquipo.set(equipos[0] ?? null);
    this.loadCategoriasEquipo();
    this.loadIntegrantes();
  }

  private normalizeEquipo(value: unknown): EquipoSoporte {
    const item = value as Partial<EquipoSoporte> & {
      IdEquipoSoporte?: number;
      Nombre?: string;
      Descripcion?: string | null;
      Activo?: boolean;
      FechaCreacion?: string;
    };

    return {
      idEquipoSoporte: item.idEquipoSoporte ?? item.IdEquipoSoporte ?? 0,
      nombre: item.nombre ?? item.Nombre ?? '',
      descripcion: item.descripcion ?? item.Descripcion ?? null,
      activo: item.activo ?? item.Activo ?? false,
      fechaCreacion: item.fechaCreacion ?? item.FechaCreacion ?? ''
    };
  }

  private normalizeIntegrante(value: unknown): EquipoSoporteUsuario {
    const item = value as Partial<EquipoSoporteUsuario> & {
      IdEquipoSoporteUsuario?: number;
      IdEquipoSoporte?: number;
      NombreEquipoSoporte?: string;
      IdUsuario?: string;
      NombreUsuario?: string;
      EmailUsuario?: string | null;
      EsLider?: boolean;
      Activo?: boolean;
      FechaCreacion?: string;
    };

    return {
      idEquipoSoporteUsuario: item.idEquipoSoporteUsuario ?? item.IdEquipoSoporteUsuario ?? 0,
      idEquipoSoporte: item.idEquipoSoporte ?? item.IdEquipoSoporte ?? 0,
      nombreEquipoSoporte: item.nombreEquipoSoporte ?? item.NombreEquipoSoporte ?? '',
      idUsuario: item.idUsuario ?? item.IdUsuario ?? '',
      nombreUsuario: item.nombreUsuario ?? item.NombreUsuario ?? '',
      emailUsuario: item.emailUsuario ?? item.EmailUsuario ?? null,
      esLider: item.esLider ?? item.EsLider ?? false,
      activo: item.activo ?? item.Activo ?? false,
      fechaCreacion: item.fechaCreacion ?? item.FechaCreacion ?? ''
    };
  }

  private normalizeCategoriaEquipo(value: unknown): CategoriaEquipoSoporte {
    const item = value as Partial<CategoriaEquipoSoporte> & {
      IdCategoriaEquipoSoporte?: number;
      IdCategoriaTicket?: number;
      NombreCategoriaTicket?: string;
      IdEquipoSoporte?: number;
      NombreEquipoSoporte?: string;
      Activo?: boolean;
    };

    return {
      idCategoriaEquipoSoporte: item.idCategoriaEquipoSoporte ?? item.IdCategoriaEquipoSoporte ?? 0,
      idCategoriaTicket: item.idCategoriaTicket ?? item.IdCategoriaTicket ?? 0,
      nombreCategoriaTicket: item.nombreCategoriaTicket ?? item.NombreCategoriaTicket ?? '',
      idEquipoSoporte: item.idEquipoSoporte ?? item.IdEquipoSoporte ?? 0,
      nombreEquipoSoporte: item.nombreEquipoSoporte ?? item.NombreEquipoSoporte ?? '',
      activo: item.activo ?? item.Activo ?? false
    };
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con la API.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Tu sesion no tiene permisos para administrar equipos.';
    }

    if (error.status === 400) {
      return 'La API rechazo la operacion. Revisa duplicados o referencias inactivas.';
    }

    return 'Ocurrio un error al procesar la operacion.';
  }
}
