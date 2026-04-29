import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EstadoDisponibleTicket } from './ticket-bandeja.models';

export interface TicketCambiarEstadoDialogData {
  codigoTicket: string;
  estadoActual: string;
  estados: EstadoDisponibleTicket[];
}

export interface TicketCambiarEstadoDialogResult {
  idEstadoTicket: number;
  comentario: string | null;
}

@Component({
  selector: 'app-ticket-cambiar-estado-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-cambiar-estado-dialog.component.html'
})
export class TicketCambiarEstadoDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TicketCambiarEstadoDialogComponent, TicketCambiarEstadoDialogResult>);
  readonly data = inject<TicketCambiarEstadoDialogData>(MAT_DIALOG_DATA);

  readonly form = this.formBuilder.nonNullable.group({
    idEstadoTicket: [0, [Validators.required, Validators.min(1)]],
    comentario: ['', [Validators.maxLength(500)]]
  });

  readonly selectedEstado = computed(() => {
    const idEstadoTicket = this.form.controls.idEstadoTicket.value;
    return this.data.estados.find((estado) => estado.idEstadoTicket === idEstadoTicket) ?? null;
  });

  readonly requiereComentario = computed(() => this.selectedEstado()?.requiereComentario === true);

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    const comentario = this.form.controls.comentario.value.trim();

    if (this.requiereComentario() && !comentario) {
      this.form.controls.comentario.setErrors({ required: true });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      idEstadoTicket: this.form.controls.idEstadoTicket.value,
      comentario: comentario ? comentario : null
    });
  }
}
