import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  CategoriaTicketOption,
  CrearTicketRequest,
  PrioridadTicketOption,
  SubcategoriaTicketOption
} from './ticket-bandeja.models';
import { TicketBandejaService } from './ticket-bandeja.service';

export interface TicketCreateDialogData {
  categorias: CategoriaTicketOption[];
  prioridades: PrioridadTicketOption[];
  subcategorias: SubcategoriaTicketOption[];
}

@Component({
  selector: 'app-ticket-create-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-create-dialog.component.html'
})
export class TicketCreateDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TicketCreateDialogComponent, CrearTicketRequest>);
  private readonly ticketService = inject(TicketBandejaService);
  readonly data = inject<TicketCreateDialogData>(MAT_DIALOG_DATA);
  readonly selectedFiles = signal<File[]>([]);
  readonly subcategorias = signal<SubcategoriaTicketOption[]>(this.data.subcategorias);
  readonly loadingSubcategorias = signal(false);
  readonly fileError = signal<string | null>(null);
  readonly subcategoriaError = signal<string | null>(null);
  readonly maxUploadSize = 25_000_000;

  readonly form = this.formBuilder.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(200)]],
    descripcion: ['', [Validators.required]],
    idCategoriaTicket: [0, [Validators.required, Validators.min(1)]],
    idPrioridadTicket: [0, [Validators.required, Validators.min(1)]],
    idSubcategoriaTicket: [0, [Validators.required, Validators.min(1)]]
  });

  constructor() {
    this.form.controls.idCategoriaTicket.valueChanges.subscribe((idCategoriaTicket) => {
      this.form.controls.idSubcategoriaTicket.setValue(0);
      this.loadSubcategorias(idCategoriaTicket);
    });
  }

  loadSubcategorias(idCategoriaTicket: number): void {
    this.subcategorias.set([]);
    this.subcategoriaError.set(null);

    if (!idCategoriaTicket) {
      return;
    }

    this.loadingSubcategorias.set(true);
    this.ticketService.getSubcategoriasSelect(idCategoriaTicket).subscribe({
      next: (subcategorias) => {
        this.subcategorias.set((subcategorias ?? []).map((subcategoria) => this.normalizeSubcategoria(subcategoria)));
        this.loadingSubcategorias.set(false);
      },
      error: () => {
        this.subcategoriaError.set('No se pudieron cargar las subcategorias.');
        this.loadingSubcategorias.set(false);
      }
    });
  }

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.fileError.set(null);

    const emptyFile = files.find((file) => file.size === 0);
    if (emptyFile) {
      this.selectedFiles.set([]);
      this.fileError.set(`El archivo "${emptyFile.name}" esta vacio.`);
      return;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > this.maxUploadSize) {
      this.selectedFiles.set([]);
      this.fileError.set('La carga completa supera el limite de 25 MB.');
      return;
    }

    this.selectedFiles.set(files);
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid || this.fileError() || this.loadingSubcategorias()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close({
      titulo: value.titulo.trim(),
      descripcion: value.descripcion.trim(),
      idPrioridadTicket: value.idPrioridadTicket,
      idSubcategoriaTicket: value.idSubcategoriaTicket,
      archivos: this.selectedFiles()
    });
  }

  private normalizeSubcategoria(value: unknown): SubcategoriaTicketOption {
    const item = value as Record<string, unknown>;
    return {
      idSubcategoriaTicket: Number(item['idSubcategoriaTicket'] ?? item['IdSubcategoriaTicket'] ?? 0),
      idCategoriaTicket: Number(item['idCategoriaTicket'] ?? item['IdCategoriaTicket'] ?? 0),
      nombreCategoriaTicket: String(item['nombreCategoriaTicket'] ?? item['NombreCategoriaTicket'] ?? ''),
      nombre: String(item['nombre'] ?? item['Nombre'] ?? '')
    };
  }
}
