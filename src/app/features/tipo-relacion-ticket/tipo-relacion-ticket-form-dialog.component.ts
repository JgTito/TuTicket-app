import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TipoRelacionTicket, TipoRelacionTicketRequest } from './tipo-relacion-ticket.models';

export interface TipoRelacionTicketFormDialogData {
  mode: 'create' | 'edit';
  tipoRelacion?: TipoRelacionTicket;
}

@Component({
  selector: 'app-tipo-relacion-ticket-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './tipo-relacion-ticket-form-dialog.component.html'
})
export class TipoRelacionTicketFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TipoRelacionTicketFormDialogComponent, TipoRelacionTicketRequest>);
  readonly data = inject<TipoRelacionTicketFormDialogData>(MAT_DIALOG_DATA);

  readonly title = this.data.mode === 'edit' ? 'Editar tipo de relacion' : 'Nuevo tipo de relacion';
  readonly submitText = this.data.mode === 'edit' ? 'Guardar cambios' : 'Crear tipo';

  readonly form = this.formBuilder.nonNullable.group({
    nombre: [this.data.tipoRelacion?.nombre ?? '', [Validators.required, Validators.maxLength(100)]],
    descripcion: [this.data.tipoRelacion?.descripcion ?? '', [Validators.maxLength(250)]],
    activo: [this.data.tipoRelacion?.activo ?? true]
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
