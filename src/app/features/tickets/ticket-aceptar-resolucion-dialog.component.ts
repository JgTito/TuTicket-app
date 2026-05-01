import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface TicketAceptarResolucionDialogData {
  codigoTicket: string;
}

export interface TicketAceptarResolucionDialogResult {
  comentario: string | null;
}

@Component({
  selector: 'app-ticket-aceptar-resolucion-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-aceptar-resolucion-dialog.component.html'
})
export class TicketAceptarResolucionDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TicketAceptarResolucionDialogComponent, TicketAceptarResolucionDialogResult>);
  readonly data = inject<TicketAceptarResolucionDialogData>(MAT_DIALOG_DATA);

  readonly form = this.formBuilder.nonNullable.group({
    comentario: ['', [Validators.maxLength(500)]]
  });

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const comentario = this.form.controls.comentario.value.trim();
    this.dialogRef.close({
      comentario: comentario || null
    });
  }
}
