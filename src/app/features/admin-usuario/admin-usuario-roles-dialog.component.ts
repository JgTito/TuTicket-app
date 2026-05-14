import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminUsuario, ActualizarRolesUsuarioRequest, RolUsuario } from './admin-usuario.models';

export interface AdminUsuarioRolesDialogData {
  usuario: AdminUsuario;
  roles: RolUsuario[];
  currentUserId: string | null;
}

@Component({
  selector: 'app-admin-usuario-roles-dialog',
  templateUrl: './admin-usuario-roles-dialog.component.html'
})
export class AdminUsuarioRolesDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AdminUsuarioRolesDialogComponent, ActualizarRolesUsuarioRequest>);
  readonly data = inject<AdminUsuarioRolesDialogData>(MAT_DIALOG_DATA);
  readonly selectedRoles = signal<string[]>([...this.data.usuario.roles]);
  readonly touched = signal(false);

  isOwnUser(): boolean {
    return this.data.currentUserId === this.data.usuario.id;
  }

  roleSelected(role: string): boolean {
    return this.selectedRoles().includes(role);
  }

  toggleRole(role: string): void {
    this.touched.set(true);

    if (this.isOwnUser() && role === 'Administrador' && this.roleSelected(role)) {
      return;
    }

    this.selectedRoles.update((roles) =>
      roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role]
    );
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.touched.set(true);
    if (this.selectedRoles().length === 0) return;

    this.dialogRef.close({ roles: this.selectedRoles() });
  }
}
