import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoriaTicket, CategoriaTicketRequest } from './categoria-ticket.models';

export interface CategoriaTicketFormDialogData {
  mode: 'create' | 'edit';
  categoria?: CategoriaTicket;
}

@Component({
  selector: 'app-categoria-ticket-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './categoria-ticket-form-dialog.component.html'
})
export class CategoriaTicketFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CategoriaTicketFormDialogComponent, CategoriaTicketRequest>);
  readonly data = inject<CategoriaTicketFormDialogData>(MAT_DIALOG_DATA);

  readonly title = this.data.mode === 'edit' ? 'Editar categoría' : 'Nueva categoría';
  readonly submitText = this.data.mode === 'edit' ? 'Guardar cambios' : 'Crear categoría';

  readonly form = this.formBuilder.nonNullable.group({
    nombre: [this.data.categoria?.nombre ?? '', [Validators.required, Validators.maxLength(150)]],
    descripcion: [this.data.categoria?.descripcion ?? '', [Validators.maxLength(300)]],
    activo: [this.data.categoria?.activo ?? true]
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
