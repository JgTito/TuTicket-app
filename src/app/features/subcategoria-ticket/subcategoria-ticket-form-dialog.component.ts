import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoriaTicketSelect, SubcategoriaTicket, SubcategoriaTicketRequest } from './subcategoria-ticket.models';

export interface SubcategoriaTicketFormDialogData {
  mode: 'create' | 'edit';
  categorias: CategoriaTicketSelect[];
  subcategoria?: SubcategoriaTicket;
}

@Component({
  selector: 'app-subcategoria-ticket-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './subcategoria-ticket-form-dialog.component.html'
})
export class SubcategoriaTicketFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<SubcategoriaTicketFormDialogComponent, SubcategoriaTicketRequest>);
  readonly data = inject<SubcategoriaTicketFormDialogData>(MAT_DIALOG_DATA);

  readonly title = this.data.mode === 'edit' ? 'Editar subcategoria' : 'Nueva subcategoria';
  readonly submitText = this.data.mode === 'edit' ? 'Guardar cambios' : 'Crear subcategoria';

  readonly form = this.formBuilder.nonNullable.group({
    idCategoriaTicket: [this.data.subcategoria?.idCategoriaTicket ?? 0, [Validators.required, Validators.min(1)]],
    nombre: [this.data.subcategoria?.nombre ?? '', [Validators.required, Validators.maxLength(150)]],
    descripcion: [this.data.subcategoria?.descripcion ?? '', [Validators.maxLength(300)]],
    activo: [this.data.subcategoria?.activo ?? true]
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
      idCategoriaTicket: value.idCategoriaTicket,
      nombre: value.nombre.trim(),
      descripcion: value.descripcion.trim() ? value.descripcion.trim() : null,
      activo: value.activo
    });
  }
}
