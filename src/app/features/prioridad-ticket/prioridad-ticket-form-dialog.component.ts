import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PrioridadTicket, PrioridadTicketRequest } from './prioridad-ticket.models';

export interface PrioridadTicketFormDialogData {
  mode: 'create' | 'edit';
  prioridad?: PrioridadTicket;
}

@Component({
  selector: 'app-prioridad-ticket-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './prioridad-ticket-form-dialog.component.html'
})
export class PrioridadTicketFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PrioridadTicketFormDialogComponent, PrioridadTicketRequest>);
  readonly data = inject<PrioridadTicketFormDialogData>(MAT_DIALOG_DATA);

  readonly title = this.data.mode === 'edit' ? 'Editar prioridad' : 'Nueva prioridad';
  readonly submitText = this.data.mode === 'edit' ? 'Guardar cambios' : 'Crear prioridad';

  readonly form = this.formBuilder.nonNullable.group({
    nombre: [this.data.prioridad?.nombre ?? '', [Validators.required, Validators.maxLength(100)]],
    descripcion: [this.data.prioridad?.descripcion ?? '', [Validators.maxLength(300)]],
    nivel: [this.data.prioridad?.nivel ?? 1, [Validators.required, Validators.min(1)]],
    activo: [this.data.prioridad?.activo ?? true]
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
      nivel: value.nivel,
      activo: value.activo
    });
  }
}
