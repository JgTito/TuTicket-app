import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface TicketCancelarDialogData {
  codigoTicket: string;
}

export interface TicketCancelarDialogResult {
  comentario: string;
}

@Component({
  selector: 'app-ticket-cancelar-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-cancelar-dialog.component.html'
})
export class TicketCancelarDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TicketCancelarDialogComponent, TicketCancelarDialogResult>);
  readonly data = inject<TicketCancelarDialogData>(MAT_DIALOG_DATA);

  readonly form = this.formBuilder.nonNullable.group({
    comentario: ['', [Validators.required, Validators.maxLength(500)]]
  });

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      comentario: this.form.controls.comentario.value.trim()
    });
  }
}
