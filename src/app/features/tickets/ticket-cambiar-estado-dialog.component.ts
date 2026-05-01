import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { EstadoDisponibleTicket } from './ticket-bandeja.models';
import { TicketBandejaService } from './ticket-bandeja.service';

export interface TicketCambiarEstadoDialogData {
  idTicket: number;
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
  private readonly dialogRef = inject(MatDialogRef<TicketCambiarEstadoDialogComponent, boolean>);
  private readonly ticketService = inject(TicketBandejaService);
  private readonly authService = inject(AuthService);
  readonly data = inject<TicketCambiarEstadoDialogData>(MAT_DIALOG_DATA);
  readonly saving = signal(false);
  readonly backendErrors = signal<string[]>([]);

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
    this.backendErrors.set([]);

    if (this.requiereComentario() && !comentario) {
      this.form.controls.comentario.setErrors({ required: true });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser();

    if (!user?.id) {
      this.backendErrors.set(['No se pudo identificar el usuario autenticado.']);
      return;
    }

    this.saving.set(true);

    this.ticketService
      .cambiarEstado(this.data.idTicket, {
        idEstadoTicket: this.form.controls.idEstadoTicket.value,
        idUsuarioModificacion: user.id,
        comentario: comentario ? comentario : null
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (error: HttpErrorResponse) => this.backendErrors.set(this.getBackendErrors(error))
      });
  }

  private getBackendErrors(error: HttpErrorResponse): string[] {
    const payload = error.error;

    if (typeof payload === 'string' && payload.trim()) {
      return [payload.trim()];
    }

    if (payload?.errors && typeof payload.errors === 'object') {
      const messages = Object.values(payload.errors)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => String(value))
        .filter((value) => value.trim().length > 0);

      if (messages.length > 0) {
        return messages;
      }
    }

    if (payload?.title) {
      return [String(payload.title)];
    }

    if (error.status === 0) return ['No se pudo conectar con la API.'];
    if (error.status === 401 || error.status === 403) return ['Tu sesion no tiene permisos para cambiar el estado.'];
    if (error.status === 404) return ['No se encontro el ticket solicitado.'];

    return ['Ocurrio un error al cambiar el estado.'];
  }
}
