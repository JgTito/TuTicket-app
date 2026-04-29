import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SlaPolitica, SlaPoliticaRequest } from './sla-politica.models';

export interface SlaPoliticaFormDialogData { mode: 'create' | 'edit'; politica?: SlaPolitica; }

@Component({ selector: 'app-sla-politica-form-dialog', imports: [ReactiveFormsModule], templateUrl: './sla-politica-form-dialog.component.html' })
export class SlaPoliticaFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<SlaPoliticaFormDialogComponent, SlaPoliticaRequest>);
  readonly data = inject<SlaPoliticaFormDialogData>(MAT_DIALOG_DATA);
  readonly title = this.data.mode === 'edit' ? 'Editar politica SLA' : 'Nueva politica SLA';
  readonly submitText = this.data.mode === 'edit' ? 'Guardar cambios' : 'Crear politica';
  readonly form = this.fb.nonNullable.group({
    nombre: [this.data.politica?.nombre ?? '', [Validators.required, Validators.maxLength(150)]],
    descripcion: [this.data.politica?.descripcion ?? '', [Validators.maxLength(300)]],
    activo: [this.data.politica?.activo ?? true]
  });
  close(): void { this.ref.close(); }
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    this.ref.close({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null, activo: value.activo });
  }
}
