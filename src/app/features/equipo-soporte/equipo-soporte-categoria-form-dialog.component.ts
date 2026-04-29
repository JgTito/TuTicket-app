import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  CategoriaEquipoSoporte,
  CategoriaEquipoSoporteRequest,
  CategoriaTicketSelect,
  EquipoSoporte
} from './equipo-soporte.models';

export interface EquipoSoporteCategoriaFormDialogData {
  mode: 'create' | 'edit';
  equipo: EquipoSoporte;
  categorias: CategoriaTicketSelect[];
  categoriaEquipo?: CategoriaEquipoSoporte;
}

@Component({
  selector: 'app-equipo-soporte-categoria-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './equipo-soporte-categoria-form-dialog.component.html'
})
export class EquipoSoporteCategoriaFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EquipoSoporteCategoriaFormDialogComponent, CategoriaEquipoSoporteRequest>);
  readonly data = inject<EquipoSoporteCategoriaFormDialogData>(MAT_DIALOG_DATA);

  readonly title = this.data.mode === 'edit' ? 'Editar categoria del equipo' : 'Agregar categoria al equipo';
  readonly submitText = this.data.mode === 'edit' ? 'Guardar cambios' : 'Agregar categoria';

  readonly form = this.formBuilder.nonNullable.group({
    idCategoriaTicket: [this.data.categoriaEquipo?.idCategoriaTicket ?? 0, [Validators.required, Validators.min(1)]],
    activo: [this.data.categoriaEquipo?.activo ?? true]
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
      idCategoriaTicket: value.idCategoriaTicket,
      activo: value.activo
    });
  }
}
