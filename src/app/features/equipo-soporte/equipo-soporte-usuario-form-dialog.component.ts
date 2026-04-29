import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  EquipoSoporte,
  EquipoSoporteUsuario,
  EquipoSoporteUsuarioRequest,
  UsuarioSelect
} from './equipo-soporte.models';

export interface EquipoSoporteUsuarioFormDialogData {
  mode: 'create' | 'edit';
  equipo: EquipoSoporte;
  usuarios: UsuarioSelect[];
  integrante?: EquipoSoporteUsuario;
}

@Component({
  selector: 'app-equipo-soporte-usuario-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './equipo-soporte-usuario-form-dialog.component.html'
})
export class EquipoSoporteUsuarioFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EquipoSoporteUsuarioFormDialogComponent, EquipoSoporteUsuarioRequest>);
  readonly data = inject<EquipoSoporteUsuarioFormDialogData>(MAT_DIALOG_DATA);

  readonly title = this.data.mode === 'edit' ? 'Editar integrante' : 'Agregar integrante';
  readonly submitText = this.data.mode === 'edit' ? 'Guardar cambios' : 'Agregar usuario';

  readonly form = this.formBuilder.nonNullable.group({
    idUsuario: [this.data.integrante?.idUsuario ?? '', [Validators.required]],
    esLider: [this.data.integrante?.esLider ?? false],
    activo: [this.data.integrante?.activo ?? true]
  });

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.dialogRef.close({
      idEquipoSoporte: this.data.equipo.idEquipoSoporte,
      idUsuario: value.idUsuario,
      esLider: value.esLider,
      activo: value.activo
    });
  }
}
