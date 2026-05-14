import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminUsuario, ResetPasswordUsuarioRequest } from './admin-usuario.models';

export interface AdminUsuarioResetPasswordDialogData {
  usuario: AdminUsuario;
}

@Component({
  selector: 'app-admin-usuario-reset-password-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-usuario-reset-password-dialog.component.html'
})
export class AdminUsuarioResetPasswordDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AdminUsuarioResetPasswordDialogComponent, ResetPasswordUsuarioRequest>);
  readonly data = inject<AdminUsuarioResetPasswordDialogData>(MAT_DIALOG_DATA);

  readonly form = this.formBuilder.nonNullable.group({
    nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', [Validators.required]]
  });

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid || !this.passwordsMatch()) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({ nuevaPassword: this.form.controls.nuevaPassword.value });
  }

  passwordsMatch(): boolean {
    return this.form.controls.nuevaPassword.value === this.form.controls.confirmarPassword.value;
  }
}
