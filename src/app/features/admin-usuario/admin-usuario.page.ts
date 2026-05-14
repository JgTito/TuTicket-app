import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import {
  ActualizarAdminUsuarioRequest,
  ActualizarRolesUsuarioRequest,
  AdminUsuario,
  AdminUsuarioFilters,
  CrearAdminUsuarioRequest,
  ResetPasswordUsuarioRequest,
  RolUsuario
} from './admin-usuario.models';
import { AdminUsuarioService } from './admin-usuario.service';
import {
  AdminUsuarioFormDialogComponent,
  AdminUsuarioFormDialogData,
  AdminUsuarioFormDialogResult
} from './admin-usuario-form-dialog.component';
import {
  AdminUsuarioResetPasswordDialogComponent,
  AdminUsuarioResetPasswordDialogData
} from './admin-usuario-reset-password-dialog.component';
import {
  AdminUsuarioRolesDialogComponent,
  AdminUsuarioRolesDialogData
} from './admin-usuario-roles-dialog.component';

@Component({
  selector: 'app-admin-usuario-page',
  templateUrl: './admin-usuario.page.html'
})
export class AdminUsuarioPage {
  private readonly adminUsuarioService = inject(AdminUsuarioService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly usuarios = signal<AdminUsuario[]>([]);
  readonly roles = signal<RolUsuario[]>([]);
  readonly loading = signal(true);
  readonly loadingRoles = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly filtroBuscar = signal('');
  readonly filtroActivo = signal<'todos' | 'activos' | 'inactivos'>('todos');
  readonly filtroRol = signal('');
  readonly pagina = signal(1);
  readonly tamanoPagina = signal(10);
  readonly totalRegistros = signal(0);
  readonly totalPaginas = signal(0);
  readonly pageSizeOptions = [5, 10, 25, 50, 100];

  constructor() {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading.set(true);
    this.loadingRoles.set(true);
    this.errorMessage.set(null);

    forkJoin({
      roles: this.adminUsuarioService.getRoles(),
      usuarios: this.adminUsuarioService.getUsuarios(this.buildFilters(), this.pagina(), this.tamanoPagina())
    })
      .pipe(finalize(() => {
        this.loading.set(false);
        this.loadingRoles.set(false);
      }))
      .subscribe({
        next: ({ roles, usuarios }) => {
          this.roles.set((roles ?? []).map((role) => this.normalizeRol(role)));
          this.setUsuariosResponse(usuarios);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadUsuarios(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.adminUsuarioService
      .getUsuarios(this.buildFilters(), this.pagina(), this.tamanoPagina())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.setUsuariosResponse(response),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  applyFilters(): void {
    this.pagina.set(1);
    this.loadUsuarios();
  }

  clearFilters(): void {
    this.filtroBuscar.set('');
    this.filtroActivo.set('todos');
    this.filtroRol.set('');
    this.pagina.set(1);
    this.loadUsuarios();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPaginas() || page === this.pagina()) return;
    this.pagina.set(page);
    this.loadUsuarios();
  }

  changePageSize(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.tamanoPagina.set(size);
    this.pagina.set(1);
    this.loadUsuarios();
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open<AdminUsuarioFormDialogComponent, AdminUsuarioFormDialogData, AdminUsuarioFormDialogResult>(
      AdminUsuarioFormDialogComponent,
      {
        width: '620px',
        data: { mode: 'create', roles: this.roles() },
        disableClose: this.saving()
      }
    );

    dialogRef.afterClosed().subscribe((request) => {
      if (request) this.createUsuario(request as CrearAdminUsuarioRequest);
    });
  }

  openEditModal(usuario: AdminUsuario): void {
    const dialogRef = this.dialog.open<AdminUsuarioFormDialogComponent, AdminUsuarioFormDialogData, AdminUsuarioFormDialogResult>(
      AdminUsuarioFormDialogComponent,
      {
        width: '620px',
        data: { mode: 'edit', usuario, roles: this.roles() },
        disableClose: this.saving()
      }
    );

    dialogRef.afterClosed().subscribe((request) => {
      if (request) this.updateUsuario(usuario.id, request as ActualizarAdminUsuarioRequest);
    });
  }

  openRolesModal(usuario: AdminUsuario): void {
    const dialogRef = this.dialog.open<AdminUsuarioRolesDialogComponent, AdminUsuarioRolesDialogData, ActualizarRolesUsuarioRequest>(
      AdminUsuarioRolesDialogComponent,
      {
        width: '560px',
        data: {
          usuario,
          roles: this.roles(),
          currentUserId: this.authService.currentUser()?.id ?? null
        },
        disableClose: this.saving()
      }
    );

    dialogRef.afterClosed().subscribe((request) => {
      if (request) this.updateRoles(usuario.id, request);
    });
  }

  openResetPasswordModal(usuario: AdminUsuario): void {
    const dialogRef = this.dialog.open<AdminUsuarioResetPasswordDialogComponent, AdminUsuarioResetPasswordDialogData, ResetPasswordUsuarioRequest>(
      AdminUsuarioResetPasswordDialogComponent,
      {
        width: '520px',
        data: { usuario },
        disableClose: this.saving()
      }
    );

    dialogRef.afterClosed().subscribe((request) => {
      if (request) this.resetPassword(usuario.id, request);
    });
  }

  openEstadoModal(usuario: AdminUsuario): void {
    const activar = !usuario.activo;
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      width: '440px',
      data: {
        title: activar ? 'Activar cuenta' : 'Desactivar cuenta',
        message: activar
          ? `La cuenta de ${usuario.nombreCompleto} quedara activa y podra iniciar sesion.`
          : `La cuenta de ${usuario.nombreCompleto} quedara inactiva y no podra iniciar sesion.`,
        confirmText: activar ? 'Activar' : 'Desactivar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.updateEstado(usuario.id, activar);
    });
  }

  isOwnUser(usuario: AdminUsuario): boolean {
    return this.authService.currentUser()?.id === usuario.id;
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

  private createUsuario(request: CrearAdminUsuarioRequest): void {
    this.saving.set(true);
    this.clearMessages();

    this.adminUsuarioService
      .create(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Usuario creado correctamente.');
          this.pagina.set(1);
          this.loadUsuarios();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private updateUsuario(id: string, request: ActualizarAdminUsuarioRequest): void {
    this.saving.set(true);
    this.clearMessages();

    this.adminUsuarioService
      .update(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Usuario actualizado correctamente.');
          this.loadUsuarios();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private updateEstado(id: string, activo: boolean): void {
    this.saving.set(true);
    this.clearMessages();

    this.adminUsuarioService
      .updateEstado(id, activo)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set(activo ? 'Cuenta activada correctamente.' : 'Cuenta desactivada correctamente.');
          this.loadUsuarios();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private updateRoles(id: string, request: ActualizarRolesUsuarioRequest): void {
    this.saving.set(true);
    this.clearMessages();

    this.adminUsuarioService
      .updateRoles(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Roles actualizados correctamente.');
          this.loadUsuarios();
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private resetPassword(id: string, request: ResetPasswordUsuarioRequest): void {
    this.saving.set(true);
    this.clearMessages();

    this.adminUsuarioService
      .resetPassword(id, request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.successMessage.set('Password reseteado correctamente.'),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  private setUsuariosResponse(resultado: unknown): void {
    const response = resultado as {
      datos?: unknown[];
      Datos?: unknown[];
      pagina?: number;
      Pagina?: number;
      tamanoPagina?: number;
      TamanoPagina?: number;
      totalRegistros?: number;
      TotalRegistros?: number;
      totalPaginas?: number;
      TotalPaginas?: number;
    };

    this.usuarios.set((response.datos ?? response.Datos ?? []).map((usuario) => this.normalizeUsuario(usuario)));
    this.pagina.set(response.pagina ?? response.Pagina ?? this.pagina());
    this.tamanoPagina.set(response.tamanoPagina ?? response.TamanoPagina ?? this.tamanoPagina());
    this.totalRegistros.set(response.totalRegistros ?? response.TotalRegistros ?? 0);
    this.totalPaginas.set(response.totalPaginas ?? response.TotalPaginas ?? 0);
  }

  private buildFilters(): AdminUsuarioFilters {
    return {
      buscar: this.filtroBuscar().trim() || null,
      activo: this.filtroActivo() === 'todos' ? null : this.filtroActivo() === 'activos',
      rol: this.filtroRol().trim() || null
    };
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private normalizeUsuario(value: unknown): AdminUsuario {
    const item = value as Record<string, unknown>;
    const rolesValue = item['roles'] ?? item['Roles'] ?? [];
    return {
      id: this.pickString(item, 'id', 'Id'),
      nombreCompleto: this.pickString(item, 'nombreCompleto', 'NombreCompleto'),
      email: this.pickNullableString(item, 'email', 'Email'),
      userName: this.pickNullableString(item, 'userName', 'UserName'),
      activo: this.pickBoolean(item, 'activo', 'Activo'),
      fechaCreacion: this.pickString(item, 'fechaCreacion', 'FechaCreacion'),
      roles: Array.isArray(rolesValue) ? rolesValue.map((role) => String(role)) : []
    };
  }

  private normalizeRol(value: unknown): RolUsuario {
    const item = value as Record<string, unknown>;
    return {
      id: this.pickString(item, 'id', 'Id'),
      nombre: this.pickString(item, 'nombre', 'Nombre')
    };
  }

  private pickString(item: Record<string, unknown>, camel: string, pascal: string): string {
    return String(item[camel] ?? item[pascal] ?? '');
  }

  private pickNullableString(item: Record<string, unknown>, camel: string, pascal: string): string | null {
    const value = item[camel] ?? item[pascal] ?? null;
    return value === null || value === undefined ? null : String(value);
  }

  private pickBoolean(item: Record<string, unknown>, camel: string, pascal: string): boolean {
    return Boolean(item[camel] ?? item[pascal] ?? false);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const backendMessage = this.extractBackendMessage(error);
    if (backendMessage) return backendMessage;
    if (error.status === 0) return 'No se pudo conectar con la API.';
    if (error.status === 401 || error.status === 403) return 'Tu sesion no tiene permisos para administrar usuarios.';
    if (error.status === 404) return 'No se encontro el usuario solicitado.';
    if (error.status === 400) return 'La API rechazo la operacion. Revisa datos, roles o restricciones de seguridad.';
    return 'Ocurrio un error al procesar la operacion.';
  }

  private extractBackendMessage(error: HttpErrorResponse): string | null {
    const body = error.error;

    if (typeof body === 'string') return body;
    if (!body || typeof body !== 'object') return null;

    const record = body as Record<string, unknown>;
    const errors = record['errors'] ?? record['Errors'];

    if (errors && typeof errors === 'object') {
      const messages = Object.values(errors as Record<string, unknown>).flatMap((value) =>
        Array.isArray(value) ? value.map((item) => String(item)) : [String(value)]
      );
      return messages.join(' ');
    }

    const title = record['title'] ?? record['Title'];
    return title ? String(title) : null;
  }
}
