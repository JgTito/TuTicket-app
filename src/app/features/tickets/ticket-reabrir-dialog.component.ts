import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface TicketReabrirDialogData {
  codigoTicket: string;
}

export interface TicketReabrirDialogResult {
  comentario: string;
}

@Component({
  selector: 'app-ticket-reabrir-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-reabrir-dialog.component.html'
})
export class TicketReabrirDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TicketReabrirDialogComponent, TicketReabrirDialogResult>);
  readonly data = inject<TicketReabrirDialogData>(MAT_DIALOG_DATA);

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
