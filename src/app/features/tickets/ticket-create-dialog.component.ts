import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  CategoriaTicketOption,
  CrearTicketRelacionRequest,
  CrearTicketRequest,
  PrioridadTicketOption,
  SubcategoriaTicketOption,
  TicketSelectOption,
  TipoRelacionTicketOption
} from './ticket-bandeja.models';
import { TicketBandejaService } from './ticket-bandeja.service';

interface TicketRelacionDraft extends CrearTicketRelacionRequest {
  codigoTicketRelacionado: string;
  tituloTicketRelacionado: string;
  nombreTipoRelacionTicket: string;
}

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
export class TicketCreateDialogComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TicketCreateDialogComponent, CrearTicketRequest>);
  private readonly ticketService = inject(TicketBandejaService);
  readonly data = inject<TicketCreateDialogData>(MAT_DIALOG_DATA);
  readonly selectedFiles = signal<File[]>([]);
  readonly subcategorias = signal<SubcategoriaTicketOption[]>(this.data.subcategorias);
  readonly ticketsRelacionables = signal<TicketSelectOption[]>([]);
  readonly tiposRelacion = signal<TipoRelacionTicketOption[]>([]);
  readonly relaciones = signal<TicketRelacionDraft[]>([]);
  readonly ticketRelacionadoOptionsOpen = signal(false);
  readonly loadingSubcategorias = signal(false);
  readonly loadingTicketsRelacionables = signal(false);
  readonly loadingTiposRelacion = signal(false);
  readonly fileError = signal<string | null>(null);
  readonly subcategoriaError = signal<string | null>(null);
  readonly relacionError = signal<string | null>(null);
  readonly maxUploadSize = 25_000_000;

  readonly form = this.formBuilder.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(200)]],
    descripcion: ['', [Validators.required]],
    idCategoriaTicket: [0, [Validators.required, Validators.min(1)]],
    idPrioridadTicket: [0, [Validators.required, Validators.min(1)]],
    idSubcategoriaTicket: [0, [Validators.required, Validators.min(1)]],
    ticketRelacionadoTexto: [''],
    idTicketRelacionado: [0],
    idTipoRelacionTicket: [0],
    observacionRelacion: ['', [Validators.maxLength(500)]]
  });

  private ticketSearchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.form.controls.idCategoriaTicket.valueChanges.subscribe((idCategoriaTicket) => {
      this.form.controls.idSubcategoriaTicket.setValue(0);
      this.loadSubcategorias(idCategoriaTicket);
    });
  }

  ngOnInit(): void {
    this.loadTiposRelacion();
    this.loadTicketsRelacionables();
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

  loadTiposRelacion(): void {
    this.loadingTiposRelacion.set(true);
    this.relacionError.set(null);

    this.ticketService.getTiposRelacionSelect().subscribe({
      next: (tiposRelacion) => {
        this.tiposRelacion.set((tiposRelacion ?? []).map((tipoRelacion) => this.normalizeTipoRelacion(tipoRelacion)));
        this.loadingTiposRelacion.set(false);
      },
      error: () => {
        this.relacionError.set('No se pudieron cargar los tipos de relacion.');
        this.loadingTiposRelacion.set(false);
      }
    });
  }

  loadTicketsRelacionables(): void {
    this.loadingTicketsRelacionables.set(true);
    this.relacionError.set(null);

    this.ticketService.getTicketsRelacionables(null, this.form.controls.ticketRelacionadoTexto.value).subscribe({
      next: (tickets) => {
        this.ticketsRelacionables.set((tickets ?? []).map((ticket) => this.normalizeTicketSelect(ticket)));
        this.loadingTicketsRelacionables.set(false);
      },
      error: () => {
        this.relacionError.set('No se pudieron cargar los tickets disponibles para relacionar.');
        this.loadingTicketsRelacionables.set(false);
      }
    });
  }

  searchTicketsRelacionables(): void {
    this.form.controls.idTicketRelacionado.setValue(0);
    this.ticketRelacionadoOptionsOpen.set(true);

    if (this.ticketSearchTimeout) {
      clearTimeout(this.ticketSearchTimeout);
    }

    this.ticketSearchTimeout = setTimeout(() => this.loadTicketsRelacionables(), 250);
  }

  openTicketRelacionadoOptions(): void {
    this.ticketRelacionadoOptionsOpen.set(true);

    if (this.ticketsRelacionables().length === 0) {
      this.loadTicketsRelacionables();
    }
  }

  closeTicketRelacionadoOptions(): void {
    setTimeout(() => this.ticketRelacionadoOptionsOpen.set(false), 150);
  }

  selectTicketRelacionado(ticket: TicketSelectOption): void {
    this.form.controls.idTicketRelacionado.setValue(ticket.idTicket);
    this.form.controls.ticketRelacionadoTexto.setValue(`${ticket.codigo} - ${ticket.titulo}`);
    this.ticketRelacionadoOptionsOpen.set(false);
    this.relacionError.set(null);
  }

  addRelacion(): void {
    this.relacionError.set(null);

    const idTicketRelacionado = Number(this.form.controls.idTicketRelacionado.value);
    const idTipoRelacionTicket = Number(this.form.controls.idTipoRelacionTicket.value);
    const observacion = this.form.controls.observacionRelacion.value.trim() || null;

    if (!idTicketRelacionado || !idTipoRelacionTicket) {
      this.relacionError.set('Selecciona un ticket y un tipo de relacion.');
      return;
    }

    if (this.form.controls.observacionRelacion.invalid) {
      this.form.controls.observacionRelacion.markAsTouched();
      return;
    }

    if (this.relaciones().some((relacion) =>
      relacion.idTicketRelacionado === idTicketRelacionado &&
      relacion.idTipoRelacionTicket === idTipoRelacionTicket)) {
      this.relacionError.set('La misma relacion ya fue agregada.');
      return;
    }

    const ticket = this.ticketsRelacionables().find((item) => item.idTicket === idTicketRelacionado);
    const tipoRelacion = this.tiposRelacion().find((item) => item.idTipoRelacionTicket === idTipoRelacionTicket);

    if (!ticket || !tipoRelacion) {
      this.relacionError.set('No se encontro el ticket o tipo de relacion seleccionado.');
      return;
    }

    this.relaciones.update((relaciones) => [
      ...relaciones,
      {
        idTicketRelacionado,
        idTipoRelacionTicket,
        observacion,
        codigoTicketRelacionado: ticket.codigo,
        tituloTicketRelacionado: ticket.titulo,
        nombreTipoRelacionTicket: tipoRelacion.nombre
      }
    ]);

    this.form.controls.idTicketRelacionado.setValue(0);
    this.form.controls.ticketRelacionadoTexto.setValue('');
    this.form.controls.idTipoRelacionTicket.setValue(0);
    this.form.controls.observacionRelacion.setValue('');
  }

  removeRelacion(index: number): void {
    this.relaciones.update((relaciones) => relaciones.filter((_, itemIndex) => itemIndex !== index));
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
      relaciones: this.relaciones().map((relacion) => ({
        idTicketRelacionado: relacion.idTicketRelacionado,
        idTipoRelacionTicket: relacion.idTipoRelacionTicket,
        observacion: relacion.observacion
      })),
      archivos: this.selectedFiles()
    });
  }

  private normalizeTicketSelect(value: unknown): TicketSelectOption {
    const item = value as Record<string, unknown>;
    return {
      idTicket: Number(item['idTicket'] ?? item['IdTicket'] ?? 0),
      codigo: String(item['codigo'] ?? item['Codigo'] ?? ''),
      titulo: String(item['titulo'] ?? item['Titulo'] ?? ''),
      descripcion: this.pickNullableString(item, 'descripcion', 'Descripcion'),
      nombreEstadoTicket: String(item['nombreEstadoTicket'] ?? item['NombreEstadoTicket'] ?? '')
    };
  }

  private normalizeTipoRelacion(value: unknown): TipoRelacionTicketOption {
    const item = value as Record<string, unknown>;
    return {
      idTipoRelacionTicket: Number(item['idTipoRelacionTicket'] ?? item['IdTipoRelacionTicket'] ?? 0),
      nombre: String(item['nombre'] ?? item['Nombre'] ?? ''),
      descripcion: this.pickNullableString(item, 'descripcion', 'Descripcion')
    };
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

  private pickNullableString(item: Record<string, unknown>, camel: string, pascal: string): string | null {
    const value = item[camel] ?? item[pascal] ?? null;
    return value === null || value === undefined ? null : String(value);
  }
}
