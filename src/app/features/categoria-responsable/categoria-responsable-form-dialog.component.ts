import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  CategoriaResponsable,
  CategoriaResponsableRequest,
  CategoriaTicketSelect,
  UsuarioSelect
} from './categoria-responsable.models';

export interface CategoriaResponsableFormDialogData {
  mode: 'create' | 'edit';
  categorias: CategoriaTicketSelect[];
  usuarios: UsuarioSelect[];
  responsable?: CategoriaResponsable;
}

@Component({
  selector: 'app-categoria-responsable-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './categoria-responsable-form-dialog.component.html'
})
export class CategoriaResponsableFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CategoriaResponsableFormDialogComponent, CategoriaResponsableRequest>);
  readonly data = inject<CategoriaResponsableFormDialogData>(MAT_DIALOG_DATA);

  readonly title = this.data.mode === 'edit' ? 'Editar responsable' : 'Nuevo responsable';
  readonly submitText = this.data.mode === 'edit' ? 'Guardar cambios' : 'Crear responsable';

  readonly form = this.formBuilder.nonNullable.group({
    idCategoriaTicket: [this.data.responsable?.idCategoriaTicket ?? 0, [Validators.required, Validators.min(1)]],
    idUsuarioResponsable: [this.data.responsable?.idUsuarioResponsable ?? '', [Validators.required]],
    activo: [this.data.responsable?.activo ?? true]
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
      idCategoriaTicket: value.idCategoriaTicket,
      idUsuarioResponsable: value.idUsuarioResponsable.trim(),
      activo: value.activo
    });
  }
}
