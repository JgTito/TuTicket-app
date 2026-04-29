import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsuarioSelect } from './ticket-bandeja.models';

export interface TicketAsignarUsuarioDialogData {
  codigoTicket: string;
  usuarioAsignadoActual: string | null;
  usuarios: UsuarioSelect[];
}

export interface TicketAsignarUsuarioDialogResult {
  idUsuarioAsignado: string;
  comentario: string | null;
}

@Component({
  selector: 'app-ticket-asignar-usuario-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-asignar-usuario-dialog.component.html'
})
export class TicketAsignarUsuarioDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TicketAsignarUsuarioDialogComponent, TicketAsignarUsuarioDialogResult>);
  readonly data = inject<TicketAsignarUsuarioDialogData>(MAT_DIALOG_DATA);

  readonly form = this.formBuilder.nonNullable.group({
    idUsuarioAsignado: [this.data.usuarioAsignadoActual ?? '', [Validators.required]],
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

    const value = this.form.getRawValue();
    this.dialogRef.close({
      idUsuarioAsignado: value.idUsuarioAsignado,
      comentario: value.comentario.trim() || null
    });
  }
}
