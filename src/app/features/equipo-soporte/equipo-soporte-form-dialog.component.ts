import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EquipoSoporte, EquipoSoporteRequest } from './equipo-soporte.models';

export interface EquipoSoporteFormDialogData {
  mode: 'create' | 'edit';
  equipo?: EquipoSoporte;
}

@Component({
  selector: 'app-equipo-soporte-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './equipo-soporte-form-dialog.component.html'
})
export class EquipoSoporteFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EquipoSoporteFormDialogComponent, EquipoSoporteRequest>);
  readonly data = inject<EquipoSoporteFormDialogData>(MAT_DIALOG_DATA);

  readonly title = this.data.mode === 'edit' ? 'Editar equipo' : 'Nuevo equipo';
  readonly submitText = this.data.mode === 'edit' ? 'Guardar cambios' : 'Crear equipo';

  readonly form = this.formBuilder.nonNullable.group({
    nombre: [this.data.equipo?.nombre ?? '', [Validators.required, Validators.maxLength(150)]],
    descripcion: [this.data.equipo?.descripcion ?? '', [Validators.maxLength(300)]],
    activo: [this.data.equipo?.activo ?? true]
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
      nombre: value.nombre.trim(),
      descripcion: value.descripcion.trim() ? value.descripcion.trim() : null,
      activo: value.activo
    });
  }
}
