import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoriaTicketOption, PrioridadTicketOption, SlaPolitica, SlaRegla, SlaReglaRequest } from './sla-politica.models';

export interface SlaReglaFormDialogData {
  mode: 'create' | 'edit';
  politica: SlaPolitica;
  prioridades: PrioridadTicketOption[];
  categorias: CategoriaTicketOption[];
  regla?: SlaRegla;
}

@Component({ selector: 'app-sla-regla-form-dialog', imports: [ReactiveFormsModule], templateUrl: './sla-regla-form-dialog.component.html' })
export class SlaReglaFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<SlaReglaFormDialogComponent, SlaReglaRequest>);
  readonly data = inject<SlaReglaFormDialogData>(MAT_DIALOG_DATA);
  readonly title = this.data.mode === 'edit' ? 'Editar regla SLA' : 'Nueva regla SLA';
  readonly submitText = this.data.mode === 'edit' ? 'Guardar cambios' : 'Crear regla';
  readonly form = this.fb.nonNullable.group({
    idPrioridadTicket: [this.data.regla?.idPrioridadTicket ?? 0, [Validators.required, Validators.min(1)]],
    idCategoriaTicket: [this.data.regla?.idCategoriaTicket ?? 0],
    minutosPrimeraRespuesta: [this.data.regla?.minutosPrimeraRespuesta ?? 30, [Validators.required, Validators.min(1)]],
    minutosResolucion: [this.data.regla?.minutosResolucion ?? 240, [Validators.required, Validators.min(1)]],
    activo: [this.data.regla?.activo ?? true]
  });
  close(): void { this.ref.close(); }
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    this.ref.close({
      idSlaPolitica: this.data.politica.idSlaPolitica,
      idPrioridadTicket: value.idPrioridadTicket,
      idCategoriaTicket: value.idCategoriaTicket > 0 ? value.idCategoriaTicket : null,
      minutosPrimeraRespuesta: value.minutosPrimeraRespuesta,
      minutosResolucion: value.minutosResolucion,
      activo: value.activo
    });
  }
}
