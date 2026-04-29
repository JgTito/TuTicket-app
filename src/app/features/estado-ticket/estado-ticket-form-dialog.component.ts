import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EstadoTicket, EstadoTicketRequest } from './estado-ticket.models';

export interface EstadoTicketFormDialogData {
  mode: 'create' | 'edit';
  estado?: EstadoTicket;
}

@Component({
  selector: 'app-estado-ticket-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './estado-ticket-form-dialog.component.html'
})
export class EstadoTicketFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EstadoTicketFormDialogComponent, EstadoTicketRequest>);
  readonly data = inject<EstadoTicketFormDialogData>(MAT_DIALOG_DATA);

  readonly title = this.data.mode === 'edit' ? 'Editar estado' : 'Nuevo estado';
  readonly submitText = this.data.mode === 'edit' ? 'Guardar cambios' : 'Crear estado';

  readonly form = this.formBuilder.nonNullable.group({
    nombre: [this.data.estado?.nombre ?? '', [Validators.required, Validators.maxLength(100)]],
    descripcion: [this.data.estado?.descripcion ?? '', [Validators.maxLength(300)]],
    esEstadoFinal: [this.data.estado?.esEstadoFinal ?? false],
    orden: [this.data.estado?.orden ?? 1, [Validators.required, Validators.min(1)]],
    activo: [this.data.estado?.activo ?? true]
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
      esEstadoFinal: value.esEstadoFinal,
      orden: value.orden,
      activo: value.activo
    });
  }
}
