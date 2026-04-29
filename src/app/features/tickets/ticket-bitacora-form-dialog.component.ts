import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface TicketBitacoraFormDialogData {
  codigoTicket: string;
}

export interface TicketBitacoraFormDialogResult {
  comentario: string;
  esInterno: boolean;
}

@Component({
  selector: 'app-ticket-bitacora-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-bitacora-form-dialog.component.html'
})
export class TicketBitacoraFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TicketBitacoraFormDialogComponent, TicketBitacoraFormDialogResult>);
  readonly data = inject<TicketBitacoraFormDialogData>(MAT_DIALOG_DATA);

  readonly form = this.formBuilder.nonNullable.group({
    comentario: ['', [Validators.required, Validators.maxLength(1000)]],
    esInterno: [false]
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
      comentario: value.comentario.trim(),
      esInterno: value.esInterno
    });
  }
}
