import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { TicketSelectOption, TipoRelacionTicketOption } from './ticket-bandeja.models';
import { TicketBandejaService } from './ticket-bandeja.service';

export interface TicketRelacionFormDialogData {
  idTicket: number;
  codigoTicket: string;
  tiposRelacion: TipoRelacionTicketOption[];
}

export interface TicketRelacionFormDialogResult {
  idTicketRelacionado: number;
  idTipoRelacionTicket: number;
  observacion: string | null;
}

@Component({
  selector: 'app-ticket-relacion-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-relacion-form-dialog.component.html'
})
export class TicketRelacionFormDialogComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly ticketService = inject(TicketBandejaService);
  private readonly dialogRef = inject(MatDialogRef<TicketRelacionFormDialogComponent, TicketRelacionFormDialogResult>);
  readonly data = inject<TicketRelacionFormDialogData>(MAT_DIALOG_DATA);

  readonly tickets = signal<TicketSelectOption[]>([]);
  readonly ticketOptionsOpen = signal(false);
  readonly loadingTickets = signal(false);
  readonly backendErrors = signal<string[]>([]);

  readonly form = this.formBuilder.nonNullable.group({
    ticketRelacionadoTexto: [''],
    idTicketRelacionado: [0, [Validators.required, Validators.min(1)]],
    idTipoRelacionTicket: [0, [Validators.required, Validators.min(1)]],
    observacion: ['', [Validators.maxLength(500)]]
  });

  private ticketSearchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadTickets();
  }

  close(): void {
    this.dialogRef.close();
  }

  loadTickets(): void {
    this.loadingTickets.set(true);
    this.backendErrors.set([]);

    this.ticketService
      .getTicketsRelacionables(this.data.idTicket, this.form.controls.ticketRelacionadoTexto.value)
      .pipe(finalize(() => this.loadingTickets.set(false)))
      .subscribe({
        next: (tickets) => {
          this.tickets.set((tickets ?? []).map((ticket) => this.normalizeTicketSelect(ticket)));
        },
        error: (error: HttpErrorResponse) => this.backendErrors.set(this.getBackendErrors(error))
      });
  }

  searchTickets(): void {
    this.form.controls.idTicketRelacionado.setValue(0);
    this.ticketOptionsOpen.set(true);

    if (this.ticketSearchTimeout) {
      clearTimeout(this.ticketSearchTimeout);
    }

    this.ticketSearchTimeout = setTimeout(() => this.loadTickets(), 250);
  }

  openTicketOptions(): void {
    this.ticketOptionsOpen.set(true);

    if (this.tickets().length === 0) {
      this.loadTickets();
    }
  }

  closeTicketOptions(): void {
    setTimeout(() => this.ticketOptionsOpen.set(false), 150);
  }

  selectTicket(ticket: TicketSelectOption): void {
    this.form.controls.idTicketRelacionado.setValue(ticket.idTicket);
    this.form.controls.ticketRelacionadoTexto.setValue(`${ticket.codigo} - ${ticket.titulo}`);
    this.ticketOptionsOpen.set(false);
  }

  submit(): void {
    this.backendErrors.set([]);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.dialogRef.close({
      idTicketRelacionado: value.idTicketRelacionado,
      idTipoRelacionTicket: value.idTipoRelacionTicket,
      observacion: value.observacion.trim() || null
    });
  }

  private normalizeTicketSelect(value: unknown): TicketSelectOption {
    const item = value as Record<string, unknown>;
    return {
      idTicket: this.pickNumber(item, 'idTicket', 'IdTicket'),
      codigo: this.pickString(item, 'codigo', 'Codigo'),
      titulo: this.pickString(item, 'titulo', 'Titulo'),
      descripcion: this.pickNullableString(item, 'descripcion', 'Descripcion'),
      nombreEstadoTicket: this.pickString(item, 'nombreEstadoTicket', 'NombreEstadoTicket')
    };
  }

  private pickString(item: Record<string, unknown>, camel: string, pascal: string): string {
    return String(item[camel] ?? item[pascal] ?? '');
  }

  private pickNullableString(item: Record<string, unknown>, camel: string, pascal: string): string | null {
    const value = item[camel] ?? item[pascal] ?? null;
    return value === null || value === undefined ? null : String(value);
  }

  private pickNumber(item: Record<string, unknown>, camel: string, pascal: string): number {
    return Number(item[camel] ?? item[pascal] ?? 0);
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
    if (error.status === 401 || error.status === 403) return ['Tu sesion no tiene permisos para buscar tickets relacionados.'];

    return ['Ocurrio un error al buscar tickets relacionados.'];
  }
}
