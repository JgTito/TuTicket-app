import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ActualizarAdminUsuarioRequest,
  AdminUsuario,
  CrearAdminUsuarioRequest,
  RolUsuario
} from './admin-usuario.models';

export interface AdminUsuarioFormDialogData {
  mode: 'create' | 'edit';
  usuario?: AdminUsuario;
  roles: RolUsuario[];
}

export type AdminUsuarioFormDialogResult = CrearAdminUsuarioRequest | ActualizarAdminUsuarioRequest;

@Component({
  selector: 'app-admin-usuario-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-usuario-form-dialog.component.html'
})
export class AdminUsuarioFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AdminUsuarioFormDialogComponent, AdminUsuarioFormDialogResult>);
  readonly data = inject<AdminUsuarioFormDialogData>(MAT_DIALOG_DATA);

  readonly title = this.data.mode === 'edit' ? 'Editar usuario' : 'Nuevo usuario';
  readonly submitText = this.data.mode === 'edit' ? 'Guardar cambios' : 'Crear usuario';
  readonly selectedRoles = signal<string[]>(this.getInitialRoles());
  readonly rolesTouched = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    nombreCompleto: [this.data.usuario?.nombreCompleto ?? '', [Validators.required, Validators.maxLength(150)]],
    email: [this.data.usuario?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(256)]],
    password: ['', this.data.mode === 'create' ? [Validators.required, Validators.minLength(6)] : []],
    activo: [this.data.usuario?.activo ?? true]
  });

  toggleRole(role: string): void {
    this.rolesTouched.set(true);
    this.selectedRoles.update((roles) =>
      roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role]
    );
  }

  roleSelected(role: string): boolean {
    return this.selectedRoles().includes(role);
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.rolesTouched.set(true);

    if (this.form.invalid || (this.data.mode === 'create' && this.selectedRoles().length === 0)) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (this.data.mode === 'edit') {
      this.dialogRef.close({
        nombreCompleto: value.nombreCompleto.trim(),
        email: value.email.trim(),
        activo: value.activo
      });
      return;
    }

    this.dialogRef.close({
      nombreCompleto: value.nombreCompleto.trim(),
      email: value.email.trim(),
      password: value.password,
      activo: value.activo,
      roles: this.selectedRoles()
    });
  }

  private getInitialRoles(): string[] {
    if (this.data.mode === 'edit') return this.data.usuario?.roles ?? [];

    const solicitante = this.data.roles.find((role) => role.nombre === 'Solicitante');
    return solicitante ? [solicitante.nombre] : [];
  }
}
