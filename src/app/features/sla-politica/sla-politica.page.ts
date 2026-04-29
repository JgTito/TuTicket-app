import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';
import { SlaPoliticaFormDialogComponent, SlaPoliticaFormDialogData } from './sla-politica-form-dialog.component';
import { SlaPoliticaListComponent } from './sla-politica-list.component';
import {
  CategoriaTicketOption,
  PrioridadTicketOption,
  SlaPolitica,
  SlaPoliticaRequest,
  SlaRegla,
  SlaReglaRequest
} from './sla-politica.models';
import { SlaPoliticaService } from './sla-politica.service';
import { SlaReglaFormDialogComponent, SlaReglaFormDialogData } from './sla-regla-form-dialog.component';
import { SlaReglaListComponent } from './sla-regla-list.component';

@Component({
  selector: 'app-sla-politica-page',
  imports: [SlaPoliticaListComponent, SlaReglaListComponent],
  templateUrl: './sla-politica.page.html'
})
export class SlaPoliticaPage {
  private readonly service = inject(SlaPoliticaService);
  private readonly dialog = inject(MatDialog);

  readonly politicas = signal<SlaPolitica[]>([]);
  readonly reglas = signal<SlaRegla[]>([]);
  readonly prioridades = signal<PrioridadTicketOption[]>([]);
  readonly categorias = signal<CategoriaTicketOption[]>([]);
  readonly selectedPolitica = signal<SlaPolitica | null>(null);
  readonly loadingPoliticas = signal(true);
  readonly loadingReglas = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly incluirPoliticasInactivas = signal(false);
  readonly incluirReglasInactivas = signal(false);
  readonly politicasPagina = signal(1);
  readonly politicasTamanoPagina = signal(5);
  readonly politicasTotalRegistros = signal(0);
  readonly politicasTotalPaginas = signal(0);
  readonly reglasPagina = signal(1);
  readonly reglasTamanoPagina = signal(5);
  readonly reglasTotalRegistros = signal(0);
  readonly reglasTotalPaginas = signal(0);

  constructor() {
    this.loadSelects();
    this.loadPoliticas();
  }

  loadSelects(): void {
    this.service.getPrioridadesSelect().subscribe({
      next: (prioridades) => this.prioridades.set(prioridades ?? []),
      error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
    });
    this.service.getCategoriasSelect().subscribe({
      next: (categorias) => this.categorias.set(categorias ?? []),
      error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
    });
  }

  loadPoliticas(): void {
    this.loadingPoliticas.set(true);
    this.errorMessage.set(null);
    this.service
      .getPoliticas(this.incluirPoliticasInactivas(), this.politicasPagina(), this.politicasTamanoPagina())
      .pipe(finalize(() => this.loadingPoliticas.set(false)))
      .subscribe({
        next: (result) => {
          const datos = result.datos ?? [];
          this.politicas.set(datos);
          this.politicasPagina.set(result.pagina);
          this.politicasTamanoPagina.set(result.tamanoPagina);
          this.politicasTotalRegistros.set(result.totalRegistros);
          this.politicasTotalPaginas.set(result.totalPaginas);
          this.syncSelectedPolitica(datos);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  loadReglas(): void {
    const politica = this.selectedPolitica();
    if (!politica) {
      this.reglas.set([]);
      this.reglasTotalRegistros.set(0);
      this.reglasTotalPaginas.set(0);
      return;
    }

    this.loadingReglas.set(true);
    this.errorMessage.set(null);
    this.service
      .getReglas(politica.idSlaPolitica, this.incluirReglasInactivas(), this.reglasPagina(), this.reglasTamanoPagina())
      .pipe(finalize(() => this.loadingReglas.set(false)))
      .subscribe({
        next: (result) => {
          this.reglas.set(result.datos ?? []);
          this.reglasPagina.set(result.pagina);
          this.reglasTamanoPagina.set(result.tamanoPagina);
          this.reglasTotalRegistros.set(result.totalRegistros);
          this.reglasTotalPaginas.set(result.totalPaginas);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
      });
  }

  selectPolitica(politica: SlaPolitica): void {
    this.selectedPolitica.set(politica);
    this.reglasPagina.set(1);
    this.loadReglas();
  }

  togglePoliticasInactivas(): void {
    this.incluirPoliticasInactivas.update((value) => !value);
    this.politicasPagina.set(1);
    this.loadPoliticas();
  }

  toggleReglasInactivas(): void {
    this.incluirReglasInactivas.update((value) => !value);
    this.reglasPagina.set(1);
    this.loadReglas();
  }

  changePoliticasPage(page: number): void {
    if (page < 1 || page > this.politicasTotalPaginas() || page === this.politicasPagina()) return;
    this.politicasPagina.set(page);
    this.loadPoliticas();
  }

  changePoliticasPageSize(size: number): void {
    this.politicasTamanoPagina.set(size);
    this.politicasPagina.set(1);
    this.loadPoliticas();
  }

  changeReglasPage(page: number): void {
    if (page < 1 || page > this.reglasTotalPaginas() || page === this.reglasPagina()) return;
    this.reglasPagina.set(page);
    this.loadReglas();
  }

  changeReglasPageSize(size: number): void {
    this.reglasTamanoPagina.set(size);
    this.reglasPagina.set(1);
    this.loadReglas();
  }

  openCreatePoliticaModal(): void {
    this.openPoliticaModal({ mode: 'create' });
  }

  openEditPoliticaModal(politica: SlaPolitica): void {
    this.openPoliticaModal({ mode: 'edit', politica });
  }

  openDeletePoliticaModal(politica: SlaPolitica): void {
    this.confirm('Eliminar politica SLA', `La politica "${politica.nombre}" quedara inactiva.`, 'Eliminar', () =>
      this.deletePolitica(politica)
    );
  }

  openCreateReglaModal(): void {
    const politica = this.selectedPolitica();
    if (!politica) return;
    this.openReglaModal({ mode: 'create', politica, prioridades: this.prioridades(), categorias: this.categorias() });
  }

  openEditReglaModal(regla: SlaRegla): void {
    const politica = this.selectedPolitica();
    if (!politica) return;
    this.openReglaModal({ mode: 'edit', politica, regla, prioridades: this.prioridades(), categorias: this.categorias() });
  }

  openDeleteReglaModal(regla: SlaRegla): void {
    this.confirm('Eliminar regla SLA', 'La regla quedara inactiva para esta politica.', 'Eliminar', () => this.deleteRegla(regla));
  }

  private openPoliticaModal(data: SlaPoliticaFormDialogData): void {
    this.dialog
      .open<SlaPoliticaFormDialogComponent, SlaPoliticaFormDialogData, SlaPoliticaRequest>(SlaPoliticaFormDialogComponent, {
        width: '560px',
        data
      })
      .afterClosed()
      .subscribe((request) => {
        if (!request) return;
        data.mode === 'edit' && data.politica
          ? this.updatePolitica(data.politica.idSlaPolitica, request)
          : this.createPolitica(request);
      });
  }

  private openReglaModal(data: SlaReglaFormDialogData): void {
    this.dialog
      .open<SlaReglaFormDialogComponent, SlaReglaFormDialogData, SlaReglaRequest>(SlaReglaFormDialogComponent, {
        width: '620px',
        data
      })
      .afterClosed()
      .subscribe((request) => {
        if (!request) return;
        data.mode === 'edit' && data.regla ? this.updateRegla(data.regla.idSlaRegla, request) : this.createRegla(request);
      });
  }

  private createPolitica(request: SlaPoliticaRequest): void {
    this.saving.set(true);
    this.service.createPolitica(request).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (politica) => {
        this.selectedPolitica.set(politica);
        this.politicasPagina.set(1);
        this.loadPoliticas();
      },
      error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
    });
  }

  private updatePolitica(id: number, request: SlaPoliticaRequest): void {
    this.saving.set(true);
    this.service.updatePolitica(id, request).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => this.loadPoliticas(),
      error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
    });
  }

  private deletePolitica(politica: SlaPolitica): void {
    this.saving.set(true);
    this.service.deletePolitica(politica.idSlaPolitica).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => this.loadPoliticas(),
      error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
    });
  }

  private createRegla(request: SlaReglaRequest): void {
    this.saving.set(true);
    this.service.createRegla(request).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.reglasPagina.set(1);
        this.loadReglas();
      },
      error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
    });
  }

  private updateRegla(id: number, request: SlaReglaRequest): void {
    this.saving.set(true);
    this.service.updateRegla(id, request).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => this.loadReglas(),
      error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
    });
  }

  private deleteRegla(regla: SlaRegla): void {
    this.saving.set(true);
    this.service.deleteRegla(regla.idSlaRegla).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => this.loadReglas(),
      error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error))
    });
  }

  private confirm(title: string, message: string, confirmText: string, action: () => void): void {
    this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
        width: '420px',
        data: { title, message, confirmText, cancelText: 'Cancelar' }
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) action();
      });
  }

  private syncSelectedPolitica(politicas: SlaPolitica[]): void {
    const selected = this.selectedPolitica();
    const current = selected ? politicas.find((p) => p.idSlaPolitica === selected.idSlaPolitica) : null;
    this.selectedPolitica.set(current ?? politicas[0] ?? null);
    this.loadReglas();
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) return 'No se pudo conectar con la API.';
    if (error.status === 401 || error.status === 403) return 'Tu sesion no tiene permisos para administrar SLA.';
    if (error.status === 400) return 'La API rechazo la operacion. Revisa duplicados o referencias inactivas.';
    return 'Ocurrio un error al procesar la operacion.';
  }
}
