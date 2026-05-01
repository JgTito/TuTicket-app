import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  EstadoTicketSelect,
  FlujoEstadoTicket,
  FlujoEstadoTicketRequest
} from './flujo-estado-ticket.models';

export interface FlujoEstadoTicketFormDialogData {
  mode: 'create' | 'edit';
  flujo?: FlujoEstadoTicket;
  estados: EstadoTicketSelect[];
}

@Component({
  selector: 'app-flujo-estado-ticket-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './flujo-estado-ticket-form-dialog.component.html'
})
export class FlujoEstadoTicketFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FlujoEstadoTicketFormDialogComponent, FlujoEstadoTicketRequest>);
  readonly data = inject<FlujoEstadoTicketFormDialogData>(MAT_DIALOG_DATA);

  readonly title = this.data.mode === 'edit' ? 'Editar flujo de estado' : 'Nuevo flujo de estado';
  readonly submitText = this.data.mode === 'edit' ? 'Guardar cambios' : 'Crear flujo';

  readonly form = this.formBuilder.nonNullable.group({
    idEstadoOrigen: [this.data.flujo?.idEstadoOrigen ?? 0, [Validators.required, Validators.min(1)]],
    idEstadoDestino: [this.data.flujo?.idEstadoDestino ?? 0, [Validators.required, Validators.min(1)]],
    requiereComentario: [this.data.flujo?.requiereComentario ?? false],
    activo: [this.data.flujo?.activo ?? true]
  });

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid || this.form.controls.idEstadoOrigen.value === this.form.controls.idEstadoDestino.value) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.getRawValue());
  }
}
